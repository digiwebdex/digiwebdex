import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature, x-idempotency-key',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
};

// Rate limit store (in production, use Redis/KV)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  webhook: { windowMs: 60000, maxRequests: 100 },
  payment: { windowMs: 60000, maxRequests: 10 },
  auth: { windowMs: 900000, maxRequests: 5 },
  api: { windowMs: 60000, maxRequests: 100 },
};

function checkRateLimit(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count };
}

async function verifyWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time comparison
  if (signature.length !== expectedSignature.length) return false;
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return result === 0;
}

// Idempotency store
const idempotencyStore = new Map<string, { result: unknown; timestamp: number }>();

function checkIdempotency(key: string): { isDuplicate: boolean; result?: unknown } {
  const entry = idempotencyStore.get(key);
  if (entry && Date.now() - entry.timestamp < 86400000) {
    return { isDuplicate: true, result: entry.result };
  }
  return { isDuplicate: false };
}

function storeIdempotencyResult(key: string, result: unknown): void {
  idempotencyStore.set(key, { result, timestamp: Date.now() });
  
  // Cleanup old entries
  if (idempotencyStore.size > 1000) {
    const now = Date.now();
    for (const [k, v] of idempotencyStore.entries()) {
      if (now - v.timestamp > 86400000) {
        idempotencyStore.delete(k);
      }
    }
  }
}

async function logSecurityEvent(
  supabase: ReturnType<typeof createClient>,
  event: string,
  details: Record<string, unknown>,
  severity: string
) {
  await supabase.from('audit_logs').insert([{
    action: 'security_event',
    entity_type: 'webhook',
    new_values: { event, severity, ...details, timestamp: new Date().toISOString() },
  }]);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const webhookSecret = Deno.env.get('WEBHOOK_SECRET') || 'default-webhook-secret';

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const rateLimitKey = `webhook:${clientIp}`;

    // Check rate limit
    const { allowed, remaining } = checkRateLimit(rateLimitKey, RATE_LIMITS.webhook);
    if (!allowed) {
      await logSecurityEvent(supabase, 'rate_limit_exceeded', { ip: clientIp, endpoint: 'webhook' }, 'medium');
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '60',
          } 
        }
      );
    }

    // Get request body
    const body = await req.text();
    
    // Verify webhook signature
    const signature = req.headers.get('x-webhook-signature');
    if (signature) {
      const isValid = await verifyWebhookSignature(body, signature, webhookSecret);
      if (!isValid) {
        await logSecurityEvent(supabase, 'invalid_webhook_signature', { ip: clientIp }, 'high');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check idempotency
    const idempotencyKey = req.headers.get('x-idempotency-key');
    if (idempotencyKey) {
      const { isDuplicate, result } = checkIdempotency(idempotencyKey);
      if (isDuplicate) {
        return new Response(
          JSON.stringify({ success: true, cached: true, data: result }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Parse and validate payload
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(body);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { event_type, data } = payload;

    // Process webhook based on event type
    let result: Record<string, unknown> = { processed: true };

    switch (event_type) {
      case 'payment.success':
        // Handle payment success
        if (data && typeof data === 'object' && 'payment_id' in data) {
          const { error } = await supabase
            .from('payments')
            .update({ status: 'success', updated_at: new Date().toISOString() })
            .eq('id', data.payment_id);
          
          result = { event: 'payment.success', processed: !error };
        }
        break;

      case 'payment.failed':
        // Handle payment failure
        if (data && typeof data === 'object' && 'payment_id' in data) {
          const { error } = await supabase
            .from('payments')
            .update({ status: 'failed', updated_at: new Date().toISOString() })
            .eq('id', data.payment_id);
          
          result = { event: 'payment.failed', processed: !error };
        }
        break;

      case 'order.created':
      case 'order.updated':
        // Log order events
        await supabase.from('audit_logs').insert([{
          action: 'webhook_received',
          entity_type: 'order',
          entity_id: (data as Record<string, unknown>)?.order_id as string,
          new_values: { event_type, data },
        }]);
        result = { event: event_type, processed: true };
        break;

      default:
        // Log unknown event types
        await logSecurityEvent(supabase, 'unknown_webhook_event', { event_type }, 'low');
        result = { event: event_type, processed: false, message: 'Unknown event type' };
    }

    // Store idempotency result
    if (idempotencyKey) {
      storeIdempotencyResult(idempotencyKey, result);
    }

    // Log successful webhook
    await supabase.from('audit_logs').insert([{
      action: 'webhook_processed',
      entity_type: 'webhook',
      new_values: { event_type, success: true },
      ip_address: clientIp,
    }]);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Webhook handler error:', error);
    
    await supabase.from('audit_logs').insert([{
      action: 'webhook_error',
      entity_type: 'webhook',
      new_values: { error: error.message },
    }]);

    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
