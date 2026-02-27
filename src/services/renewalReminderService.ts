import { supabase } from '@/integrations/supabase/client';

/**
 * Renewal & Due Payment Reminder SMS Automation
 * Uses existing subscriptions, hosting_accounts, domains, invoices, and profiles tables.
 */

// ================================
// RENEWAL CHECK (Subscriptions + Hosting + Domains)
// ================================

export async function runRenewalAutomation(): Promise<{ sent: number; errors: string[] }> {
  const today = new Date();
  const errors: string[] = [];
  let sent = 0;

  // --- Subscriptions ---
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('id, user_id, service_type, plan_name, next_billing_date, amount, status, domain_id')
    .in('status', ['active', 'suspended']);

  for (const sub of subs || []) {
    const renewDate = new Date(sub.next_billing_date);
    const diffDays = Math.ceil((renewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('user_id', sub.user_id)
      .single();

    if (!profile?.phone) continue;

    let message = '';

    if (diffDays === 30) {
      message = `🔔 Renewal Reminder\n\n🌐 Service: ${sub.service_type.toUpperCase()}\n📦 Plan: ${sub.plan_name}\n📅 Renewal Date: ${sub.next_billing_date}\n💰 Amount: ৳${sub.amount}\n\nঅনুগ্রহ করে সময়মতো রিনিউ করুন।`;
    } else if (diffDays === 7) {
      message = `⚠️ Renewal Due Soon\n\n🌐 Service: ${sub.service_type.toUpperCase()}\n📦 Plan: ${sub.plan_name}\n📅 Renewal Date: ${sub.next_billing_date}\n💰 Amount: ৳${sub.amount}\n\nরিনিউ করতে দেরি করবেন না।`;
    } else if (diffDays === 1) {
      message = `🚨 Tomorrow Expiry!\n\n🌐 Service: ${sub.service_type.toUpperCase()}\n📦 Plan: ${sub.plan_name}\n📅 Renewal Date: ${sub.next_billing_date}\n💰 Amount: ৳${sub.amount}\n\nআগামীকাল মেয়াদ শেষ! এখনই রিনিউ করুন।`;
    }

    if (message) {
      const { error } = await supabase.functions.invoke('send-sms', {
        body: { phone: profile.phone, message, type: 'customer', metadata: { entity_type: 'subscription', entity_id: sub.id } },
      });
      if (error) errors.push(`Sub ${sub.id}: ${error.message}`);
      else sent++;
    }
  }

  // --- Hosting Accounts ---
  const { data: hostings } = await supabase
    .from('hosting_accounts')
    .select('id, user_id, package_name, expiry_date, status, domain_id')
    .in('status', ['active', 'pending']);

  for (const h of hostings || []) {
    if (!h.expiry_date) continue;
    const renewDate = new Date(h.expiry_date);
    const diffDays = Math.ceil((renewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('user_id', h.user_id)
      .single();

    if (!profile?.phone) continue;

    // Fetch domain name if linked
    let domainName = 'N/A';
    if (h.domain_id) {
      const { data: dom } = await supabase.from('domains').select('domain_name').eq('id', h.domain_id).single();
      if (dom) domainName = dom.domain_name;
    }

    let message = '';

    if (diffDays === 30) {
      message = `🔔 Hosting Renewal Reminder\n\n🚀 Package: ${h.package_name || 'Hosting'}\n🌐 Domain: ${domainName}\n📅 Expiry: ${h.expiry_date}\n\nঅনুগ্রহ করে সময়মতো রিনিউ করুন।`;
    } else if (diffDays === 7) {
      message = `⚠️ Hosting Expiry Soon\n\n🚀 Package: ${h.package_name || 'Hosting'}\n🌐 Domain: ${domainName}\n📅 Expiry: ${h.expiry_date}\n\nরিনিউ করতে দেরি করবেন না।`;
    } else if (diffDays < 0 && h.status === 'active') {
      message = `❌ Hosting Expired\n\n🚀 Package: ${h.package_name || 'Hosting'}\n🌐 Domain: ${domainName}\n\nআপনার হোস্টিং মেয়াদ শেষ হয়েছে। দ্রুত রিনিউ করুন।`;
    }

    if (message) {
      const { error } = await supabase.functions.invoke('send-sms', {
        body: { phone: profile.phone, message, type: 'customer', metadata: { entity_type: 'hosting', entity_id: h.id } },
      });
      if (error) errors.push(`Hosting ${h.id}: ${error.message}`);
      else sent++;
    }
  }

  // --- Domains ---
  const { data: domains } = await supabase
    .from('domains')
    .select('id, user_id, domain_name, expiry_date, status')
    .in('status', ['active', 'registered']);

  for (const d of domains || []) {
    if (!d.expiry_date) continue;
    const renewDate = new Date(d.expiry_date);
    const diffDays = Math.ceil((renewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('user_id', d.user_id)
      .single();

    if (!profile?.phone) continue;

    let message = '';

    if (diffDays === 30) {
      message = `🔔 Domain Renewal Reminder\n\n🌐 Domain: ${d.domain_name}\n📅 Expiry: ${d.expiry_date}\n\nঅনুগ্রহ করে সময়মতো রিনিউ করুন।`;
    } else if (diffDays === 7) {
      message = `⚠️ Domain Expiry Soon\n\n🌐 Domain: ${d.domain_name}\n📅 Expiry: ${d.expiry_date}\n\nরিনিউ করতে দেরি করবেন না।`;
    } else if (diffDays < 0 && d.status === 'active') {
      message = `❌ Domain Expired\n\n🌐 Domain: ${d.domain_name}\n\nআপনার ডোমেইনের মেয়াদ শেষ হয়েছে। দ্রুত রিনিউ করুন।`;
    }

    if (message) {
      const { error } = await supabase.functions.invoke('send-sms', {
        body: { phone: profile.phone, message, type: 'customer', metadata: { entity_type: 'domain', entity_id: d.id } },
      });
      if (error) errors.push(`Domain ${d.id}: ${error.message}`);
      else sent++;
    }
  }

  return { sent, errors };
}

// ================================
// DUE PAYMENT REMINDER
// ================================

export async function runDueReminder(): Promise<{ sent: number; errors: string[] }> {
  const errors: string[] = [];
  let sent = 0;

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, user_id, due_amount, due_date, status')
    .in('status', ['partial', 'unpaid', 'overdue']);

  for (const inv of invoices || []) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('user_id', inv.user_id)
      .single();

    if (!profile?.phone) continue;

    const dueDateStr = inv.due_date ? new Date(inv.due_date).toLocaleDateString('bn-BD') : 'N/A';
    const statusLabel = inv.status === 'overdue' ? '❌ Overdue' : '💰 Due';

    const message = `${statusLabel} Payment Reminder\n\n🆔 Invoice: ${inv.invoice_number}\n💵 Due Amount: ৳${inv.due_amount}\n📅 Due Date: ${dueDateStr}\n👤 ${profile.full_name}\n\nঅনুগ্রহ করে বকেয়া পরিশোধ করুন।\n📞 যোগাযোগ: 01674533303`;

    const { error } = await supabase.functions.invoke('send-sms', {
      body: { phone: profile.phone, message, type: 'customer', metadata: { invoice_id: inv.id } },
    });

    if (error) errors.push(`Invoice ${inv.invoice_number}: ${error.message}`);
    else sent++;
  }

  return { sent, errors };
}
