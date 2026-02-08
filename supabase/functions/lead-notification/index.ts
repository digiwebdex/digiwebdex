import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Helper to get admin contact from settings
async function getAdminContact(supabase: ReturnType<typeof createClient>) {
  const { data } = await supabase
    .from('system_settings')
    .select('key, value')
    .in('key', ['admin_notification_phone', 'admin_notification_email', 'company_phone']);

  const settings = new Map<string, string>();
  data?.forEach((s: { key: string; value: string }) => {
    const val = typeof s.value === 'string' ? s.value.replace(/^"|"$/g, '') : String(s.value);
    settings.set(s.key, val);
  });

  return {
    phone: settings.get('admin_notification_phone')?.replace(/[^0-9]/g, '') || '8801674533303',
    email: settings.get('admin_notification_email') || 'digiwebdex@gmail.com',
    hotline: settings.get('company_phone')?.replace(/[^0-9]/g, '') || '01674533303',
  };
}

interface LeadNotificationRequest {
  lead_id: string;
  name: string;
  phone: string;
  email?: string;
  service_interest?: string;
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

    const data: LeadNotificationRequest = await req.json();
    console.log('Lead notification request:', data);

    if (!data.phone || !data.name) {
      return new Response(
        JSON.stringify({ error: 'Name and phone are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get admin contact from settings
    const adminContact = await getAdminContact(supabase);

    // Normalize phone number
    let customerPhone = data.phone.replace(/[^0-9]/g, '');
    if (!customerPhone.startsWith('880')) {
      if (customerPhone.startsWith('0')) {
        customerPhone = '88' + customerPhone;
      } else {
        customerPhone = '880' + customerPhone;
      }
    }

    const serviceLabels: Record<string, string> = {
      'domain-hosting': 'ডোমেইন ও হোস্টিং',
      'web-development': 'ওয়েব ডেভেলপমেন্ট',
      'software': 'সফটওয়্যার',
      'digital-marketing': 'ডিজিটাল মার্কেটিং',
    };

    const serviceLabel = data.service_interest ? (serviceLabels[data.service_interest] || data.service_interest) : 'সার্ভিস';

    // 1. Send SMS to customer (confirmation)
    const customerMessage = `ধন্যবাদ ${data.name}! Digiwebdex টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে। ${serviceLabel} সার্ভিসে আমাদের সাথে থাকুন। হটলাইন: ${adminContact.hotline}`;
    
    try {
      await supabase.functions.invoke('send-sms', {
        body: {
          phone: customerPhone,
          message: customerMessage,
          type: 'customer',
          metadata: { lead_id: data.lead_id },
        },
      });
      console.log('Customer SMS sent');
    } catch (smsError) {
      console.error('Customer SMS error:', smsError);
    }

    // 2. Send SMS to admin (new lead alert)
    const adminMessage = `🔔 নতুন লিড! নাম: ${data.name}, ফোন: ${data.phone}, সার্ভিস: ${serviceLabel}. দ্রুত যোগাযোগ করুন!`;
    
    try {
      await supabase.functions.invoke('send-sms', {
        body: {
          phone: adminContact.phone,
          message: adminMessage,
          type: 'admin',
          metadata: { lead_id: data.lead_id },
        },
      });
      console.log('Admin SMS sent');
    } catch (smsError) {
      console.error('Admin SMS error:', smsError);
    }

    // 3. Log notification in database
    await supabase.from('notifications').insert({
      recipient: customerPhone,
      notification_type: 'sms',
      subject: 'lead_confirmation',
      body: customerMessage,
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: {
        lead_id: data.lead_id,
        type: 'lead_notification',
        service_interest: data.service_interest,
      },
    });

    // 4. Log admin notification
    await supabase.from('notifications').insert({
      recipient: adminContact.phone,
      notification_type: 'sms',
      subject: 'new_lead_alert',
      body: adminMessage,
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: {
        lead_id: data.lead_id,
        type: 'admin_alert',
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notifications sent successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('Lead notification error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
