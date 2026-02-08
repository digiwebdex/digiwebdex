import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { ticketId, type } = await req.json();

    if (!ticketId || !type) {
      return new Response(
        JSON.stringify({ error: "Missing ticketId or type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch ticket with user info
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (ticketError || !ticket) {
      throw new Error("Ticket not found");
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("user_id", ticket.user_id)
      .single();

    // Admin contact details
    const adminPhone = "+8801674533303";
    const adminEmail = "digiwebdex@gmail.com";

    // Prepare notification based on type
    let notifications: {
      type: string;
      recipient: string;
      subject: string;
      body: string;
    }[] = [];

    const smsApiKey = Deno.env.get("SMS_API_KEY");
    const smsSenderId = Deno.env.get("SMS_SENDER_ID") || "DIGIWEBDEX";

    switch (type) {
      case "ticket_created":
        // Notify admin about new ticket
        notifications = [
          {
            type: "sms",
            recipient: adminPhone,
            subject: "New Support Ticket",
            body: `New ticket #${ticket.ticket_number}: ${ticket.subject}. Priority: ${ticket.priority}. Category: ${ticket.category}.`,
          },
          {
            type: "email",
            recipient: adminEmail,
            subject: `New Support Ticket: ${ticket.ticket_number}`,
            body: `A new support ticket has been created.\n\nTicket: ${ticket.ticket_number}\nSubject: ${ticket.subject}\nPriority: ${ticket.priority}\nCategory: ${ticket.category}\nCustomer: ${profile?.full_name || "Unknown"}\n\nDescription:\n${ticket.description || "No description provided"}`,
          },
        ];

        // Confirm to customer
        if (profile?.phone) {
          notifications.push({
            type: "sms",
            recipient: profile.phone,
            subject: "Ticket Created",
            body: `Your support ticket #${ticket.ticket_number} has been created. We will respond shortly. - Digiwebdex`,
          });
        }
        break;

      case "ticket_reply":
        // Notify customer about staff reply
        if (profile?.phone) {
          notifications.push({
            type: "sms",
            recipient: profile.phone,
            subject: "Ticket Update",
            body: `Your ticket #${ticket.ticket_number} has been updated. Please check your dashboard for the response. - Digiwebdex`,
          });
        }
        break;

      case "ticket_closed":
        // Send feedback request to customer
        if (profile?.phone) {
          notifications.push({
            type: "sms",
            recipient: profile.phone,
            subject: "Ticket Closed",
            body: `Your ticket #${ticket.ticket_number} has been closed. We hope we resolved your issue. Please rate our support in your dashboard. - Digiwebdex`,
          });
        }
        break;
    }

    // Send notifications
    for (const notif of notifications) {
      if (notif.type === "sms" && smsApiKey) {
        try {
          // BulkSMSBD API
          const smsUrl = `http://bulksmsbd.net/api/smsapi?api_key=${smsApiKey}&type=text&number=${encodeURIComponent(
            notif.recipient
          )}&senderid=${smsSenderId}&message=${encodeURIComponent(notif.body)}`;

          await fetch(smsUrl);
          console.log(`SMS sent to ${notif.recipient}`);
        } catch (smsErr) {
          console.error("SMS error:", smsErr);
        }
      }

      // Log notification to database
      await supabase.from("notifications").insert({
        user_id: ticket.user_id,
        notification_type: notif.type === "sms" ? "sms" : "email",
        recipient: notif.recipient,
        subject: notif.subject,
        body: notif.body,
        status: "sent",
        sent_at: new Date().toISOString(),
        metadata: { ticket_id: ticketId, notification_trigger: type },
      });
    }

    // Log ticket action
    await supabase.from("ticket_logs").insert({
      ticket_id: ticketId,
      action: `notification_${type}`,
      details: { notifications_sent: notifications.length },
    });

    return new Response(
      JSON.stringify({ success: true, notifications_sent: notifications.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Ticket notification error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
