import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// BulkSMSBD API Configuration
const SMS_API_URL = 'http://bulksmsbd.net/api/smsapi';
const ADMIN_PHONE = '8801674533303';

// Rate limiting: Track SMS sent per phone number
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // Max SMS per phone per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

// Deduplication: Track recent messages to prevent duplicates
const recentMessages = new Map<string, number>();
const DEDUP_WINDOW = 5 * 60 * 1000; // 5 minutes

interface SendSMSRequest {
  phone: string;
  message: string;
  type?: 'customer' | 'admin' | 'system';
  metadata?: Record<string, unknown>;
}

function validatePhoneNumber(phone: string): { valid: boolean; normalized: string } {
  // Remove all non-digits
  let normalized = phone.replace(/[^0-9]/g, '');
  
  // Handle different formats
  if (normalized.startsWith('0')) {
    normalized = '88' + normalized;
  } else if (!normalized.startsWith('880')) {
    normalized = '880' + normalized;
  }
  
  // Validate Bangladesh phone number format: 8801XXXXXXXXX (13 digits)
  const isValid = /^8801[3-9]\d{8}$/.test(normalized);
  
  return { valid: isValid, normalized };
}

function checkRateLimit(phone: string): boolean {
  const now = Date.now();
  const record = rateLimitCache.get(phone);
  
  if (!record || now > record.resetTime) {
    rateLimitCache.set(phone, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

function checkDuplicate(phone: string, message: string): boolean {
  const key = `${phone}:${message}`;
  const now = Date.now();
  const lastSent = recentMessages.get(key);
  
  if (lastSent && now - lastSent < DEDUP_WINDOW) {
    return true; // Is duplicate
  }
  
  recentMessages.set(key, now);
  
  // Clean up old entries periodically
  if (recentMessages.size > 1000) {
    for (const [k, v] of recentMessages.entries()) {
      if (now - v > DEDUP_WINDOW) {
        recentMessages.delete(k);
      }
    }
  }
  
  return false;
}

async function sendSMS(phone: string, message: string): Promise<{ success: boolean; response?: unknown; error?: string }> {
  const apiKey = Deno.env.get('SMS_API_KEY');
  const senderId = Deno.env.get('SMS_SENDER_ID');
  
  if (!apiKey || !senderId) {
    console.error('SMS API credentials not configured');
    return { success: false, error: 'SMS API credentials not configured' };
  }
  
  // Validate phone number
  const { valid, normalized } = validatePhoneNumber(phone);
  if (!valid) {
    console.error('Invalid phone number:', phone);
    return { success: false, error: 'Invalid phone number format' };
  }
  
  // Check rate limit
  if (!checkRateLimit(normalized)) {
    console.warn('Rate limit exceeded for:', normalized);
    return { success: false, error: 'Rate limit exceeded' };
  }
  
  // Check for duplicate
  if (checkDuplicate(normalized, message)) {
    console.warn('Duplicate SMS prevented for:', normalized);
    return { success: false, error: 'Duplicate message prevented' };
  }
  
  // URL encode the message
  const encodedMessage = encodeURIComponent(message);
  
  // Build API URL with GET parameters
  const url = `${SMS_API_URL}?api_key=${encodeURIComponent(apiKey)}&type=text&number=${normalized}&senderid=${encodeURIComponent(senderId)}&message=${encodedMessage}`;
  
  try {
    console.log('Sending SMS to:', normalized);
    
    const response = await fetch(url, {
      method: 'GET',
    });
    
    const responseText = await response.text();
    console.log('BulkSMSBD API response:', responseText);
    
    // Try to parse as JSON
    let responseData: unknown;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }
    
    // BulkSMSBD returns response_code: 202 for success
    const isSuccess = response.ok || 
      (typeof responseData === 'object' && responseData !== null && 
       ('response_code' in responseData && (responseData as Record<string, unknown>).response_code === 202));
    
    return { 
      success: isSuccess, 
      response: responseData,
      error: isSuccess ? undefined : 'SMS API returned error'
    };
  } catch (error) {
    console.error('SMS API error:', error);
    return { success: false, error: (error as Error).message };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const data: SendSMSRequest = await req.json();
    console.log('SMS request received:', { phone: data.phone, type: data.type });

    if (!data.phone || !data.message) {
      return new Response(
        JSON.stringify({ error: 'Phone and message are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Send the SMS
    const result = await sendSMS(data.phone, data.message);

    // Log to notifications table
    const { valid, normalized } = validatePhoneNumber(data.phone);
    await supabase.from('notifications').insert({
      recipient: normalized || data.phone,
      notification_type: 'sms',
      subject: data.type || 'sms',
      body: data.message,
      status: result.success ? 'sent' : 'failed',
      sent_at: result.success ? new Date().toISOString() : null,
      error_message: result.error || null,
      metadata: {
        type: data.type,
        api_response: result.response,
        ...data.metadata,
      },
    });

    return new Response(
      JSON.stringify({
        success: result.success,
        message: result.success ? 'SMS sent successfully' : result.error,
        response: result.response,
      }),
      { 
        status: result.success ? 200 : 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Send SMS error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
