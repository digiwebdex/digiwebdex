import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column, StatusBadge, DeleteConfirmDialog } from '@/components/admin/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Eye, Download, Trash2, Printer, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';
import { logAudit } from '@/lib/auditLog';
import { printTable } from '@/lib/exportUtils';

type Invoice = Database['public']['Tables']['invoices']['Row'] & {
  orders?: { order_number: string; service_type: string } | null;
  customer_name?: string;
};

const INVOICE_STATUSES = [
  { value: 'unpaid', label_en: 'Unpaid', label_bn: 'অপরিশোধিত' },
  { value: 'paid', label_en: 'Paid', label_bn: 'পরিশোধিত' },
  { value: 'overdue', label_en: 'Overdue', label_bn: 'বকেয়া' },
  { value: 'cancelled', label_en: 'Cancelled', label_bn: 'বাতিল' },
  { value: 'refunded', label_en: 'Refunded', label_bn: 'ফেরত' },
];

export default function AdminInvoices() {
  const { language } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [selectedRows, setSelectedRows] = useState<Invoice[]>([]);
  // Edit fields
  const [editSubtotal, setEditSubtotal] = useState(0);
  const [editDiscount, setEditDiscount] = useState(0);
  const [editTax, setEditTax] = useState(0);
  const [editNotes, setEditNotes] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('invoices')
      .select(`*, orders:order_id (order_number, service_type)`)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Fetch customer names
    const invoicesWithCustomers = await Promise.all(
      (data || []).map(async (inv) => {
        if (inv.user_id) {
          const { data: profile } = await supabase.from('profiles').select('full_name').eq('user_id', inv.user_id).single();
          return { ...inv, customer_name: profile?.full_name || 'N/A' };
        }
        return { ...inv, customer_name: 'N/A' };
      })
    );
    setInvoices(invoicesWithCustomers as Invoice[]);
    setLoading(false);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setNewStatus(invoice.status);
    setEditSubtotal(invoice.subtotal);
    setEditDiscount(invoice.discount || 0);
    setEditTax(invoice.tax || 0);
    setEditNotes(invoice.notes || '');
    setEditDueDate(invoice.due_date || '');
    setDetailOpen(true);
  };

  const handleUpdateInvoice = async () => {
    if (!selectedInvoice) return;
    setSaving(true);
    const newTotal = editSubtotal - editDiscount + editTax;
    const oldValues = { status: selectedInvoice.status, subtotal: selectedInvoice.subtotal, discount: selectedInvoice.discount, tax: selectedInvoice.tax, notes: selectedInvoice.notes };
    const updates: Record<string, unknown> = {
      status: newStatus,
      subtotal: editSubtotal,
      discount: editDiscount,
      tax: editTax,
      total: newTotal,
      notes: editNotes,
      due_date: editDueDate || null,
    };
    if (newStatus === 'paid' && selectedInvoice.status !== 'paid') updates.paid_at = new Date().toISOString();

    const { error } = await supabase.from('invoices').update(updates).eq('id', selectedInvoice.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await logAudit('update', 'invoice', selectedInvoice.id, oldValues as any, updates as any);
      toast({ title: language === 'bn' ? 'সফল' : 'Success' });
      setDetailOpen(false);
      fetchInvoices();
    }
    setSaving(false);
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    const { error } = await supabase.from('invoices').delete().eq('id', invoiceToDelete.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await logAudit('delete', 'invoice', invoiceToDelete.id, { invoice_number: invoiceToDelete.invoice_number } as any, null);
      toast({ title: language === 'bn' ? 'ইনভয়েস মুছে ফেলা হয়েছে' : 'Invoice deleted' });
      setDeleteOpen(false);
      setInvoiceToDelete(null);
      fetchInvoices();
    }
  };

  const handleBulkDelete = async (rows: Invoice[]) => {
    const ids = rows.map(r => r.id);
    const { error } = await supabase.from('invoices').delete().in('id', ids);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `${rows.length} invoices deleted` });
      setSelectedRows([]);
      fetchInvoices();
    }
  };

  const handlePrintInvoice = () => {
    if (!selectedInvoice) return;
    const data = [{
      invoice_number: selectedInvoice.invoice_number,
      customer: selectedInvoice.customer_name || 'N/A',
      order: selectedInvoice.orders?.order_number || '-',
      subtotal: `৳${selectedInvoice.subtotal.toLocaleString()}`,
      discount: `৳${(selectedInvoice.discount || 0).toLocaleString()}`,
      tax: `৳${(selectedInvoice.tax || 0).toLocaleString()}`,
      total: `৳${selectedInvoice.total.toLocaleString()}`,
      status: selectedInvoice.status,
      due_date: selectedInvoice.due_date ? format(new Date(selectedInvoice.due_date), 'dd MMM yyyy') : '-',
    }];
    printTable(data, [
      { key: 'invoice_number', header: 'Invoice #' }, { key: 'customer', header: 'Customer' },
      { key: 'order', header: 'Order #' }, { key: 'subtotal', header: 'Subtotal' },
      { key: 'discount', header: 'Discount' }, { key: 'tax', header: 'Tax' },
      { key: 'total', header: 'Total' }, { key: 'status', header: 'Status' },
      { key: 'due_date', header: 'Due Date' },
    ], `Invoice ${selectedInvoice.invoice_number}`);
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(amount);

  const columns: Column<Invoice>[] = [
    {
      key: 'invoice_number', header: language === 'bn' ? 'ইনভয়েস নং' : 'Invoice #', sortable: true,
      render: (row) => (<div><p className="font-medium font-mono">{row.invoice_number}</p><p className="text-sm text-muted-foreground">{row.orders?.order_number || '-'}</p></div>),
      exportValue: (row) => row.invoice_number,
    },
    {
      key: 'customer_name', header: language === 'bn' ? 'কাস্টমার' : 'Customer',
      render: (row) => <span className="font-medium">{row.customer_name || 'N/A'}</span>,
      exportValue: (row) => row.customer_name || 'N/A',
    },
    {
      key: 'created_at', header: language === 'bn' ? 'তারিখ' : 'Date', sortable: true,
      render: (row) => format(new Date(row.created_at), 'dd MMM yyyy'),
      exportValue: (row) => format(new Date(row.created_at), 'dd MMM yyyy'),
    },
    {
      key: 'due_date', header: language === 'bn' ? 'বকেয়া তারিখ' : 'Due Date',
      render: (row) => row.due_date ? format(new Date(row.due_date), 'dd MMM yyyy') : '-',
      exportValue: (row) => row.due_date ? format(new Date(row.due_date), 'dd MMM yyyy') : '-',
    },
    {
      key: 'total', header: language === 'bn' ? 'মোট' : 'Total', sortable: true,
      render: (row) => <span className="font-medium">{formatCurrency(row.total)}</span>,
      exportValue: (row) => String(row.total),
    },
    {
      key: 'status', header: language === 'bn' ? 'স্ট্যাটাস' : 'Status',
      render: (row) => <StatusBadge status={row.status} />,
      exportValue: (row) => row.status,
    },
    {
      key: 'actions', header: language === 'bn' ? 'অ্যাকশন' : 'Actions',
      render: (row) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="icon" variant="ghost" onClick={() => handleViewInvoice(row)}><Eye className="h-4 w-4" /></Button>
          {row.pdf_url && (
            <Button size="icon" variant="ghost" asChild>
              <a href={row.pdf_url} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a>
            </Button>
          )}
          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { setInvoiceToDelete(row); setDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  const filterOptions = INVOICE_STATUSES.map(s => ({ value: s.value, label: language === 'bn' ? s.label_bn : s.label_en }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{language === 'bn' ? 'ইনভয়েস ম্যানেজমেন্ট' : 'Invoices Management'}</h1>
          <p className="text-muted-foreground">{language === 'bn' ? 'সব ইনভয়েস দেখুন এবং পরিচালনা করুন' : 'View and manage all invoices'}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <DataTable
              data={invoices}
              columns={columns}
              loading={loading}
              searchKeys={['invoice_number', 'customer_name']}
              searchPlaceholder={language === 'bn' ? 'ইনভয়েস নং বা কাস্টমার দিয়ে খুঁজুন...' : 'Search by invoice # or customer...'}
              onRowClick={handleViewInvoice}
              filterKey="status"
              filterOptions={filterOptions}
              filterLabel={language === 'bn' ? 'স্ট্যাটাস' : 'Status'}
              exportFilename="invoices"
              exportTitle={language === 'bn' ? 'ইনভয়েস তালিকা' : 'Invoices List'}
              selectable
              selectedRows={selectedRows}
              onSelectionChange={setSelectedRows}
              onBulkDelete={handleBulkDelete}
            />
          </CardContent>
        </Card>
      </div>

      {/* Invoice Detail/Edit Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{language === 'bn' ? 'ইনভয়েস বিস্তারিত' : 'Invoice Details'} - {selectedInvoice?.invoice_number}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="text-sm">
                <Label className="text-muted-foreground">{language === 'bn' ? 'কাস্টমার' : 'Customer'}</Label>
                <p className="font-medium">{selectedInvoice.customer_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>{language === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</Label>
                  <Input type="number" value={editSubtotal} onChange={(e) => setEditSubtotal(Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>{language === 'bn' ? 'ডিসকাউন্ট' : 'Discount'}</Label>
                  <Input type="number" value={editDiscount} onChange={(e) => setEditDiscount(Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>{language === 'bn' ? 'ট্যাক্স' : 'Tax'}</Label>
                  <Input type="number" value={editTax} onChange={(e) => setEditTax(Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>{language === 'bn' ? 'মোট' : 'Total'}</Label>
                  <p className="font-bold text-lg pt-1">{formatCurrency(editSubtotal - editDiscount + editTax)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <Label>{language === 'bn' ? 'বকেয়া তারিখ' : 'Due Date'}</Label>
                <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{language === 'bn' ? 'নোট' : 'Notes'}</Label>
                <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2} />
              </div>
              <div className="space-y-1">
                <Label>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INVOICE_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{language === 'bn' ? s.label_bn : s.label_en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={handlePrintInvoice}>
              <Printer className="h-4 w-4 mr-1" />
              {language === 'bn' ? 'প্রিন্ট' : 'Print'}
            </Button>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>{language === 'bn' ? 'বন্ধ করুন' : 'Close'}</Button>
            <Button onClick={handleUpdateInvoice} disabled={saving}>
              {saving ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'আপডেট করুন' : 'Update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteInvoice}
        title={language === 'bn' ? 'ইনভয়েস মুছে ফেলুন' : 'Delete Invoice'}
        description={language === 'bn' ? `আপনি কি নিশ্চিত যে আপনি ইনভয়েস ${invoiceToDelete?.invoice_number} মুছে ফেলতে চান?` : `Are you sure you want to delete invoice ${invoiceToDelete?.invoice_number}?`}
      />
    </AdminLayout>
  );
}
