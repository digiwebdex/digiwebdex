import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ADMIN_PHONE = '8801674533303';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Running lead follow-up cron job...');

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    // Get leads that need 24-hour follow-up (new leads older than 24h, follow_up_count = 0)
    const { data: leads24h, error: error24h } = await supabase
      .from('leads')
      .select('*')
      .eq('status', 'new')
      .eq('follow_up_count', 0)
      .lt('created_at', twentyFourHoursAgo.toISOString());

    if (error24h) {
      console.error('Error fetching 24h leads:', error24h);
    } else {
      console.log(`Found ${leads24h?.length || 0} leads for 24h follow-up`);

      for (const lead of leads24h || []) {
        // Normalize phone
        let phone = lead.phone.replace(/[^0-9]/g, '');
        if (!phone.startsWith('880')) {
          phone = phone.startsWith('0') ? '88' + phone : '880' + phone;
        }

        // Send follow-up SMS to customer
        const customerMessage = `হ্যালো ${lead.name}! Digiwebdex থেকে রিমাইন্ডার। আপনি সম্প্রতি আমাদের সার্ভিসে আগ্রহ দেখিয়েছিলেন। কোনো প্রশ্ন থাকলে কল করুন: 01674533303`;

        try {
          await supabase.functions.invoke('send-sms', {
            body: {
              phone,
              message: customerMessage,
              type: 'system',
              metadata: { lead_id: lead.id, follow_up: '24h' },
            },
          });
          console.log(`24h follow-up sent to ${lead.phone}`);
        } catch (smsError) {
          console.error(`SMS error for ${lead.phone}:`, smsError);
        }

        // Update lead follow-up count
        await supabase
          .from('leads')
          .update({
            last_follow_up_at: new Date().toISOString(),
            follow_up_count: 1,
          })
          .eq('id', lead.id);

        // Log the follow-up
        await supabase.from('lead_logs').insert({
          lead_id: lead.id,
          action: 'auto_follow_up_24h',
          details: { message_sent: true },
        });
      }
    }

    // Get leads that need 3-day follow-up (new leads older than 3 days, follow_up_count = 1)
    const { data: leads3d, error: error3d } = await supabase
      .from('leads')
      .select('*')
      .eq('status', 'new')
      .eq('follow_up_count', 1)
      .lt('created_at', threeDaysAgo.toISOString());

    if (error3d) {
      console.error('Error fetching 3d leads:', error3d);
    } else {
      console.log(`Found ${leads3d?.length || 0} leads for 3-day follow-up`);

      for (const lead of leads3d || []) {
        // Normalize phone
        let phone = lead.phone.replace(/[^0-9]/g, '');
        if (!phone.startsWith('880')) {
          phone = phone.startsWith('0') ? '88' + phone : '880' + phone;
        }

        // Send final follow-up SMS
        const finalMessage = `${lead.name}, এটি Digiwebdex থেকে শেষ রিমাইন্ডার! আপনার প্রজেক্ট নিয়ে আলোচনা করতে আজই কল করুন: 01674533303। স্পেশাল অফার সীমিত সময়ের জন্য!`;

        try {
          await supabase.functions.invoke('send-sms', {
            body: {
              phone,
              message: finalMessage,
              type: 'system',
              metadata: { lead_id: lead.id, follow_up: '3d_final' },
            },
          });
          console.log(`3-day follow-up sent to ${lead.phone}`);
        } catch (smsError) {
          console.error(`SMS error for ${lead.phone}:`, smsError);
        }

        // Update lead follow-up count
        await supabase
          .from('leads')
          .update({
            last_follow_up_at: new Date().toISOString(),
            follow_up_count: 2,
          })
          .eq('id', lead.id);

        // Log the follow-up
        await supabase.from('lead_logs').insert({
          lead_id: lead.id,
          action: 'auto_follow_up_3d_final',
          details: { message_sent: true },
        });

        // Notify admin about unconverted lead
        const adminAlert = `⚠️ লিড কনভার্ট হয়নি: ${lead.name} (${lead.phone}) - ৩ দিন হয়ে গেছে। ম্যানুয়ালি ফলো-আপ করুন।`;
        
        try {
          await supabase.functions.invoke('send-sms', {
            body: {
              phone: ADMIN_PHONE,
              message: adminAlert,
              type: 'admin',
              metadata: { lead_id: lead.id, alert: 'unconverted_3d' },
            },
          });
        } catch (smsError) {
          console.error('Admin alert error:', smsError);
        }
      }
    }

    const processedCount = (leads24h?.length || 0) + (leads3d?.length || 0);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedCount,
        details: {
          '24h_followups': leads24h?.length || 0,
          '3d_followups': leads3d?.length || 0,
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('Lead follow-up cron error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
