import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit configuration
const rateLimitStore = new Map<string, { count: number; resetTime: number; blocked: boolean }>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs: number;
}

const ENDPOINT_LIMITS: Record<string, RateLimitConfig> = {
  login: { windowMs: 900000, maxRequests: 5, blockDurationMs: 1800000 },
  register: { windowMs: 3600000, maxRequests: 3, blockDurationMs: 7200000 },
  password_reset: { windowMs: 3600000, maxRequests: 3, blockDurationMs: 7200000 },
  payment: { windowMs: 60000, maxRequests: 10, blockDurationMs: 300000 },
  api: { windowMs: 60000, maxRequests: 100, blockDurationMs: 60000 },
  search: { windowMs: 60000, maxRequests: 30, blockDurationMs: 120000 },
};

function checkRateLimit(
  identifier: string,
  endpoint: string
): { allowed: boolean; remaining: number; resetIn: number; blocked: boolean } {
  const config = ENDPOINT_LIMITS[endpoint] || ENDPOINT_LIMITS.api;
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();
  
  const entry = rateLimitStore.get(key);

  // Check if blocked
  if (entry?.blocked && entry.resetTime > now) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
      blocked: true,
    };
  }

  // Reset if window expired
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
      blocked: false,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: Math.ceil(config.windowMs / 1000),
      blocked: false,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    // Block the user
    entry.blocked = true;
    entry.resetTime = now + config.blockDurationMs;
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil(config.blockDurationMs / 1000),
      blocked: true,
    };
  }

  // Increment counter
  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
    blocked: false,
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime && !entry.blocked) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { action, identifier, endpoint } = await req.json();

    if (!identifier || !endpoint) {
      return new Response(
        JSON.stringify({ error: 'Missing identifier or endpoint' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (action) {
      case 'check': {
        const result = checkRateLimit(identifier, endpoint);
        
        // Log if blocked
        if (result.blocked) {
          await supabase.from('audit_logs').insert([{
            action: 'rate_limit_exceeded',
            entity_type: 'rate_limit',
            new_values: {
              identifier: identifier.substring(0, 16),
              endpoint,
              blocked: true,
              timestamp: new Date().toISOString(),
            },
          }]);
        }

        return new Response(
          JSON.stringify(result),
          {
            status: result.allowed ? 200 : 429,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.resetIn.toString(),
              ...(result.blocked ? { 'Retry-After': result.resetIn.toString() } : {}),
            },
          }
        );
      }

      case 'reset': {
        // Admin only - reset rate limit for identifier
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);

        if (!user) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if admin
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        if (!roles) {
          return new Response(
            JSON.stringify({ error: 'Forbidden' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Reset rate limit
        const key = `${endpoint}:${identifier}`;
        rateLimitStore.delete(key);

        await supabase.from('audit_logs').insert([{
          action: 'admin_action',
          entity_type: 'rate_limit',
          user_id: user.id,
          new_values: {
            action: 'rate_limit_reset',
            identifier: identifier.substring(0, 16),
            endpoint,
          },
        }]);

        return new Response(
          JSON.stringify({ success: true, message: 'Rate limit reset' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'status': {
        // Get current rate limit status
        const limits = Object.entries(ENDPOINT_LIMITS).map(([name, config]) => ({
          endpoint: name,
          windowMs: config.windowMs,
          maxRequests: config.maxRequests,
          blockDurationMs: config.blockDurationMs,
        }));

        return new Response(
          JSON.stringify({ endpoints: limits, storeSize: rateLimitStore.size }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Rate limiter error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
