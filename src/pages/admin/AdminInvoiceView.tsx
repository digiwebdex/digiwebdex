import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { InvoicePDF } from '@/components/invoice';
import { format } from 'date-fns';

interface InvoiceItem {
  id: string;
  description: string | null;
  service_type: string | null;
  package_name: string | null;
  domain: string | null;
  qty: number;
  price: number;
  total: number;
}

export default function AdminInvoiceView() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const basePath = language === 'en' ? '/en' : '/bn';

  const [invoice, setInvoice] = useState<any>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    const { data: inv } = await supabase.from('invoices').select('*').eq('id', id!).single();
    if (!inv) { setLoading(false); return; }
    setInvoice(inv);

    const [itemsRes, profileRes, orderRes] = await Promise.all([
      supabase.from('invoice_items').select('*').eq('invoice_id', inv.id),
      inv.user_id ? supabase.from('profiles').select('full_name, phone, company_name, address, city').eq('user_id', inv.user_id).single() : null,
      inv.order_id ? supabase.from('orders').select('order_number').eq('id', inv.order_id).single() : null,
    ]);

    setItems((itemsRes?.data as InvoiceItem[]) || []);
    if (profileRes?.data) setProfile(profileRes.data);
    if (orderRes?.data) setOrderNumber(orderRes.data.order_number);
    setLoading(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!invoice) {
    return (
      <AdminLayout>
        <div className="text-center py-20 text-muted-foreground">Invoice not found</div>
      </AdminLayout>
    );
  }

  const invoiceData = {
    invoice_number: invoice.invoice_number,
    customer_name: profile?.full_name || 'N/A',
    customer_phone: profile?.phone || undefined,
    customer_address: [profile?.address, profile?.city].filter(Boolean).join(', ') || undefined,
    order_number: orderNumber || undefined,
    created_at: format(new Date(invoice.created_at), 'dd MMM yyyy'),
    due_date: invoice.due_date ? format(new Date(invoice.due_date), 'dd MMM yyyy') : undefined,
    items: items.length > 0
      ? items.map((it) => ({
          description: it.description || it.package_name || 'Service',
          service_type: it.service_type || undefined,
          package_name: it.package_name || undefined,
          domain: it.domain || undefined,
          qty: it.qty,
          price: it.price,
          total: it.total,
        }))
      : [{ description: 'Service', qty: 1, price: invoice.total, total: invoice.total }],
    subtotal: Number(invoice.subtotal),
    discount: Number(invoice.discount || 0),
    tax: Number(invoice.tax || 0),
    total: Number(invoice.total),
    advance_paid: Number(invoice.advance_paid || 0),
    due_amount: Number(invoice.due_amount || 0),
    status: invoice.status,
    notes: invoice.notes || undefined,
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(`${basePath}/admin/invoices`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === 'bn' ? 'ইনভয়েস তালিকা' : 'Back to Invoices'}
        </Button>

        <InvoicePDF invoice={invoiceData} />
      </div>
    </AdminLayout>
  );
}
