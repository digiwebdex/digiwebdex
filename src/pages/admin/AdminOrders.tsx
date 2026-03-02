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
import { Eye, Bell, Send, Trash2, Printer, Plus } from 'lucide-react';
import OrdersBulkActions from '@/components/admin/orders/OrdersBulkActions';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';
import { logAudit } from '@/lib/auditLog';
import { printTable } from '@/lib/exportUtils';
import { createOrderWithItems, type OrderItem as MultiItemOrderItem } from '@/services/multiItemOrderService';

type DbOrderItem = Database['public']['Tables']['order_items']['Row'];

type Order = Database['public']['Tables']['orders']['Row'] & {
  profiles?: { full_name: string | null; phone: string | null } | null;
  services?: { name_en: string; name_bn: string } | null;
  service_packages?: { name_en: string; name_bn: string } | null;
  order_items?: DbOrderItem[] | null;
};

const ORDER_STATUSES = [
  { value: 'pending', label_en: 'Pending', label_bn: 'বিবেচনাধীন' },
  { value: 'paid', label_en: 'Paid', label_bn: 'পরিশোধিত' },
  { value: 'processing', label_en: 'Processing', label_bn: 'প্রক্রিয়াধীন' },
  { value: 'active', label_en: 'Active', label_bn: 'সক্রিয়' },
  { value: 'completed', label_en: 'Completed', label_bn: 'সম্পন্ন' },
  { value: 'cancelled', label_en: 'Cancelled', label_bn: 'বাতিল' },
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

  // Manual order creation state
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [customers, setCustomers] = useState<{ user_id: string; full_name: string | null; phone: string | null }[]>([]);
  const [servicesList, setServicesList] = useState<{ id: string; name_en: string; name_bn: string; service_type: string }[]>([]);
  const [packages, setPackages] = useState<{ id: string; name_en: string; name_bn: string; price: number; service_id: string }[]>([]);

  interface ServiceItem {
    service_id: string;
    package_id: string;
    service_type: string;
    billing_type: string;
    domain_name: string;
    registration_date: string;
    renewal_date: string;
    subtotal: number;
  }

  const emptyServiceItem: ServiceItem = {
    service_id: '', package_id: '', service_type: '', billing_type: 'one_time',
    domain_name: '', registration_date: '', renewal_date: '', subtotal: 0,
  };

  const [createCustomerId, setCreateCustomerId] = useState('');
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([{ ...emptyServiceItem }]);
  const [createDiscount, setCreateDiscount] = useState(0);
  const [createTax, setCreateTax] = useState(0);
  const [createAdvancePayment, setCreateAdvancePayment] = useState(0);
  const [createNotes, setCreateNotes] = useState('');
  const [createAdminNotes, setCreateAdminNotes] = useState('');

  const createSubtotal = serviceItems.reduce((sum, s) => sum + s.subtotal, 0);
  const createTotal = createSubtotal - createDiscount + createTax;

  useEffect(() => { fetchOrders(); fetchCustomersAndServices(); }, []);

  const fetchCustomersAndServices = async () => {
    const [custRes, svcRes, pkgRes] = await Promise.all([
      supabase.from('profiles').select('user_id, full_name, phone').order('full_name'),
      supabase.from('services').select('id, name_en, name_bn, service_type').eq('is_active', true).order('sort_order'),
      supabase.from('service_packages').select('id, name_en, name_bn, price, service_id').eq('is_active', true).order('sort_order'),
    ]);
    if (custRes.data) setCustomers(custRes.data);
    if (svcRes.data) setServicesList(svcRes.data);
    if (pkgRes.data) setPackages(pkgRes.data);
  };

  const updateServiceItem = (index: number, field: keyof ServiceItem, value: string | number) => {
    setServiceItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleItemServiceChange = (index: number, serviceId: string) => {
    const svc = servicesList.find(s => s.id === serviceId);
    setServiceItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        service_id: serviceId,
        package_id: '',
        service_type: svc?.service_type || '',
        billing_type: svc?.service_type === 'hosting' || svc?.service_type === 'domain' ? 'recurring' : 'one_time',
        subtotal: 0,
      };
      return updated;
    });
  };

  const handleItemPackageChange = (index: number, packageId: string) => {
    if (packageId === 'custom') {
      setServiceItems(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], package_id: 'custom', subtotal: 0 };
        return updated;
      });
      return;
    }
    const pkg = packages.find(p => p.id === packageId);
    setServiceItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], package_id: packageId, subtotal: pkg?.price || 0 };
      return updated;
    });
  };

  const addServiceItem = () => setServiceItems(prev => [...prev, { ...emptyServiceItem }]);
  const removeServiceItem = (index: number) => {
    if (serviceItems.length <= 1) return;
    setServiceItems(prev => prev.filter((_, i) => i !== index));
  };

  const resetCreateForm = () => {
    setCreateCustomerId('');
    setServiceItems([{ ...emptyServiceItem }]);
    setCreateDiscount(0);
    setCreateTax(0);
    setCreateAdvancePayment(0);
    setCreateNotes('');
    setCreateAdminNotes('');
  };

  const handleCreateOrder = async () => {
    if (!createCustomerId) {
      toast({ title: language === 'bn' ? 'কাস্টমার নির্বাচন করুন' : 'Select a customer', variant: 'destructive' });
      return;
    }
    for (const item of serviceItems) {
      if (!item.service_id || !item.package_id) {
        toast({ title: language === 'bn' ? 'প্রতিটি সার্ভিসের তথ্য পূরণ করুন' : 'Fill all service fields', variant: 'destructive' });
        return;
      }
      if (item.package_id === 'custom' && item.subtotal <= 0) {
        toast({ title: language === 'bn' ? 'কাস্টম প্রাইস দিন' : 'Enter custom price', variant: 'destructive' });
        return;
      }
    }
    setCreating(true);
    try {
      // Map serviceItems to OrderItem format for multi-item service
      const orderItems: MultiItemOrderItem[] = serviceItems.map(item => {
        const svc = servicesList.find(s => s.id === item.service_id);
        const pkg = item.package_id !== 'custom' ? packages.find(p => p.id === item.package_id) : null;
        return {
          type: item.service_type as Database['public']['Enums']['service_type'],
          package: pkg ? (language === 'bn' ? pkg.name_bn : pkg.name_en) : 'Custom',
          domain: item.domain_name || undefined,
          description: svc ? (language === 'bn' ? svc.name_bn : svc.name_en) : undefined,
          price: item.subtotal,
          qty: 1,
          renewalDate: item.renewal_date || undefined,
        };
      });

      const result = await createOrderWithItems({
        userId: createCustomerId,
        serviceId: serviceItems[0]?.service_id || undefined,
        packageId: serviceItems[0]?.package_id === 'custom' ? undefined : serviceItems[0]?.package_id || undefined,
        serviceType: serviceItems[0]?.service_type as Database['public']['Enums']['service_type'] || undefined,
        items: orderItems,
        discount: createDiscount,
        tax: createTax,
        advance: createAdvancePayment,
        notes: createNotes || undefined,
      });

      await logAudit('create', 'order', result.order.id, null, { order_number: result.order.order_number } as any);

      toast({ title: language === 'bn' ? `✅ অর্ডার তৈরি হয়েছে (${result.order.order_number})` : `✅ Order Created (${result.order.order_number})` });
      setCreateOpen(false);
      resetCreateForm();
      fetchOrders();
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
    setCreating(false);
  };

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`*, services:service_id (name_en, name_bn), service_packages:package_id (name_en, name_bn), order_items (*)`)
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
        const items = row.order_items;
        if (items && items.length > 0) {
          return (
            <div>
              {items.slice(0, 2).map((item, i) => (
                <p key={i} className="text-sm">{item.package_name || item.service_type}</p>
              ))}
              {items.length > 2 && <p className="text-xs text-muted-foreground">+{items.length - 2} more</p>}
            </div>
          );
        }
        const sn = row.services ? (language === 'bn' ? row.services.name_bn : row.services.name_en) : '-';
        const pn = row.service_packages ? (language === 'bn' ? row.service_packages.name_bn : row.service_packages.name_en) : '';
        return (<div><p className="font-medium">{sn}</p>{pn && <p className="text-sm text-muted-foreground">{pn}</p>}</div>);
      },
      exportValue: (row) => {
        if (row.order_items && row.order_items.length > 0) {
          return row.order_items.map(i => i.package_name || i.service_type).join(', ');
        }
        return row.services ? (language === 'bn' ? row.services.name_bn : row.services.name_en) : '-';
      },
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{language === 'bn' ? 'অর্ডার ম্যানেজমেন্ট' : 'Orders Management'}</h1>
            <p className="text-muted-foreground">{language === 'bn' ? 'সব অর্ডার দেখুন এবং পরিচালনা করুন' : 'View and manage all orders'}</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'bn' ? 'নতুন অর্ডার' : 'New Order'}
          </Button>
        </div>

        <OrdersBulkActions
          selectedOrderIds={selectedRows.map(r => r.id)}
          onComplete={() => { setSelectedRows([]); fetchOrders(); }}
        />

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

              {/* Order Items Table */}
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                <div>
                  <Label className="text-muted-foreground mb-2 block">{language === 'bn' ? 'অর্ডার আইটেম' : 'Order Items'}</Label>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-2">#</th>
                          <th className="text-left p-2">{language === 'bn' ? 'সার্ভিস' : 'Service'}</th>
                          <th className="text-left p-2">{language === 'bn' ? 'প্যাকেজ' : 'Package'}</th>
                          <th className="text-right p-2">{language === 'bn' ? 'মূল্য' : 'Price'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.order_items.map((item, i) => (
                          <tr key={item.id} className="border-t">
                            <td className="p-2">{i + 1}</td>
                            <td className="p-2">
                              <span className="capitalize">{item.service_type?.replace('_', ' ')}</span>
                              {item.domain && <div className="text-xs text-muted-foreground">{item.domain}</div>}
                            </td>
                            <td className="p-2">{item.package_name}</td>
                            <td className="p-2 text-right font-medium">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

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

      {/* Create Order Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{language === 'bn' ? 'নতুন অর্ডার তৈরি করুন' : 'Create New Order'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Customer */}
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'কাস্টমার *' : 'Customer *'}</Label>
              <Select value={createCustomerId} onValueChange={setCreateCustomerId}>
                <SelectTrigger><SelectValue placeholder={language === 'bn' ? 'কাস্টমার নির্বাচন করুন' : 'Select customer'} /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.user_id} value={c.user_id}>
                      {c.full_name || 'N/A'} {c.phone ? `(${c.phone})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service Items */}
            {serviceItems.map((item, index) => {
              const filteredPkgs = packages.filter(p => p.service_id === item.service_id);
              return (
                <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">
                      {language === 'bn' ? `সার্ভিস #${index + 1}` : `Service #${index + 1}`}
                    </h4>
                    {serviceItems.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeServiceItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Service & Package */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{language === 'bn' ? 'সার্ভিস *' : 'Service *'}</Label>
                      <Select value={item.service_id} onValueChange={(v) => handleItemServiceChange(index, v)}>
                        <SelectTrigger><SelectValue placeholder={language === 'bn' ? 'সার্ভিস নির্বাচন করুন' : 'Select service'} /></SelectTrigger>
                        <SelectContent>
                          {servicesList.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {language === 'bn' ? s.name_bn : s.name_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{language === 'bn' ? 'প্যাকেজ *' : 'Package *'}</Label>
                      <Select value={item.package_id} onValueChange={(v) => handleItemPackageChange(index, v)} disabled={!item.service_id}>
                        <SelectTrigger><SelectValue placeholder={language === 'bn' ? 'প্যাকেজ নির্বাচন করুন' : 'Select package'} /></SelectTrigger>
                        <SelectContent>
                          {filteredPkgs.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {language === 'bn' ? p.name_bn : p.name_en} - ৳{p.price.toLocaleString()}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom" className="font-semibold border-t">
                            ✏️ {language === 'bn' ? 'কাস্টম (ম্যানুয়াল প্রাইস)' : 'Custom (Manual Price)'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Domain, Dates - Show only for hosting/domain services */}
                  {(item.service_type === 'hosting' || item.service_type === 'domain') && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">{language === 'bn' ? 'ডোমেইন নেইম' : 'Domain Name'}</Label>
                        <Input placeholder="example.com" value={item.domain_name} onChange={(e) => updateServiceItem(index, 'domain_name', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {item.service_type === 'hosting' 
                            ? (language === 'bn' ? 'হোস্টিং রেজিস্ট্রেশন তারিখ' : 'Hosting Reg. Date')
                            : (language === 'bn' ? 'রেজিস্ট্রেশন তারিখ' : 'Reg. Date')}
                        </Label>
                        <Input type="date" value={item.registration_date} onChange={(e) => updateServiceItem(index, 'registration_date', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {item.service_type === 'hosting'
                            ? (language === 'bn' ? 'হোস্টিং রিনিউ তারিখ' : 'Hosting Renewal Date')
                            : (language === 'bn' ? 'রিনিউ তারিখ' : 'Renewal Date')}
                        </Label>
                        <Input type="date" value={item.renewal_date} onChange={(e) => updateServiceItem(index, 'renewal_date', e.target.value)} />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{language === 'bn' ? 'বিলিং টাইপ' : 'Billing Type'}</Label>
                      <Select value={item.billing_type} onValueChange={(v) => updateServiceItem(index, 'billing_type', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one_time">{language === 'bn' ? 'একবার' : 'One Time'}</SelectItem>
                          <SelectItem value="recurring">{language === 'bn' ? 'পুনরাবৃত্তি' : 'Recurring'}</SelectItem>
                          <SelectItem value="milestone">{language === 'bn' ? 'মাইলস্টোন' : 'Milestone'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{language === 'bn' ? 'সার্ভিস টাইপ' : 'Service Type'}</Label>
                      <Input value={item.service_type} readOnly className="bg-muted" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{language === 'bn' ? 'মূল্য (৳)' : 'Price (৳)'}</Label>
                      <Input
                        type="number"
                        placeholder={language === 'bn' ? 'প্রাইস লিখুন' : 'Enter price'}
                        value={item.subtotal || ''}
                        onChange={(e) => updateServiceItem(index, 'subtotal', Number(e.target.value))}
                        min={0}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <Button variant="outline" onClick={addServiceItem} className="w-full border-dashed">
              <Plus className="h-4 w-4 mr-2" />
              {language === 'bn' ? '+ আরেকটি সার্ভিস যোগ করুন' : '+ Add Another Service'}
            </Button>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label className="text-xs">{language === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</Label>
                <Input type="number" value={createSubtotal} readOnly className="bg-muted font-medium" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{language === 'bn' ? 'ডিসকাউন্ট' : 'Discount'}</Label>
                <Input type="number" value={createDiscount} onChange={(e) => setCreateDiscount(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{language === 'bn' ? 'ট্যাক্স' : 'Tax'}</Label>
                <Input type="number" value={createTax} onChange={(e) => setCreateTax(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold">{language === 'bn' ? 'মোট' : 'Total'}</Label>
                <Input type="number" value={createTotal} readOnly className="bg-muted font-bold" />
              </div>
            </div>

            {/* Advance Payment */}
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'অগ্রিম পেমেন্ট' : 'Advance Payment'}</Label>
              <Input type="number" value={createAdvancePayment} onChange={(e) => setCreateAdvancePayment(Number(e.target.value))} min={0} />
            </div>

            {/* Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'কাস্টমার নোট' : 'Customer Notes'}</Label>
                <Textarea value={createNotes} onChange={(e) => setCreateNotes(e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'অ্যাডমিন নোট' : 'Admin Notes'}</Label>
                <Textarea value={createAdminNotes} onChange={(e) => setCreateAdminNotes(e.target.value)} rows={2} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{language === 'bn' ? 'বাতিল' : 'Cancel'}</Button>
            <Button onClick={handleCreateOrder} disabled={creating}>
              {creating ? (language === 'bn' ? 'তৈরি হচ্ছে...' : 'Creating...') : (language === 'bn' ? 'অর্ডার তৈরি করুন' : 'Create Order')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
