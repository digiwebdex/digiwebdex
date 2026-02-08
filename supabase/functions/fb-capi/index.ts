import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SHA256 hash function
async function sha256Hash(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Normalize phone number (E.164 without +)
function normalizePhone(phone: string): string {
  let normalized = phone.replace(/[^0-9]/g, '');
  
  if (normalized.startsWith('0')) {
    normalized = '880' + normalized.substring(1);
  } else if (!normalized.startsWith('880')) {
    normalized = '880' + normalized;
  }
  
  return normalized;
}

interface UserData {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  country?: string;
  external_id?: string;
  fbp?: string;
  fbc?: string;
  client_ip_address?: string;
  client_user_agent?: string;
}

interface CustomData {
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  [key: string]: unknown;
}

interface FBEventRequest {
  event_name: string;
  event_id: string;
  event_source_url?: string;
  user_data?: UserData;
  custom_data?: CustomData;
  action_source?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Facebook settings from system_settings
    const { data: settings } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['fb_pixel_id', 'fb_access_token', 'fb_capi_enabled', 'fb_test_event_code']);

    const settingsMap = new Map<string, string>();
    settings?.forEach(s => {
      const val = typeof s.value === 'string' ? s.value.replace(/^"|"$/g, '') : String(s.value);
      settingsMap.set(s.key, val);
    });

    const pixelId = settingsMap.get('fb_pixel_id');
    const accessToken = settingsMap.get('fb_access_token');
    const capiEnabled = settingsMap.get('fb_capi_enabled') === 'true';
    const testEventCode = settingsMap.get('fb_test_event_code');

    if (!capiEnabled) {
      return new Response(
        JSON.stringify({ success: false, message: 'CAPI is disabled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!pixelId || !accessToken) {
      console.error('Facebook Pixel ID or Access Token not configured');
      return new Response(
        JSON.stringify({ success: false, message: 'Facebook tracking not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: FBEventRequest = await req.json();
    const { event_name, event_id, event_source_url, user_data, custom_data, action_source = 'website' } = body;

    if (!event_name || !event_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields: event_name, event_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client IP and user agent from request headers
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('cf-connecting-ip') 
      || req.headers.get('x-real-ip')
      || '';
    const userAgent = req.headers.get('user-agent') || '';

    // Build hashed user data for Advanced Matching
    const hashedUserData: Record<string, string | undefined> = {};

    if (user_data?.email) {
      hashedUserData.em = await sha256Hash(user_data.email.toLowerCase().trim());
    }
    if (user_data?.phone) {
      hashedUserData.ph = await sha256Hash(normalizePhone(user_data.phone));
    }
    if (user_data?.first_name) {
      hashedUserData.fn = await sha256Hash(user_data.first_name.toLowerCase().trim());
    }
    if (user_data?.last_name) {
      hashedUserData.ln = await sha256Hash(user_data.last_name.toLowerCase().trim());
    }
    if (user_data?.city) {
      hashedUserData.ct = await sha256Hash(user_data.city.toLowerCase().trim());
    }
    if (user_data?.country) {
      hashedUserData.country = await sha256Hash(user_data.country.toLowerCase().trim());
    }
    if (user_data?.external_id) {
      hashedUserData.external_id = await sha256Hash(user_data.external_id);
    }

    // Include first-party cookies for better matching
    if (user_data?.fbp) {
      hashedUserData.fbp = user_data.fbp;
    }
    if (user_data?.fbc) {
      hashedUserData.fbc = user_data.fbc;
    }

    // Add IP and user agent
    hashedUserData.client_ip_address = clientIp;
    hashedUserData.client_user_agent = userAgent;

    // Build event data
    const eventData = {
      event_name,
      event_id, // Same as client-side for deduplication
      event_time: Math.floor(Date.now() / 1000),
      event_source_url,
      action_source,
      user_data: hashedUserData,
      custom_data: custom_data ? {
        ...custom_data,
        currency: custom_data.currency || 'BDT',
      } : undefined,
    };

    // Build request to Facebook Conversions API
    const fbApiUrl = `https://graph.facebook.com/v18.0/${pixelId}/events`;
    
    const fbPayload: Record<string, unknown> = {
      data: [eventData],
      access_token: accessToken,
    };

    // Add test event code if configured (for testing in Events Manager)
    if (testEventCode) {
      fbPayload.test_event_code = testEventCode;
    }

    // Send to Facebook
    const fbResponse = await fetch(fbApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fbPayload),
    });

    const fbResult = await fbResponse.json();

    // Log the event
    const logStatus = fbResponse.ok ? 'sent' : 'failed';
    await supabase.from('tracking_event_logs').insert({
      event_name,
      event_id,
      source: 'capi',
      user_data: hashedUserData as Record<string, never>,
      custom_data: custom_data as Record<string, never>,
      status: logStatus,
      error_message: fbResponse.ok ? null : JSON.stringify(fbResult),
      response_data: fbResult as Record<string, never>,
    });

    if (!fbResponse.ok) {
      console.error('Facebook CAPI error:', fbResult);
      return new Response(
        JSON.stringify({ success: false, error: fbResult }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, events_received: fbResult.events_received }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('FB CAPI Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
