import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/i18n';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column, StatusBadge, DeleteConfirmDialog } from '@/components/admin/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Eye, Bell, Send, Trash2, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';
import { logAudit } from '@/lib/auditLog';
import { printTable } from '@/lib/exportUtils';

type Order = Database['public']['Tables']['orders']['Row'] & {
  profiles?: { full_name: string | null; phone: string | null } | null;
  services?: { name_en: string; name_bn: string } | null;
  service_packages?: { name_en: string; name_bn: string } | null;
};

const ORDER_STATUSES = [
  { value: 'pending', label_en: 'Pending', label_bn: 'বিবেচনাধীন' },
  { value: 'paid', label_en: 'Paid', label_bn: 'পরিশোধিত' },
  { value: 'processing', label_en: 'Processing', label_bn: 'প্রক্রিয়াধীন' },
  { value: 'active', label_en: 'Active', label_bn: 'সক্রিয়' },
  { value: 'completed', label_en: 'Completed', label_bn: 'সম্পন্ন' },
  { value: 'cancelled', label_en: 'Cancelled', label_bn: 'বাতিল' },
  { value: 'refunded', label_en: 'Refunded', label_bn: 'ফেরত' },
];

export default function AdminOrders() {
  const { language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [advancePayment, setAdvancePayment] = useState(0);
  const [saving, setSaving] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [selectedRows, setSelectedRows] = useState<Order[]>([]);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`*, services:service_id (name_en, name_bn), service_packages:package_id (name_en, name_bn)`)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      const ordersWithProfiles = await Promise.all(
        (data || []).map(async (order) => {
          if (order.user_id) {
            const { data: profile } = await supabase.from('profiles').select('full_name, phone').eq('user_id', order.user_id).single();
            return { ...order, profiles: profile };
          }
          return { ...order, profiles: null };
        })
      );
      setOrders(ordersWithProfiles as Order[]);
    }
    setLoading(false);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdminNotes(order.admin_notes || '');
    setAdvancePayment((order as any).advance_payment || 0);
    setDetailOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    const oldValues = { status: selectedOrder.status, admin_notes: selectedOrder.admin_notes, advance_payment: (selectedOrder as any).advance_payment };
    const updates: Record<string, unknown> = { status: newStatus, admin_notes: adminNotes, advance_payment: advancePayment };
    if (newStatus === 'completed' && selectedOrder.status !== 'completed') updates.completed_at = new Date().toISOString();
    if (newStatus === 'paid' && selectedOrder.status !== 'paid') updates.paid_at = new Date().toISOString();

    const { error } = await supabase.from('orders').update(updates).eq('id', selectedOrder.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await logAudit('update', 'order', selectedOrder.id, oldValues as any, updates as any);
      toast({ title: language === 'bn' ? 'সফল' : 'Success' });

      // Auto-trigger payment notification
      const previousAdvance = (selectedOrder as any).advance_payment || 0;
      const isFullPaymentNow = advancePayment >= selectedOrder.total && previousAdvance < selectedOrder.total;
      const isPaidStatusNow = newStatus === 'paid' && selectedOrder.status !== 'paid';
      if (isFullPaymentNow || isPaidStatusNow) {
        try {
          const { data: invoice } = await supabase.from('invoices').select('invoice_number').eq('order_id', selectedOrder.id).single();
          await supabase.functions.invoke('contact-notification', {
            body: {
              type: 'payment_completed', orderNumber: selectedOrder.order_number,
              customerName: selectedOrder.profiles?.full_name || 'Customer',
              customerPhone: selectedOrder.profiles?.phone || '',
              userId: selectedOrder.user_id, amount: selectedOrder.total, totalPaid: advancePayment,
              invoiceNumber: invoice?.invoice_number || '',
            },
          });
        } catch (e) { console.error('Notification error:', e); }
      }
      setDetailOpen(false);
      fetchOrders();
    }
    setSaving(false);
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    const { error } = await supabase.from('orders').delete().eq('id', orderToDelete.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await logAudit('delete', 'order', orderToDelete.id, { order_number: orderToDelete.order_number } as any, null);
      toast({ title: language === 'bn' ? 'অর্ডার মুছে ফেলা হয়েছে' : 'Order deleted' });
      setDeleteOpen(false);
      setOrderToDelete(null);
      fetchOrders();
    }
  };

  const handleBulkDelete = async (rows: Order[]) => {
    const ids = rows.map(r => r.id);
    const { error } = await supabase.from('orders').delete().in('id', ids);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? `${rows.length}টি অর্ডার মুছে ফেলা হয়েছে` : `${rows.length} orders deleted` });
      setSelectedRows([]);
      fetchOrders();
    }
  };

  const handlePrintOrder = () => {
    if (!selectedOrder) return;
    const data = [{
      order_number: selectedOrder.order_number,
      customer: selectedOrder.profiles?.full_name || 'N/A',
      service: selectedOrder.services ? (language === 'bn' ? selectedOrder.services.name_bn : selectedOrder.services.name_en) : '-',
      total: `৳${selectedOrder.total.toLocaleString()}`,
      advance: `৳${((selectedOrder as any).advance_payment || 0).toLocaleString()}`,
      due: `৳${(selectedOrder.total - ((selectedOrder as any).advance_payment || 0)).toLocaleString()}`,
      status: selectedOrder.status,
      date: format(new Date(selectedOrder.created_at), 'dd MMM yyyy'),
    }];
    printTable(data, [
      { key: 'order_number', header: 'Order #' }, { key: 'customer', header: 'Customer' },
      { key: 'service', header: 'Service' }, { key: 'total', header: 'Total' },
      { key: 'advance', header: 'Advance' }, { key: 'due', header: 'Due' },
      { key: 'status', header: 'Status' }, { key: 'date', header: 'Date' },
    ], `Order ${selectedOrder.order_number}`);
  };

  const handleSendDueReminder = async (order: Order) => {
    const advance = (order as any).advance_payment || 0;
    const dueAmount = order.total - advance;
    if (dueAmount <= 0) { toast({ title: language === 'bn' ? 'কোনো বাকি নেই' : 'No Due' }); return; }
    setSendingReminder(true);
    try {
      await supabase.functions.invoke('contact-notification', {
        body: {
          type: 'due_payment_reminder', orderNumber: order.order_number,
          customerName: order.profiles?.full_name || 'Customer',
          customerPhone: order.profiles?.phone || '', userId: order.user_id,
          amount: order.total, advancePayment: advance, dueAmount,
        },
      });
      toast({ title: language === 'bn' ? '✅ রিমাইন্ডার পাঠানো হয়েছে' : '✅ Reminder Sent' });
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
    setSendingReminder(false);
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(amount);

  const columns: Column<Order>[] = [
    {
      key: 'order_number', header: language === 'bn' ? 'অর্ডার নং' : 'Order #', sortable: true,
      render: (row) => (<div><p className="font-medium font-mono">{row.order_number}</p><p className="text-sm text-muted-foreground">{format(new Date(row.created_at), 'dd MMM yyyy')}</p></div>),
      exportValue: (row) => row.order_number,
    },
    {
      key: 'customer', header: language === 'bn' ? 'কাস্টমার' : 'Customer',
      render: (row) => (<div><p className="font-medium">{row.profiles?.full_name || 'N/A'}</p><p className="text-sm text-muted-foreground">{row.profiles?.phone || '-'}</p></div>),
      exportValue: (row) => row.profiles?.full_name || 'N/A',
    },
    {
      key: 'service', header: language === 'bn' ? 'সার্ভিস' : 'Service',
      render: (row) => {
        const sn = row.services ? (language === 'bn' ? row.services.name_bn : row.services.name_en) : '-';
        const pn = row.service_packages ? (language === 'bn' ? row.service_packages.name_bn : row.service_packages.name_en) : '';
        return (<div><p className="font-medium">{sn}</p>{pn && <p className="text-sm text-muted-foreground">{pn}</p>}</div>);
      },
      exportValue: (row) => row.services ? (language === 'bn' ? row.services.name_bn : row.services.name_en) : '-',
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
      render: (row) => {
        const due = row.total - ((row as any).advance_payment || 0);
        return (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button size="icon" variant="ghost" onClick={() => handleViewOrder(row)}><Eye className="h-4 w-4" /></Button>
            {due > 0 && <Button size="icon" variant="ghost" className="text-orange-600" onClick={() => handleSendDueReminder(row)} disabled={sendingReminder}><Bell className="h-4 w-4" /></Button>}
            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { setOrderToDelete(row); setDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
          </div>
        );
      },
    },
  ];

  const filterOptions = ORDER_STATUSES.map(s => ({ value: s.value, label: language === 'bn' ? s.label_bn : s.label_en }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{language === 'bn' ? 'অর্ডার ম্যানেজমেন্ট' : 'Orders Management'}</h1>
          <p className="text-muted-foreground">{language === 'bn' ? 'সব অর্ডার দেখুন এবং পরিচালনা করুন' : 'View and manage all orders'}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <DataTable
              data={orders}
              columns={columns}
              loading={loading}
              searchKeys={['order_number']}
              searchPlaceholder={language === 'bn' ? 'অর্ডার নং দিয়ে খুঁজুন...' : 'Search by order number...'}
              onRowClick={handleViewOrder}
              filterKey="status"
              filterOptions={filterOptions}
              filterLabel={language === 'bn' ? 'স্ট্যাটাস' : 'Status'}
              exportFilename="orders"
              exportTitle={language === 'bn' ? 'অর্ডার তালিকা' : 'Orders List'}
              selectable
              selectedRows={selectedRows}
              onSelectionChange={setSelectedRows}
              onBulkDelete={handleBulkDelete}
            />
          </CardContent>
        </Card>
      </div>

      {/* Order Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{language === 'bn' ? 'অর্ডার বিস্তারিত' : 'Order Details'} - {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'কাস্টমার' : 'Customer'}</Label>
                  <p className="font-medium">{selectedOrder.profiles?.full_name || 'N/A'}</p>
                  <p>{selectedOrder.profiles?.phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'তারিখ' : 'Date'}</Label>
                  <p className="font-medium">{format(new Date(selectedOrder.created_at), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'সার্ভিস' : 'Service'}</Label>
                  <p className="font-medium">{selectedOrder.services ? (language === 'bn' ? selectedOrder.services.name_bn : selectedOrder.services.name_en) : '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'মোট' : 'Total'}</Label>
                  <p className="font-medium text-lg">{formatCurrency(selectedOrder.total)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'অগ্রিম পেমেন্ট' : 'Advance Payment'}</Label>
                  <p className="font-medium text-lg text-green-600">{formatCurrency((selectedOrder as any).advance_payment || 0)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'বাকি পেমেন্ট' : 'Due Amount'}</Label>
                  <p className="font-medium text-lg text-red-600">{formatCurrency(selectedOrder.total - ((selectedOrder as any).advance_payment || 0))}</p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'কাস্টমার নোট' : 'Customer Notes'}</Label>
                  <p className="p-3 bg-muted rounded-md">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{language === 'bn' ? s.label_bn : s.label_en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{language === 'bn' ? 'অগ্রিম পেমেন্ট' : 'Advance Payment'}</Label>
                <Input type="number" value={advancePayment} onChange={(e) => setAdvancePayment(Number(e.target.value))} min={0} max={selectedOrder?.total || 0} />
              </div>

              <div className="space-y-2">
                <Label>{language === 'bn' ? 'অ্যাডমিন নোট' : 'Admin Notes'}</Label>
                <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} placeholder={language === 'bn' ? 'অভ্যন্তরীণ নোট...' : 'Internal notes...'} />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={handlePrintOrder}>
              <Printer className="h-4 w-4 mr-1" />
              {language === 'bn' ? 'প্রিন্ট' : 'Print'}
            </Button>
            {selectedOrder && (selectedOrder.total - ((selectedOrder as any).advance_payment || 0)) > 0 && (
              <Button variant="outline" className="border-orange-500 text-orange-600" onClick={() => selectedOrder && handleSendDueReminder(selectedOrder)} disabled={sendingReminder}>
                <Send className="h-4 w-4 mr-2" />
                {sendingReminder ? (language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...') : (language === 'bn' ? 'ডিউ রিমাইন্ডার' : 'Due Reminder')}
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>{language === 'bn' ? 'বন্ধ করুন' : 'Close'}</Button>
              <Button onClick={handleUpdateOrder} disabled={saving}>
                {saving ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'আপডেট করুন' : 'Update')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteOrder}
        title={language === 'bn' ? 'অর্ডার মুছে ফেলুন' : 'Delete Order'}
        description={language === 'bn' ? `আপনি কি নিশ্চিত যে আপনি অর্ডার ${orderToDelete?.order_number} মুছে ফেলতে চান?` : `Are you sure you want to delete order ${orderToDelete?.order_number}?`}
      />
    </AdminLayout>
  );
}
