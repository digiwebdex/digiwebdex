import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Admin contact info
const ADMIN_EMAIL = "digiwebdex@gmail.com";
const ADMIN_PHONE = "8801674533303";
const WHATSAPP_NUMBER = "8801674533303";

const SMS_API_URL = "http://bulksmsbd.net/api/smsapi";

const REMINDER_DAYS = [30, 15, 7, 1];
const INVOICE_GENERATION_DAYS = 30;
const GRACE_PERIOD_DAYS = 7;

interface ExpiringEntity {
  id: string;
  type: "hosting" | "domain";
  userId: string;
  entityName: string;
  expiryDate: string;
  daysUntilExpiry: number;
  renewalAmount: number;
}

interface CustomerInfo {
  full_name: string;
  phone: string | null;
  email: string | null;
}

// ─── SMS Helper ───
function normalizePhone(phone: string): string {
  let n = phone.replace(/[^0-9]/g, "");
  if (n.startsWith("0")) n = "88" + n;
  else if (!n.startsWith("880")) n = "880" + n;
  return n;
}

function isValidBDPhone(phone: string): boolean {
  return /^8801[3-9]\d{8}$/.test(normalizePhone(phone));
}

async function sendSMS(
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string; response?: unknown }> {
  const apiKey = Deno.env.get("SMS_API_KEY");
  const senderId = Deno.env.get("SMS_SENDER_ID");
  if (!apiKey || !senderId)
    return { success: false, error: "SMS not configured" };

  const normalized = normalizePhone(phone);
  if (!isValidBDPhone(phone))
    return { success: false, error: "Invalid phone" };

  const url = `${SMS_API_URL}?api_key=${encodeURIComponent(apiKey)}&type=text&number=${normalized}&senderid=${encodeURIComponent(senderId)}&message=${encodeURIComponent(message)}`;

  try {
    const res = await fetch(url, { method: "GET" });
    const text = await res.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    const ok = res.ok || (typeof data === "object" && data !== null && "response_code" in data && (data as any).response_code === 202);
    return { success: ok, response: data };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Main Handler ───
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const result = {
      processed: 0,
      reminders: 0,
      smsSent: 0,
      whatsappSent: 0,
      emailSent: 0,
      invoicesGenerated: 0,
      suspensions: 0,
      errors: [] as string[],
      timestamp: new Date().toISOString(),
    };

    console.log("[Renewal Cron] Starting...");

    // 1. Process expiring hosting
    const expiringHosting = await getExpiringHosting(supabase);
    for (const entity of expiringHosting) {
      try {
        await processEntity(supabase, entity, result);
        result.processed++;
      } catch (e) {
        result.errors.push(`Hosting ${entity.id}: ${(e as Error).message}`);
      }
    }

    // 2. Process expiring domains
    const expiringDomains = await getExpiringDomains(supabase);
    for (const entity of expiringDomains) {
      try {
        await processEntity(supabase, entity, result);
        result.processed++;
      } catch (e) {
        result.errors.push(`Domain ${entity.id}: ${(e as Error).message}`);
      }
    }

    // 3. Process suspensions
    await processSuspensions(supabase, result);

    // 4. Log run
    await supabase.from("audit_logs").insert({
      action: "renewal_cron_run",
      entity_type: "system",
      new_values: result,
    });

    console.log("[Renewal Cron] Done:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Renewal Cron] Error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ─── Get customer info ───
async function getCustomerInfo(supabase: any, userId: string): Promise<CustomerInfo> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("user_id", userId)
    .single();

  // Get email from auth
  const { data: { user } } = await supabase.auth.admin.getUserById(userId);

  return {
    full_name: profile?.full_name || "Customer",
    phone: profile?.phone || null,
    email: user?.email || null,
  };
}

// ─── Send multi-channel renewal alert ───
async function sendRenewalAlerts(
  supabase: any,
  entity: ExpiringEntity,
  customer: CustomerInfo,
  daysRemaining: number,
  result: any
) {
  const typeLabel = entity.type === "hosting" ? "হোস্টিং" : "ডোমেইন";
  const typeEn = entity.type === "hosting" ? "Hosting" : "Domain";
  const urgency = daysRemaining <= 3 ? "🚨" : daysRemaining <= 7 ? "⚠️" : "🔔";

  const notifications: any[] = [];

  // --- CUSTOMER SMS ---
  if (customer.phone && isValidBDPhone(customer.phone)) {
    const smsMsg = `DigiWebDex: আপনার ${typeLabel} "${entity.entityName}" এর মেয়াদ ${daysRemaining} দিন পর (${entity.expiryDate}) শেষ হবে। রিনিউ করতে যোগাযোগ করুন: 01674533303`;
    const smsResult = await sendSMS(customer.phone, smsMsg);
    notifications.push({
      user_id: entity.userId,
      recipient: normalizePhone(customer.phone),
      notification_type: "sms",
      subject: `${typeEn} Renewal Reminder`,
      body: smsMsg,
      status: smsResult.success ? "sent" : "failed",
      sent_at: smsResult.success ? new Date().toISOString() : null,
      error_message: smsResult.error || null,
      metadata: { type: "renewal_customer_sms", entity_type: entity.type, entity_id: entity.id, days: daysRemaining, api_response: smsResult.response },
    });
    if (smsResult.success) result.smsSent++;
  }

  // --- CUSTOMER EMAIL ---
  if (customer.email) {
    const emailBody = `প্রিয় ${customer.full_name},\n\n${urgency} আপনার ${typeLabel} "${entity.entityName}" এর মেয়াদ ${daysRemaining} দিন পর (${entity.expiryDate}) শেষ হচ্ছে।\n\n${entity.renewalAmount > 0 ? `রিনিউয়াল মূল্য: ৳${entity.renewalAmount}\n\n` : ""}সেবা চালু রাখতে অনুগ্রহ করে সময়মতো রিনিউ করুন। রিনিউ না করলে সেবা বন্ধ হয়ে যেতে পারে।\n\nরিনিউ করতে আপনার ড্যাশবোর্ডে লগইন করুন অথবা আমাদের সাথে যোগাযোগ করুন।\n\nধন্যবাদ,\nDigiWebDex Team\n📞 +880 1674 533303\n📧 digiwebdex@gmail.com`;

    notifications.push({
      user_id: entity.userId,
      recipient: customer.email,
      notification_type: "email",
      subject: `${urgency} ${typeEn} Renewal: "${entity.entityName}" expires in ${daysRemaining} days`,
      body: emailBody,
      status: "pending",
      metadata: { type: "renewal_customer_email", entity_type: entity.type, entity_id: entity.id, days: daysRemaining },
    });
    result.emailSent++;
  }

  // --- CUSTOMER WHATSAPP ---
  if (customer.phone) {
    const waMsg = `${urgency} *${typeLabel} রিনিউয়াল রিমাইন্ডার*\n\n👤 *${customer.full_name}*\n🌐 *${entity.entityName}*\n📅 *মেয়াদ শেষ:* ${entity.expiryDate} (${daysRemaining} দিন বাকি)\n${entity.renewalAmount > 0 ? `💰 *মূল্য:* ৳${entity.renewalAmount}\n` : ""}\n⚡ সেবা চালু রাখতে এখনই রিনিউ করুন!\n\n🏢 *DigiWebDex*\n📞 +880 1674 533303`;

    notifications.push({
      user_id: entity.userId,
      recipient: normalizePhone(customer.phone),
      notification_type: "whatsapp",
      subject: `${typeEn} Renewal Reminder`,
      body: waMsg,
      status: "pending",
      metadata: { type: "renewal_customer_whatsapp", entity_type: entity.type, entity_id: entity.id, days: daysRemaining },
    });
    result.whatsappSent++;
  }

  // --- ADMIN SMS (only on 7-day and 1-day reminders) ---
  if (daysRemaining <= 7) {
    const adminSms = `রিনিউয়াল অ্যালার্ট: ${customer.full_name} - ${entity.entityName} (${typeLabel}) ${daysRemaining} দিন পর expire। Phone: ${customer.phone || "N/A"}`;
    const adminSmsResult = await sendSMS(ADMIN_PHONE, adminSms);
    notifications.push({
      recipient: ADMIN_PHONE,
      notification_type: "sms",
      subject: `Admin: ${typeEn} Renewal Alert`,
      body: adminSms,
      status: adminSmsResult.success ? "sent" : "failed",
      sent_at: adminSmsResult.success ? new Date().toISOString() : null,
      error_message: adminSmsResult.error || null,
      metadata: { type: "renewal_admin_sms", entity_type: entity.type, entity_id: entity.id, days: daysRemaining },
    });
  }

  // --- ADMIN WHATSAPP (all reminders) ---
  notifications.push({
    recipient: WHATSAPP_NUMBER,
    notification_type: "whatsapp",
    subject: `Admin: ${typeEn} Renewal`,
    body: `${urgency} *রিনিউয়াল অ্যালার্ট*\n\n👤 *Customer:* ${customer.full_name}\n📱 *Phone:* ${customer.phone || "N/A"}\n📧 *Email:* ${customer.email || "N/A"}\n🌐 *${typeEn}:* ${entity.entityName}\n📅 *Expires:* ${entity.expiryDate} (${daysRemaining} days)\n💰 *Amount:* ৳${entity.renewalAmount}`,
    status: "pending",
    metadata: { type: "renewal_admin_whatsapp", entity_type: entity.type, entity_id: entity.id, days: daysRemaining },
  });

  // Save all notifications
  if (notifications.length > 0) {
    await supabase.from("notifications").insert(notifications);
  }
}

// ─── Send suspension alerts ───
async function sendSuspensionAlerts(
  supabase: any,
  entity: { id: string; type: string; name: string; userId: string },
  customer: CustomerInfo,
  result: any
) {
  const typeLabel = entity.type === "hosting" ? "হোস্টিং" : "ডোমেইন";
  const notifications: any[] = [];

  // Customer SMS
  if (customer.phone && isValidBDPhone(customer.phone)) {
    const sms = `DigiWebDex: আপনার ${typeLabel} "${entity.name}" পেমেন্ট না পাওয়ায় সাসপেন্ড হয়েছে। পুনরায় চালু করতে যোগাযোগ করুন: 01674533303`;
    const r = await sendSMS(customer.phone, sms);
    notifications.push({
      user_id: entity.userId,
      recipient: normalizePhone(customer.phone),
      notification_type: "sms",
      subject: "Service Suspended",
      body: sms,
      status: r.success ? "sent" : "failed",
      sent_at: r.success ? new Date().toISOString() : null,
      error_message: r.error || null,
      metadata: { type: "suspension_customer_sms", entity_type: entity.type, entity_id: entity.id },
    });
  }

  // Customer Email
  if (customer.email) {
    notifications.push({
      user_id: entity.userId,
      recipient: customer.email,
      notification_type: "email",
      subject: `🚨 ${entity.type === "hosting" ? "Hosting" : "Domain"} Suspended - ${entity.name}`,
      body: `প্রিয় ${customer.full_name},\n\nআপনার ${typeLabel} "${entity.name}" পেমেন্ট না পাওয়ায় সাসপেন্ড করা হয়েছে।\n\nপুনরায় চালু করতে অনুগ্রহ করে বকেয়া পেমেন্ট করুন অথবা আমাদের সাথে যোগাযোগ করুন।\n\nDigiWebDex Team\n📞 +880 1674 533303`,
      status: "pending",
      metadata: { type: "suspension_customer_email", entity_type: entity.type, entity_id: entity.id },
    });
  }

  // Customer WhatsApp
  if (customer.phone) {
    notifications.push({
      user_id: entity.userId,
      recipient: normalizePhone(customer.phone),
      notification_type: "whatsapp",
      subject: "Service Suspended",
      body: `🚨 *সেবা সাসপেন্ড হয়েছে*\n\n🌐 *${entity.name}*\n📋 *ধরণ:* ${typeLabel}\n\nপেমেন্ট না পাওয়ায় আপনার সেবা সাসপেন্ড হয়েছে। পুনরায় চালু করতে এখনই পেমেন্ট করুন।\n\n🏢 *DigiWebDex*\n📞 +880 1674 533303`,
      status: "pending",
      metadata: { type: "suspension_customer_whatsapp", entity_type: entity.type, entity_id: entity.id },
    });
  }

  // Admin notifications
  const adminSms = `সাসপেন্ড: ${customer.full_name} - ${entity.name} (${typeLabel})। Phone: ${customer.phone || "N/A"}`;
  const r = await sendSMS(ADMIN_PHONE, adminSms);
  notifications.push({
    recipient: ADMIN_PHONE,
    notification_type: "sms",
    subject: "Admin: Service Suspended",
    body: adminSms,
    status: r.success ? "sent" : "failed",
    sent_at: r.success ? new Date().toISOString() : null,
    metadata: { type: "suspension_admin_sms" },
  });

  if (notifications.length > 0) {
    await supabase.from("notifications").insert(notifications);
  }
}

// ─── Data Fetchers ───
async function getExpiringHosting(supabase: any): Promise<ExpiringEntity[]> {
  const maxDays = Math.max(...REMINDER_DAYS);
  const future = new Date();
  future.setDate(future.getDate() + maxDays);
  const today = new Date();

  const { data, error } = await supabase
    .from("hosting_accounts")
    .select("*, order:orders(total, user_id)")
    .eq("status", "active")
    .lte("expiry_date", future.toISOString().split("T")[0])
    .gte("expiry_date", today.toISOString().split("T")[0]);

  if (error) throw error;

  return (data || []).map((a: any) => {
    const exp = new Date(a.expiry_date || "");
    const diff = Math.ceil((exp.getTime() - today.getTime()) / 86400000);
    return { id: a.id, type: "hosting" as const, userId: a.user_id || "", entityName: a.package_name || "Hosting", expiryDate: a.expiry_date || "", daysUntilExpiry: diff, renewalAmount: a.order?.total || 0 };
  });
}

async function getExpiringDomains(supabase: any): Promise<ExpiringEntity[]> {
  const maxDays = Math.max(...REMINDER_DAYS);
  const future = new Date();
  future.setDate(future.getDate() + maxDays);
  const today = new Date();

  const { data, error } = await supabase
    .from("domains")
    .select("*, order:orders(total, user_id)")
    .in("status", ["active", "registered"])
    .lte("expiry_date", future.toISOString().split("T")[0])
    .gte("expiry_date", today.toISOString().split("T")[0]);

  if (error) throw error;

  return (data || []).map((d: any) => {
    const exp = new Date(d.expiry_date || "");
    const diff = Math.ceil((exp.getTime() - today.getTime()) / 86400000);
    return { id: d.id, type: "domain" as const, userId: d.user_id || "", entityName: d.domain_name || "", expiryDate: d.expiry_date || "", daysUntilExpiry: diff, renewalAmount: 0 };
  });
}

// ─── Process Entity ───
async function processEntity(supabase: any, entity: ExpiringEntity, result: any) {
  if (!REMINDER_DAYS.includes(entity.daysUntilExpiry)) return;

  // Idempotency check
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: existing } = await supabase
    .from("renewal_logs")
    .select("id")
    .eq("entity_id", entity.id)
    .gte("created_at", today.toISOString())
    .limit(1);

  if (existing && existing.length > 0) {
    console.log(`[Renewal] Already processed ${entity.id} today`);
    return;
  }

  // Get customer info
  const customer = await getCustomerInfo(supabase, entity.userId);

  // Get domain renewal price if needed
  if (entity.type === "domain" && entity.renewalAmount === 0) {
    const parts = entity.entityName.split(".");
    const tld = parts.slice(1).join(".");
    const { data: pricing } = await supabase
      .from("domain_pricing")
      .select("renewal_price")
      .eq("tld", `.${tld}`)
      .single();
    entity.renewalAmount = pricing?.renewal_price || 0;
  }

  // Send multi-channel alerts
  await sendRenewalAlerts(supabase, entity, customer, entity.daysUntilExpiry, result);
  result.reminders++;

  // Generate invoice at 30 days
  if (entity.daysUntilExpiry === INVOICE_GENERATION_DAYS) {
    const { data: existingInv } = await supabase
      .from("renewal_logs")
      .select("invoice_id")
      .eq("entity_id", entity.id)
      .eq("entity_type", entity.type)
      .not("invoice_id", "is", null)
      .limit(1);

    if (!existingInv || existingInv.length === 0) {
      const { data: invNum } = await supabase.rpc("generate_invoice_number");
      const { data: invoice } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invNum || `INV-${Date.now()}`,
          user_id: entity.userId,
          subtotal: entity.renewalAmount,
          total: entity.renewalAmount,
          discount: 0,
          tax: 0,
          status: "unpaid",
          due_date: entity.expiryDate,
          notes: `Renewal for ${entity.type}: ${entity.entityName}`,
        })
        .select()
        .single();

      if (invoice) {
        result.invoicesGenerated++;
        await supabase.from("renewal_logs").insert({
          entity_type: entity.type,
          entity_id: entity.id,
          old_expiry_date: entity.expiryDate,
          invoice_id: invoice.id,
        });
        return;
      }
    }
  }

  // Log reminder
  await supabase.from("renewal_logs").insert({
    entity_type: entity.type,
    entity_id: entity.id,
    old_expiry_date: entity.expiryDate,
  });
}

