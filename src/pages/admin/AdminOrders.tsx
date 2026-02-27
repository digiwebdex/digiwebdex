import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/i18n';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column, StatusBadge } from '@/components/admin/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Eye, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        services:service_id (name_en, name_bn),
        service_packages:package_id (name_en, name_bn)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      // Fetch profiles separately for each order
      const ordersWithProfiles = await Promise.all(
        (data || []).map(async (order) => {
          if (order.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, phone')
              .eq('user_id', order.user_id)
              .single();
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

    const updates: Record<string, unknown> = { 
      status: newStatus, 
      admin_notes: adminNotes,
      advance_payment: advancePayment,
    };
    
    if (newStatus === 'completed' && selectedOrder.status !== 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    if (newStatus === 'paid' && selectedOrder.status !== 'paid') {
      updates.paid_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', selectedOrder.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Success', description: language === 'bn' ? 'অর্ডার আপডেট হয়েছে' : 'Order updated' });
      setDetailOpen(false);
      fetchOrders();
    }
    setSaving(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns: Column<Order>[] = [
    {
      key: 'order_number',
      header: language === 'bn' ? 'অর্ডার নং' : 'Order #',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium font-mono">{row.order_number}</p>
          <p className="text-sm text-muted-foreground">{format(new Date(row.created_at), 'dd MMM yyyy')}</p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: language === 'bn' ? 'কাস্টমার' : 'Customer',
      render: (row) => (
        <div>
          <p className="font-medium">{row.profiles?.full_name || 'N/A'}</p>
          <p className="text-sm text-muted-foreground">{row.profiles?.phone || '-'}</p>
        </div>
      ),
    },
    {
      key: 'service',
      header: language === 'bn' ? 'সার্ভিস' : 'Service',
      render: (row) => {
        const serviceName = row.services ? (language === 'bn' ? row.services.name_bn : row.services.name_en) : '-';
        const packageName = row.service_packages ? (language === 'bn' ? row.service_packages.name_bn : row.service_packages.name_en) : '';
        return (
          <div>
            <p className="font-medium">{serviceName}</p>
            {packageName && <p className="text-sm text-muted-foreground">{packageName}</p>}
          </div>
        );
      },
    },
    {
      key: 'total',
      header: language === 'bn' ? 'মোট' : 'Total',
      sortable: true,
      render: (row) => <span className="font-medium">{formatCurrency(row.total)}</span>,
    },
    {
      key: 'status',
      header: language === 'bn' ? 'স্ট্যাটাস' : 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: language === 'bn' ? 'অ্যাকশন' : 'Actions',
      render: (row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button size="icon" variant="ghost" onClick={() => handleViewOrder(row)}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{language === 'bn' ? 'অর্ডার ম্যানেজমেন্ট' : 'Orders Management'}</h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'সব অর্ডার দেখুন এবং পরিচালনা করুন' : 'View and manage all orders'}
          </p>
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
            />
          </CardContent>
        </Card>
      </div>

      {/* Order Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'bn' ? 'অর্ডার বিস্তারিত' : 'Order Details'} - {selectedOrder?.order_number}
            </DialogTitle>
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
                  <p className="font-medium">
                    {selectedOrder.services ? (language === 'bn' ? selectedOrder.services.name_bn : selectedOrder.services.name_en) : '-'}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedOrder.service_packages ? (language === 'bn' ? selectedOrder.service_packages.name_bn : selectedOrder.service_packages.name_en) : ''}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'মোট' : 'Total'}</Label>
                  <p className="font-medium text-lg">{formatCurrency(selectedOrder.total)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'অগ্রিম পেমেন্ট' : 'Advance Payment'}</Label>
                  <p className="font-medium text-lg text-green-600">{formatCurrency((selectedOrder as any).advance_payment || 0)}</p>
                </div>
                <div className="col-span-2">
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {language === 'bn' ? s.label_bn : s.label_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{language === 'bn' ? 'অগ্রিম পেমেন্ট' : 'Advance Payment'}</Label>
                <Input
                  type="number"
                  value={advancePayment}
                  onChange={(e) => setAdvancePayment(Number(e.target.value))}
                  min={0}
                  max={selectedOrder?.total || 0}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>{language === 'bn' ? 'অ্যাডমিন নোট' : 'Admin Notes'}</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder={language === 'bn' ? 'অভ্যন্তরীণ নোট...' : 'Internal notes...'}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </Button>
            <Button onClick={handleUpdateOrder} disabled={saving}>
              {saving ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'আপডেট করুন' : 'Update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
