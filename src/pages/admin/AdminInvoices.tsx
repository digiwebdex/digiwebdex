import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Eye, Download, Trash2, Printer, Pencil, Plus, FileText, MessageSquare, Mail } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';
import { logAudit } from '@/lib/auditLog';
import { printTable } from '@/lib/exportUtils';

type Invoice = Database['public']['Tables']['invoices']['Row'] & {
  orders?: { order_number: string; service_type: string } | null;
  customer_name?: string;
  items?: any[];
};

const INVOICE_STATUSES = [
  { value: 'unpaid', label_en: 'Unpaid', label_bn: 'অপরিশোধিত' },
  { value: 'partial', label_en: 'Partial', label_bn: 'আংশিক' },
  { value: 'paid', label_en: 'Paid', label_bn: 'পরিশোধিত' },
  { value: 'overdue', label_en: 'Overdue', label_bn: 'বকেয়া' },
  { value: 'cancelled', label_en: 'Cancelled', label_bn: 'বাতিল' },
];

export default function AdminInvoices() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const basePath = language === 'en' ? '/en' : '/bn';
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
  const [editAdvancePaid, setEditAdvancePaid] = useState(0);
  const [editNotes, setEditNotes] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  // Create invoice
  const [createOpen, setCreateOpen] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [newInvUserId, setNewInvUserId] = useState('');
  const [newInvOrderId, setNewInvOrderId] = useState('');
  const [newInvSubtotal, setNewInvSubtotal] = useState(0);
  const [newInvDiscount, setNewInvDiscount] = useState(0);
  const [newInvTax, setNewInvTax] = useState(0);
  const [newInvAdvancePaid, setNewInvAdvancePaid] = useState(0);
  const [newInvDueDate, setNewInvDueDate] = useState('');
  const [newInvNotes, setNewInvNotes] = useState('');
  const [customers, setCustomers] = useState<{ user_id: string; full_name: string }[]>([]);
  const [orders, setOrders] = useState<{ id: string; order_number: string }[]>([]);

  useEffect(() => { fetchInvoices(); fetchCustomers(); fetchOrders(); }, []);

  const fetchCustomers = async () => {
    const { data } = await supabase.from('profiles').select('user_id, full_name').order('full_name');
    setCustomers((data || []).filter(p => p.full_name));
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('id, order_number').order('created_at', { ascending: false });
    setOrders(data || []);
  };

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
    setEditAdvancePaid((invoice as any).advance_paid || 0);
    setEditNotes(invoice.notes || '');
    setEditDueDate(invoice.due_date || '');
    setDetailOpen(true);
  };

  const handleUpdateInvoice = async () => {
    if (!selectedInvoice) return;
    setSaving(true);
    const newTotal = editSubtotal - editDiscount + editTax;
    let dueAmount = newTotal - editAdvancePaid;
    const finalStatus = newStatus; // admin can override
    // If marked as paid or cancelled, force due_amount to 0
    if (finalStatus === 'paid' || finalStatus === 'cancelled') {
      dueAmount = 0;
    }
    const oldValues = { status: selectedInvoice.status, subtotal: selectedInvoice.subtotal, discount: selectedInvoice.discount, tax: selectedInvoice.tax, notes: selectedInvoice.notes };
    const updates: Record<string, unknown> = {
      status: finalStatus,
      subtotal: editSubtotal,
      discount: editDiscount,
      tax: editTax,
      total: newTotal,
      advance_paid: editAdvancePaid,
      due_amount: dueAmount,
      notes: editNotes,
      due_date: editDueDate || null,
    };
    if (finalStatus === 'paid' && selectedInvoice.status !== 'paid') updates.paid_at = new Date().toISOString();

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

  const handleCreateInvoice = async () => {
    if (!newInvUserId || newInvSubtotal <= 0) {
      toast({ title: language === 'bn' ? 'ত্রুটি' : 'Error', description: language === 'bn' ? 'কাস্টমার এবং সাবটোটাল আবশ্যক' : 'Customer and subtotal are required', variant: 'destructive' });
      return;
    }
    setCreateSaving(true);
    const total = newInvSubtotal - newInvDiscount + newInvTax;
    const dueAmount = total - newInvAdvancePaid;
    const { data: invNum } = await supabase.rpc('generate_invoice_number');
    const invoiceData: any = {
      invoice_number: invNum || `INV-${Date.now()}`,
      user_id: newInvUserId,
      order_id: (newInvOrderId && newInvOrderId !== 'none') ? newInvOrderId : null,
      subtotal: newInvSubtotal,
      discount: newInvDiscount,
      tax: newInvTax,
      total,
      advance_paid: newInvAdvancePaid,
      due_amount: dueAmount,
      status: dueAmount <= 0 ? 'paid' : newInvAdvancePaid > 0 ? 'partial' : 'unpaid',
      due_date: newInvDueDate || null,
      notes: newInvNotes || null,
      currency: 'BDT',
    };
    const { error } = await supabase.from('invoices').insert(invoiceData);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await logAudit('create', 'invoice', null as any, null, invoiceData);
      toast({ title: language === 'bn' ? 'ইনভয়েস তৈরি হয়েছে' : 'Invoice created successfully' });
      setCreateOpen(false);
      resetCreateForm();
      fetchInvoices();
    }
    setCreateSaving(false);
  };

  const resetCreateForm = () => {
    setNewInvUserId('');
    setNewInvOrderId('');
    setNewInvSubtotal(0);
    setNewInvDiscount(0);
    setNewInvTax(0);
    setNewInvAdvancePaid(0);
    setNewInvDueDate('');
    setNewInvNotes('');
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

  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  const sendDueReminder = async (invoice: Invoice, channel: 'sms' | 'email') => {
    const due = (invoice as any).due_amount || 0;
    if (due <= 0) {
      toast({ title: language === 'bn' ? 'কোনো বকেয়া নেই' : 'No due amount', variant: 'destructive' });
      return;
    }

    setSendingReminder(`${invoice.id}-${channel}`);
    try {
      // Get customer profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('user_id', invoice.user_id!)
        .single();

      if (channel === 'sms') {
        if (!profile?.phone) {
          toast({ title: language === 'bn' ? 'ফোন নম্বর পাওয়া যায়নি' : 'Phone number not found', variant: 'destructive' });
          setSendingReminder(null);
          return;
        }
        const message = `DigiWebDex: প্রিয় ${profile.full_name || 'Customer'}, আপনার ইনভয়েস ${invoice.invoice_number} এ ৳${due.toLocaleString()} বকেয়া আছে। ${invoice.due_date ? `বকেয়া তারিখ: ${format(new Date(invoice.due_date), 'dd MMM yyyy')}।` : ''} পেমেন্ট করুন: 01674533303`;
        const { error } = await supabase.functions.invoke('send-sms', {
          body: { phone: profile.phone, message, type: 'customer', metadata: { invoice_id: invoice.id } },
        });
        if (error) throw error;
        toast({ title: language === 'bn' ? 'এসএমএস পাঠানো হয়েছে ✅' : 'SMS sent ✅' });
      } else {
        // Email reminder via contact-notification (resolves email server-side from auth)
        const { data: result, error } = await supabase.functions.invoke('contact-notification', {
          body: {
            type: 'due_payment_reminder',
            userId: invoice.user_id,
            customerName: profile?.full_name || 'Customer',
            customerPhone: profile?.phone || '',
            orderNumber: invoice.invoice_number,
            invoiceNumber: invoice.invoice_number,
            amount: Number(invoice.total),
            advancePayment: Number(invoice.advance_paid || 0),
            dueAmount: due,
          },
        });
        if (error) throw error;
        if (!result?.success) throw new Error(result?.error || 'Failed to send');
        toast({ title: language === 'bn' ? 'ইমেইল পাঠানো হয়েছে ✅' : 'Email sent ✅' });
      }

      await logAudit('due_reminder', 'invoice', invoice.id, null, { channel, due_amount: due } as any);
    } catch (err: any) {
      toast({ title: language === 'bn' ? 'ব্যর্থ হয়েছে' : 'Failed', description: err.message, variant: 'destructive' });
    }
    setSendingReminder(null);
  };

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
      key: 'advance_paid', header: language === 'bn' ? 'অগ্রিম' : 'Paid',
      render: (row) => <span className="text-green-600">{formatCurrency((row as any).advance_paid || 0)}</span>,
      exportValue: (row) => String((row as any).advance_paid || 0),
    },
    {
      key: 'due_amount', header: language === 'bn' ? 'বাকি' : 'Due',
      render: (row) => {
        const due = (row as any).due_amount || 0;
        return <span className={due > 0 ? 'text-red-600 font-medium' : ''}>{formatCurrency(due)}</span>;
      },
      exportValue: (row) => String((row as any).due_amount || 0),
    },
    {
      key: 'status', header: language === 'bn' ? 'স্ট্যাটাস' : 'Status',
      render: (row) => <StatusBadge status={row.status} />,
      exportValue: (row) => row.status,
    },
    {
      key: 'actions', header: language === 'bn' ? 'অ্যাকশন' : 'Actions',
      render: (row) => {
        const due = (row as any).due_amount || 0;
        const hasDue = due > 0;
        return (
          <TooltipProvider>
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              {hasDue && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        disabled={sendingReminder === `${row.id}-sms`}
                        onClick={() => sendDueReminder(row, 'sms')}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{language === 'bn' ? 'এসএমএস রিমাইন্ডার' : 'SMS Reminder'}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        disabled={sendingReminder === `${row.id}-email`}
                        onClick={() => sendDueReminder(row, 'email')}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{language === 'bn' ? 'ইমেইল রিমাইন্ডার' : 'Email Reminder'}</TooltipContent>
                  </Tooltip>
                </>
              )}
              <Button size="icon" variant="ghost" onClick={() => handleViewInvoice(row)}><Eye className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => navigate(`${basePath}/admin/invoices/${row.id}`)} title="Invoice PDF"><FileText className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { setInvoiceToDelete(row); setDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </TooltipProvider>
        );
      },
    },
  ];

  const filterOptions = INVOICE_STATUSES.map(s => ({ value: s.value, label: language === 'bn' ? s.label_bn : s.label_en }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{language === 'bn' ? 'ইনভয়েস ম্যানেজমেন্ট' : 'Invoices Management'}</h1>
            <p className="text-muted-foreground">{language === 'bn' ? 'সব ইনভয়েস দেখুন এবং পরিচালনা করুন' : 'View and manage all invoices'}</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'bn' ? 'নতুন ইনভয়েস' : 'New Invoice'}
          </Button>
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
                <div className="space-y-1">
                  <Label>{language === 'bn' ? 'অগ্রিম পেমেন্ট' : 'Advance Paid'}</Label>
                  <Input type="number" value={editAdvancePaid} onChange={(e) => setEditAdvancePaid(Number(e.target.value))} min={0} />
                </div>
                <div className="space-y-1">
                  <Label>{language === 'bn' ? 'বাকি' : 'Due Amount'}</Label>
                  <p className="font-bold text-lg pt-1 text-destructive">{formatCurrency((editSubtotal - editDiscount + editTax) - editAdvancePaid)}</p>
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

      {/* Create Invoice Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{language === 'bn' ? 'নতুন ইনভয়েস তৈরি করুন' : 'Create New Invoice'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>{language === 'bn' ? 'কাস্টমার' : 'Customer'} *</Label>
              <Select value={newInvUserId} onValueChange={setNewInvUserId}>
                <SelectTrigger><SelectValue placeholder={language === 'bn' ? 'কাস্টমার নির্বাচন করুন' : 'Select customer'} /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.user_id} value={c.user_id}>{c.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{language === 'bn' ? 'অর্ডার (ঐচ্ছিক)' : 'Order (Optional)'}</Label>
              <Select value={newInvOrderId} onValueChange={setNewInvOrderId}>
                <SelectTrigger><SelectValue placeholder={language === 'bn' ? 'অর্ডার নির্বাচন করুন' : 'Select order'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{language === 'bn' ? 'কোনো অর্ডার নেই' : 'No order'}</SelectItem>
                  {orders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.order_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{language === 'bn' ? 'সাবটোটাল' : 'Subtotal'} *</Label>
                <Input type="number" value={newInvSubtotal} onChange={(e) => setNewInvSubtotal(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label>{language === 'bn' ? 'ডিসকাউন্ট' : 'Discount'}</Label>
                <Input type="number" value={newInvDiscount} onChange={(e) => setNewInvDiscount(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label>{language === 'bn' ? 'ট্যাক্স' : 'Tax'}</Label>
                <Input type="number" value={newInvTax} onChange={(e) => setNewInvTax(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label>{language === 'bn' ? 'মোট' : 'Total'}</Label>
                <p className="font-bold text-lg pt-1">{formatCurrency(newInvSubtotal - newInvDiscount + newInvTax)}</p>
              </div>
              <div className="space-y-1">
                <Label>{language === 'bn' ? 'অগ্রিম পেমেন্ট' : 'Advance Paid'}</Label>
                <Input type="number" value={newInvAdvancePaid} onChange={(e) => setNewInvAdvancePaid(Number(e.target.value))} min={0} />
              </div>
              <div className="space-y-1">
                <Label>{language === 'bn' ? 'বাকি' : 'Due'}</Label>
                <p className="font-bold text-lg pt-1 text-destructive">{formatCurrency((newInvSubtotal - newInvDiscount + newInvTax) - newInvAdvancePaid)}</p>
              </div>
            </div>
            <div className="space-y-1">
              <Label>{language === 'bn' ? 'বকেয়া তারিখ' : 'Due Date'}</Label>
              <Input type="date" value={newInvDueDate} onChange={(e) => setNewInvDueDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{language === 'bn' ? 'নোট' : 'Notes'}</Label>
              <Textarea value={newInvNotes} onChange={(e) => setNewInvNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{language === 'bn' ? 'বাতিল' : 'Cancel'}</Button>
            <Button onClick={handleCreateInvoice} disabled={createSaving}>
              {createSaving ? (language === 'bn' ? 'তৈরি হচ্ছে...' : 'Creating...') : (language === 'bn' ? 'ইনভয়েস তৈরি করুন' : 'Create Invoice')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
