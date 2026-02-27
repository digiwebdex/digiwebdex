import { supabase } from '@/integrations/supabase/client';
import type { InvoiceItem } from '@/services/invoiceService';

interface CustomerInfo {
  full_name: string;
  phone: string;
}

function buildSMSMessage(
  item: InvoiceItem,
  invoiceNumber: string,
  customerName: string,
  invoiceLink: string,
): string {
  const footer = `\n🆔 Order ID: ${invoiceNumber}\n👤 Client: ${customerName}\n\n📄 Invoice: ${invoiceLink}\n📧 একই ইনভয়েস আপনার ইমেইলেও পাঠানো হয়েছে।`;

  switch (item.service_type) {
    case 'domain':
      return `✅ Paid Successfully!\n\n🌐 Service: Domain Registration\n🔗 Domain: ${item.domain || 'N/A'}\n📅 Renewal Date: ${item.renewal_date || 'N/A'}\n\n💰 Paid Amount: ৳${item.price}${footer}`;

    case 'hosting':
      return `✅ Paid Successfully!\n\n🚀 Service: Hosting Service\n📦 Package: ${item.package_name || 'N/A'}\n🌐 Domain: ${item.domain || 'N/A'}\n📅 Renewal Date: ${item.renewal_date || 'N/A'}\n\n💰 Paid Amount: ৳${item.price}${footer}`;

    case 'website':
      return `✅ Paid Successfully!\n\n💻 Service: Website Development\n📦 Package: ${item.package_name || 'N/A'}\n💵 Price: ৳${item.price} (One-Time Payment)${footer}`;

    case 'software':
      return `✅ Paid Successfully!\n\n🧩 Service: Software Development\n📦 Package: ${item.package_name || 'N/A'}\n💵 Price: ৳${item.price} (One-Time Payment)${footer}`;

    default:
      return `✅ Paid Successfully!\n\n📦 Service: ${item.service_type || 'Service'}\n💵 Amount: ৳${item.price}${footer}`;
  }
}

export async function sendServiceSMS(invoiceId: string): Promise<{ sent: number; errors: string[] }> {
  const errors: string[] = [];
  let sent = 0;

  // Fetch invoice
  const { data: invoice, error: invErr } = await supabase
    .from('invoices')
    .select('id, invoice_number, user_id, pdf_url')
    .eq('id', invoiceId)
    .single();

  if (invErr || !invoice) {
    return { sent: 0, errors: ['Invoice not found'] };
  }

  // Fetch customer profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('user_id', invoice.user_id)
    .single();

  const customer: CustomerInfo = {
    full_name: profile?.full_name || 'Customer',
    phone: profile?.phone || '',
  };

  if (!customer.phone) {
    return { sent: 0, errors: ['Customer phone number not found'] };
  }

  // Fetch invoice items
  const { data: items } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoiceId);

  if (!items || items.length === 0) {
    return { sent: 0, errors: ['No invoice items found'] };
  }

  const invoiceLink = invoice.pdf_url || `${window.location.origin}/dashboard/invoices`;

  for (const item of items) {
    const typedItem: InvoiceItem = {
      id: item.id,
      invoice_id: item.invoice_id,
      service_type: item.service_type || 'service',
      package_name: item.package_name || '',
      domain: item.domain,
      description: item.description,
      price: item.price,
      qty: item.qty,
      total: item.total,
      renewal_date: item.renewal_date,
    };

    const message = buildSMSMessage(typedItem, invoice.invoice_number, customer.full_name, invoiceLink);

    const { error } = await supabase.functions.invoke('send-sms', {
      body: {
        phone: customer.phone,
        message,
        type: 'customer',
        metadata: { invoice_id: invoiceId, service_type: item.service_type },
      },
    });

    if (error) {
      errors.push(`Failed for ${item.service_type}: ${error.message}`);
    } else {
      sent++;
    }
  }

  return { sent, errors };
}
