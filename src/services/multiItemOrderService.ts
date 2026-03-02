import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];
type InvoiceStatus = Database['public']['Enums']['invoice_status'];
type ServiceType = Database['public']['Enums']['service_type'];

export interface OrderItem {
  type: ServiceType;
  package: string;
  domain?: string;
  description?: string;
  price: number;
  qty?: number;
  renewalDate?: string;
}

export interface CreateMultiItemOrderParams {
  userId: string;
  serviceId?: string;
  packageId?: string;
  serviceType?: ServiceType;
  items: OrderItem[];
  discount?: number;
  tax?: number;
  advance?: number;
  notes?: string;
  couponCode?: string;
}

export interface MultiItemOrderResult {
  order: Database['public']['Tables']['orders']['Row'];
  invoice: Database['public']['Tables']['invoices']['Row'];
}

/**
 * Creates a single order with multiple line items.
 * The DB trigger `auto_generate_invoice` fires on order INSERT and creates the invoice automatically.
 * We then find that invoice and attach invoice_items to it, plus update financials.
 */
export async function createOrderWithItems(
  params: CreateMultiItemOrderParams
): Promise<MultiItemOrderResult> {
  const {
    userId,
    items,
    discount = 0,
    tax = 0,
    advance = 0,
    notes,
    couponCode,
  } = params;

  if (!items || items.length === 0) {
    throw new Error('No items provided');
  }

  // --- Calculate totals ---
  let subtotal = 0;
  for (const item of items) {
    const qty = item.qty || 1;
    subtotal += Number(item.price) * qty;
  }
  const total = subtotal - discount + tax;

  // --- Generate order number ---
  const { data: orderNumber } = await supabase.rpc('generate_order_number');

  // --- Determine primary service type ---
  const primaryType = params.serviceType || items[0].type;

  // --- Insert order (trigger auto-creates invoice) ---
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber || `ORD-${Date.now()}`,
      user_id: userId,
      service_id: params.serviceId || null,
      package_id: params.packageId || null,
      service_type: primaryType,
      billing_type: 'one_time' as Database['public']['Enums']['billing_type'],
      subtotal,
      discount,
      tax,
      total,
      advance_payment: advance,
      coupon_code: couponCode || null,
      notes: notes || null,
      status: 'pending' as OrderStatus,
    })
    .select()
    .single();

  if (orderError) throw new Error(orderError.message);

  // --- Find the auto-generated invoice ---
  const { data: invoice, error: invError } = await supabase
    .from('invoices')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (invError) throw new Error(`Invoice not found: ${invError.message}`);

  // --- Helper: add one year ---
  const addOneYear = (date: Date): Date => {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + 1);
    return d;
  };

  // --- Build invoice items + order items + subscriptions + meta ---
  const invoiceItemsToInsert: Array<{
    invoice_id: string;
    service_type: string;
    package_name: string;
    domain: string | null;
    description: string;
    price: number;
    qty: number;
    total: number;
    renewal_date: string | null;
  }> = [];
  const orderItemsToInsert: Array<{
    order_id: string;
    service_type: string;
    package_name: string;
    billing_type: string;
    domain: string | null;
    description: string;
    price: number;
    qty: number;
    total: number;
    renewal_date: string | null;
  }> = [];
  const metaEntries: Array<{ order_id: string; meta_key: string; meta_value: Json }> = [];

  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const qty = item.qty || 1;
    let renewalDate: string | null = item.renewalDate || null;
    let description = item.description || '';

    // --- Domain / Hosting → auto renewal date + subscription ---
    if (item.type === 'domain' || item.type === 'hosting') {
      if (!renewalDate) {
        renewalDate = addOneYear(new Date()).toISOString().split('T')[0];
      }

      const typeLabel = item.type === 'domain' ? 'ডোমেইন রেজিস্ট্রেশন' : 'ওয়েব হোস্টিং';
      description = description || `${typeLabel} (${item.type})\n${item.domain || ''}\nRenewal: ${renewalDate}`;

      // Create subscription
      await supabase.from('subscriptions').insert({
        user_id: userId,
        service_type: item.type as string,
        plan_name: item.package,
        amount: Number(item.price),
        billing_cycle: 'yearly' as Database['public']['Enums']['billing_cycle'],
        next_billing_date: renewalDate,
        status: 'active' as Database['public']['Enums']['subscription_status'],
        metadata: {
          order_id: order.id,
          domain: item.domain,
        } as Json,
      });
    }

    // --- Web / Software → one-time + auto-create project ---
    if (item.type === 'web_development' || item.type === 'software_development') {
      const typeLabel = item.type === 'web_development' ? 'ওয়েব ডেভেলপমেন্ট' : 'সফটওয়্যার ডেভেলপমেন্ট';
      description = description || `${typeLabel} (${item.type})\nOne Time Payment`;

      // Auto-create project record
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + (item.type === 'web_development' ? 30 : 45));

      await supabase.from('projects').insert([{
        user_id: userId,
        order_id: order.id,
        title: `${item.package} - ${item.domain || 'Project'}`,
        service_type: item.type as Database['public']['Enums']['service_type'],
        status: 'pending' as Database['public']['Enums']['project_status'],
        deadline: deliveryDate.toISOString().split('T')[0],
        description: `Auto-created from Order ${order.order_number}`,
      }]);
    }

    // --- Digital marketing ---
    if (item.type === 'digital_marketing') {
      description = description || `ডিজিটাল মার্কেটিং (${item.type})`;
    }

    const billingType = (item.type === 'domain' || item.type === 'hosting') ? 'recurring' : 'one_time';

    invoiceItemsToInsert.push({
      invoice_id: invoice.id,
      service_type: item.type as string,
      package_name: item.package,
      domain: item.domain || null,
      description: description || item.package,
      price: Number(item.price),
      qty,
      total: Number(item.price) * qty,
      renewal_date: renewalDate,
    });

    orderItemsToInsert.push({
      order_id: order.id,
      service_type: item.type as string,
      package_name: item.package,
      billing_type: billingType,
      domain: item.domain || null,
      description: description || item.package,
      price: Number(item.price),
      qty,
      total: Number(item.price) * qty,
      renewal_date: renewalDate,
    });

    metaEntries.push({
      order_id: order.id,
      meta_key: `item_${idx}`,
      meta_value: {
        type: item.type,
        package: item.package,
        domain: item.domain,
        price: item.price,
        qty,
        renewalDate,
      } as Json,
    });
  }

  // --- Insert invoice items ---
  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(invoiceItemsToInsert);

  if (itemsError) throw new Error(itemsError.message);

  // --- Insert order items ---
  const { error: orderItemsError } = await supabase
    .from('order_items')
    .insert(orderItemsToInsert);

  if (orderItemsError) throw new Error(orderItemsError.message);

  // --- Store order meta ---
  await supabase.from('order_meta').insert(metaEntries);

  // --- Record advance payment ---
  if (advance > 0) {
    await supabase.from('manual_payments').insert({
      invoice_id: invoice.id,
      user_id: userId,
      amount: advance,
      method: 'manual',
      transaction_id: `ADV-${Date.now()}`,
      status: 'verified',
      notes: 'Advance payment on order creation',
    });
  }

  return { order, invoice };
}

/**
 * Add a payment to an existing invoice and update balances.
 */
export async function addPaymentToInvoice(
  invoiceId: string,
  amount: number,
  userId: string,
  method = 'manual'
): Promise<void> {
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (error || !invoice) throw new Error('Invoice not found');

  const newAdvance = Number(invoice.advance_paid || 0) + Number(amount);
  const due = Number(invoice.total) - newAdvance;

  const newStatus: InvoiceStatus = due <= 0 ? 'paid' : 'partial';

  await supabase
    .from('invoices')
    .update({
      advance_paid: newAdvance,
      due_amount: due,
      status: newStatus,
      ...(due <= 0 ? { paid_at: new Date().toISOString() } : {}),
    })
    .eq('id', invoiceId);

  await supabase.from('manual_payments').insert({
    invoice_id: invoiceId,
    user_id: userId,
    amount,
    method,
    transaction_id: `PAY-${Date.now()}`,
    status: 'verified',
    notes: `Payment of ${amount} BDT`,
  });
}
