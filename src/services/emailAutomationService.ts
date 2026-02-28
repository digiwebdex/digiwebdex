import { supabase } from '@/integrations/supabase/client';
import {
  invoiceTemplate,
  paymentTemplate,
  renewalTemplate,
} from '@/lib/emailTemplates';

async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: { to, subject, html },
  });
  if (error || !data?.success) {
    console.error('Email send failed:', error?.message || data?.error);
    return { success: false, error: error?.message || data?.error };
  }
  return { success: true };
}

// ─── Invoice Email ───
export async function sendInvoiceEmail(invoiceId: string): Promise<void> {
  const { data: invoice } = await supabase
    .from('invoices')
    .select('invoice_number, total, user_id, order_id')
    .eq('id', invoiceId)
    .single();
  if (!invoice?.user_id) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', invoice.user_id)
    .single();

  // Note: Email must be passed explicitly or fetched from notifications table
  // since client-side SDK cannot access auth.users. Best called from edge functions.
  const { data: notification } = await supabase
    .from('notifications')
    .select('recipient')
    .eq('user_id', invoice.user_id)
    .eq('notification_type', 'email')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const email = notification?.recipient;
  if (!email) return;

  const html = invoiceTemplate({
    name: profile?.full_name || 'Customer',
    invoice: invoice.invoice_number,
    amount: invoice.total,
    link: `https://digiwebdex.com/dashboard/invoices`,
  });

  await sendEmail(email, `ইনভয়েস তৈরি হয়েছে - ${invoice.invoice_number}`, html);
}

// ─── Payment Confirmation ───
export async function sendPaymentEmail(invoiceId: string, amount: number, recipientEmail?: string, recipientName?: string): Promise<void> {
  let email = recipientEmail;
  let name = recipientName || 'Customer';

  if (!email) {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('user_id')
      .eq('id', invoiceId)
      .single();
    if (!invoice?.user_id) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', invoice.user_id)
      .single();
    name = profile?.full_name || name;
  }

  if (!email) return;

  const html = paymentTemplate({ name, amount });
  await sendEmail(email, 'পেমেন্ট সফল হয়েছে ✅', html);
}

// ─── Renewal Reminder ───
export async function sendRenewalEmail(params: {
  email: string;
  name: string;
  service: string;
  domain?: string;
  date: string;
  daysRemaining: number;
  amount?: number;
}): Promise<void> {
  const html = renewalTemplate({
    name: params.name,
    service: params.service,
    domain: params.domain,
    date: params.date,
    daysRemaining: params.daysRemaining,
    amount: params.amount,
  });

  await sendEmail(params.email, `রিনিউয়াল রিমাইন্ডার - ${params.service}`, html);
}