// ─── Suspensions ───
async function processSuspensions(supabase: any, result: any) {
  const graceEnd = new Date();
  graceEnd.setDate(graceEnd.getDate() - GRACE_PERIOD_DAYS);
  const graceStr = graceEnd.toISOString().split("T")[0];

  // Hosting suspensions
  const { data: expHosting } = await supabase
    .from("hosting_accounts")
    .select("*")
    .eq("status", "active")
    .lt("expiry_date", graceStr);

  for (const acct of expHosting || []) {
    const isPaid = await isInvoicePaid(supabase, acct.id, "hosting");
    if (!isPaid) {
      await supabase
        .from("hosting_accounts")
        .update({ status: "suspended", suspended_reason: "Non-payment after grace period" })
        .eq("id", acct.id);
      result.suspensions++;

      if (acct.user_id) {
        const customer = await getCustomerInfo(supabase, acct.user_id);
        await sendSuspensionAlerts(supabase, { id: acct.id, type: "hosting", name: acct.package_name || "Hosting", userId: acct.user_id }, customer, result);
      }

      await supabase.from("renewal_logs").insert({ entity_type: "hosting", entity_id: acct.id, old_expiry_date: acct.expiry_date });
    }
  }

  // Domain expirations
  const { data: expDomains } = await supabase
    .from("domains")
    .select("*")
    .in("status", ["active", "registered"])
    .lt("expiry_date", graceStr);

  for (const domain of expDomains || []) {
    const isPaid = await isInvoicePaid(supabase, domain.id, "domain");
    if (!isPaid) {
      await supabase.from("domains").update({ status: "expired" }).eq("id", domain.id);
      result.suspensions++;

      if (domain.user_id) {
        const customer = await getCustomerInfo(supabase, domain.user_id);
        await sendSuspensionAlerts(supabase, { id: domain.id, type: "domain", name: domain.domain_name, userId: domain.user_id }, customer, result);
      }

      await supabase.from("renewal_logs").insert({ entity_type: "domain", entity_id: domain.id, old_expiry_date: domain.expiry_date });
    }
  }
}

async function isInvoicePaid(supabase: any, entityId: string, entityType: string): Promise<boolean> {
  const { data: log } = await supabase
    .from("renewal_logs")
    .select("invoice_id")
    .eq("entity_id", entityId)
    .eq("entity_type", entityType)
    .not("invoice_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!log?.invoice_id) return false;
  const { data: inv } = await supabase.from("invoices").select("status").eq("id", log.invoice_id).single();
  return inv?.status === "paid";
}
