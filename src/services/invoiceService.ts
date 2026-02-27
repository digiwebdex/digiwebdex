import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type InvoiceStatus = Database['public']['Enums']['invoice_status'];

export interface InvoiceItem {
  id?: string;
  invoice_id: string;
  service_type: string;
  package_name: string;
  domain?: string | null;
  description?: string | null;
  price: number;
  qty: number;
  total: number;
  renewal_date?: string | null;
  created_at?: string;
}

export interface InvoiceWithDetails extends Invoice {
  order?: {
    order_number: string;
    service_type: string;
  };
  profile?: {
    full_name: string;
    company_name: string;
    address: string;
    phone: string;
  };
  items?: InvoiceItem[];
}

class InvoiceService {
  async getInvoices(userId: string, isAdmin: boolean = false): Promise<InvoiceWithDetails[]> {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        order:orders(order_number, service_type)
      `)
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as InvoiceWithDetails[];
  }

  async getInvoiceById(invoiceId: string): Promise<InvoiceWithDetails | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        order:orders(order_number, service_type)
      `)
      .eq('id', invoiceId)
      .single();

    if (error) throw error;
    return data as InvoiceWithDetails;
  }

  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    const { data, error } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at');

    if (error) throw error;
    return (data || []) as InvoiceItem[];
  }

  async addInvoiceItems(items: Omit<InvoiceItem, 'id' | 'created_at'>[]): Promise<void> {
    if (items.length === 0) return;
    const { error } = await supabase.from('invoice_items').insert(items);
    if (error) throw error;
  }

  async deleteInvoiceItems(invoiceId: string): Promise<void> {
    const { error } = await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
    if (error) throw error;
  }

  async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus): Promise<{ error: Error | null }> {
    try {
      const updateData: Partial<Invoice> = { status };

      if (status === 'paid') {
        updateData.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId);

      if (error) throw error;

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  async addPayment(invoiceId: string, amount: number): Promise<{ error: Error | null }> {
    try {
      const invoice = await this.getInvoiceById(invoiceId);
      if (!invoice) throw new Error('Invoice not found');

      const newAdvance = Number(invoice.advance_paid || 0) + Number(amount);
      const due = Number(invoice.total) - newAdvance;

      const { error } = await supabase
        .from('invoices')
        .update({
          advance_paid: newAdvance,
          due_amount: due,
          status: (due <= 0 ? 'paid' : 'partial') as InvoiceStatus,
          ...(due <= 0 ? { paid_at: new Date().toISOString() } : {}),
        })
        .eq('id', invoiceId);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  async updateInvoiceFinancials(invoiceId: string, payload: {
    subtotal: number;
    discount: number;
    tax: number;
    advance_paid: number;
    notes?: string;
    due_date?: string | null;
  }): Promise<{ error: Error | null }> {
    try {
      const total = payload.subtotal - payload.discount + payload.tax;
      const due = total - payload.advance_paid;

      const { error } = await supabase
        .from('invoices')
        .update({
          subtotal: payload.subtotal,
          discount: payload.discount,
          tax: payload.tax,
          total,
          advance_paid: payload.advance_paid,
          due_amount: due,
          status: (due <= 0 ? 'paid' : payload.advance_paid > 0 ? 'partial' : 'unpaid') as InvoiceStatus,
          notes: payload.notes,
          due_date: payload.due_date || null,
          ...(due <= 0 ? { paid_at: new Date().toISOString() } : {}),
        })
        .eq('id', invoiceId);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  // Generate invoice PDF data structure
  generateInvoicePDFData(invoice: InvoiceWithDetails): object {
    return {
      invoiceNumber: invoice.invoice_number,
      date: new Date(invoice.created_at).toLocaleDateString('bn-BD'),
      dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('bn-BD') : null,
      status: invoice.status,
      company: {
        name: 'Digiwebdex',
        address: 'Dhaka, Bangladesh',
        email: 'support@digiwebdex.com',
        phone: '+880 1234 567890',
      },
      client: {
        name: invoice.profile?.full_name || 'N/A',
        company: invoice.profile?.company_name,
        address: invoice.profile?.address,
        phone: invoice.profile?.phone,
      },
      items: invoice.items || [
        {
          description: `Order #${invoice.order?.order_number || 'N/A'}`,
          type: invoice.order?.service_type || 'service',
          amount: invoice.subtotal,
        },
      ],
      subtotal: invoice.subtotal,
      discount: invoice.discount,
      tax: invoice.tax,
      total: invoice.total,
      advance_paid: invoice.advance_paid,
      due_amount: invoice.due_amount,
      currency: invoice.currency,
      notes: invoice.notes,
    };
  }

  // Check for overdue invoices
  async checkOverdueInvoices(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    await supabase
      .from('invoices')
      .update({ status: 'overdue' })
      .in('status', ['unpaid', 'partial'])
      .lt('due_date', today);
  }

  // Get invoice statistics for admin dashboard
  async getInvoiceStats(): Promise<{
    totalUnpaid: number;
    totalPaid: number;
    totalOverdue: number;
    totalPartial: number;
    recentInvoices: Invoice[];
  }> {
    const { data: unpaid } = await supabase
      .from('invoices')
      .select('total')
      .eq('status', 'unpaid');

    const { data: paid } = await supabase
      .from('invoices')
      .select('total')
      .eq('status', 'paid');

    const { data: overdue } = await supabase
      .from('invoices')
      .select('total')
      .eq('status', 'overdue');

    const { data: partial } = await supabase
      .from('invoices')
      .select('due_amount')
      .eq('status', 'partial');

    const { data: recent } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      totalUnpaid: (unpaid || []).reduce((sum, inv) => sum + Number(inv.total), 0),
      totalPaid: (paid || []).reduce((sum, inv) => sum + Number(inv.total), 0),
      totalOverdue: (overdue || []).reduce((sum, inv) => sum + Number(inv.total), 0),
      totalPartial: (partial || []).reduce((sum, inv) => sum + Number(inv.due_amount || 0), 0),
      recentInvoices: recent || [],
    };
  }
}

export const invoiceService = new InvoiceService();
