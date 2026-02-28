import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type InvoiceStatus = Database['public']['Enums']['invoice_status'];

export async function mergeOrdersIntoInvoice(orderIds: string[]): Promise<{ invoiceId: string; invoiceNumber: string }> {
  if (!orderIds.length) {
    throw new Error('No orders selected');
  }

  // 1. Fetch all selected orders
  const { data: orders, error: ordersErr } = await supabase
    .from('orders')
    .select('*')
    .in('id', orderIds);

  if (ordersErr) throw ordersErr;
  if (!orders || orders.length === 0) throw new Error('Orders not found');

  // Ensure all orders belong to the same user
  const userIds = [...new Set(orders.map(o => o.user_id))];
  if (userIds.length > 1) {
    throw new Error('Cannot merge orders from different customers');
  }
  const userId = userIds[0];

  // 2. Collect existing invoice_items linked to invoices of these orders
  const { data: existingInvoices } = await supabase
    .from('invoices')
    .select('id')
    .in('order_id', orderIds);

  const existingInvoiceIds = (existingInvoices || []).map(inv => inv.id);

  let allItems: Array<{
    service_type: string | null;
    package_name: string | null;
    domain: string | null;
    description: string | null;
    price: number;
    qty: number;
    total: number;
    renewal_date: string | null;
  }> = [];

  if (existingInvoiceIds.length > 0) {
    const { data: items } = await supabase
      .from('invoice_items')
      .select('*')
      .in('invoice_id', existingInvoiceIds);

    allItems = (items || []).map(item => ({
      service_type: item.service_type,
      package_name: item.package_name,
      domain: item.domain,
      description: item.description,
      price: Number(item.price),
      qty: item.qty,
      total: Number(item.total),
      renewal_date: item.renewal_date,
    }));
  }

  // If no invoice_items exist, build items from order data directly
  if (allItems.length === 0) {
    allItems = orders.map(order => ({
      service_type: order.service_type,
      package_name: null,
      domain: null,
      description: `Order #${order.order_number}`,
      price: Number(order.total),
      qty: 1,
      total: Number(order.total),
      renewal_date: null,
    }));
  }

  // 3. Calculate totals
  const subtotal = allItems.reduce((sum, item) => sum + Number(item.total), 0);

  // 4. Generate invoice number
  const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number');

  // 5. Create merged invoice
  const { data: invoice, error: invErr } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invoiceNumber || `INV-${Date.now()}`,
      user_id: userId,
      subtotal,
      discount: 0,
      tax: 0,
      total: subtotal,
      advance_paid: 0,
      due_amount: subtotal,
      status: 'unpaid' as InvoiceStatus,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: 'BDT',
      notes: `Merged from orders: ${orders.map(o => o.order_number).join(', ')}`,
    })
    .select()
    .single();

  if (invErr) throw invErr;

  // 6. Insert items into new invoice
  if (allItems.length > 0) {
    const itemsToInsert = allItems.map(item => ({
      invoice_id: invoice.id,
      service_type: item.service_type,
      package_name: item.package_name,
      domain: item.domain,
      description: item.description,
      price: item.price,
      qty: item.qty,
      total: item.total,
      renewal_date: item.renewal_date,
    }));

    const { error: itemsErr } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert);

    if (itemsErr) throw itemsErr;
  }

  // 7. Mark orders as merged and link to new invoice
  for (const order of orders) {
    await supabase
      .from('orders')
      .update({
        status: 'merged' as any,
        merged_invoice_id: invoice.id,
      })
      .eq('id', order.id);
  }

  // 8. Cancel old individual invoices
  if (existingInvoiceIds.length > 0) {
    await supabase
      .from('invoices')
      .update({ status: 'cancelled' as InvoiceStatus })
      .in('id', existingInvoiceIds);
  }

  return { invoiceId: invoice.id, invoiceNumber: invoice.invoice_number };
}
