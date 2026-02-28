import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Clock, CheckCircle, XCircle, RefreshCw, Loader2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderStatus = Database['public']['Enums']['order_status'];

export default function OrdersPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: language === 'bn' ? 'বিবেচনাধীন' : 'Pending', variant: 'outline' },
      paid: { label: language === 'bn' ? 'পরিশোধিত' : 'Paid', variant: 'secondary' },
      processing: { label: language === 'bn' ? 'প্রক্রিয়াধীন' : 'Processing', variant: 'default' },
      active: { label: language === 'bn' ? 'সক্রিয়' : 'Active', variant: 'default' },
      completed: { label: language === 'bn' ? 'সম্পন্ন' : 'Completed', variant: 'secondary' },
      cancelled: { label: language === 'bn' ? 'বাতিল' : 'Cancelled', variant: 'destructive' },
      merged: { label: language === 'bn' ? 'মার্জড' : 'Merged', variant: 'secondary' },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'paid':
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'active':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'BDT') => {
    return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'bn' ? 'অর্ডারসমূহ' : 'Orders'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'bn'
                ? 'আপনার সকল অর্ডারের তালিকা দেখুন'
                : 'View all your orders'}
            </p>
          </div>
          <Button onClick={fetchOrders} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                {language === 'bn'
                  ? 'আপনার কোনো অর্ডার নেই'
                  : 'You have no orders yet'}
              </p>
              <Button asChild>
                <a href={`/${language}/pricing`}>
                  {language === 'bn' ? 'অর্ডার করুন' : 'Place an Order'}
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <CardTitle className="text-lg">#{order.order_number}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {language === 'bn' ? 'সার্ভিস টাইপ' : 'Service Type'}
                      </p>
                      <p className="font-medium capitalize">{order.service_type.replace('_', ' ')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {language === 'bn' ? 'বিলিং টাইপ' : 'Billing Type'}
                      </p>
                      <p className="font-medium capitalize">{order.billing_type.replace('_', ' ')}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-sm text-muted-foreground">
                        {language === 'bn' ? 'মোট' : 'Total'}
                      </p>
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(Number(order.total), order.currency || 'BDT')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      {language === 'bn' ? 'বিস্তারিত' : 'Details'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
