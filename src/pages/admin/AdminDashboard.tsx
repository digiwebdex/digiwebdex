import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  Users,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  RefreshCcw,
  TrendingUp,
} from 'lucide-react';
import { ExpiringServicesAlert } from '@/components/admin/analytics/ExpiringServicesAlert';

interface AdminStats {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  totalDue: number;
  activeServices: number;
  todayIncome: number;
}

export default function AdminDashboard() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<AdminStats>({
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalDue: 0,
    activeServices: 0,
    todayIncome: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [profiles, orders, paidInvoices, unpaidInvoices, subscriptions, todayPaid] =
        await Promise.all([
          supabase.from('profiles').select('id'),
          supabase.from('orders').select('id'),
          supabase.from('invoices').select('total').eq('status', 'paid'),
          supabase.from('invoices').select('due_amount').in('status', ['unpaid', 'partial']),
          supabase.from('subscriptions').select('id').eq('status', 'active'),
          supabase
            .from('invoices')
            .select('total')
            .eq('status', 'paid')
            .gte('paid_at', todayStart.toISOString()),
        ]);

      setStats({
        totalCustomers: profiles.data?.length || 0,
        totalOrders: orders.data?.length || 0,
        totalRevenue: (paidInvoices.data || []).reduce((s, i) => s + Number(i.total), 0),
        totalDue: (unpaidInvoices.data || []).reduce((s, i) => s + Number(i.due_amount || 0), 0),
        activeServices: subscriptions.data?.length || 0,
        todayIncome: (todayPaid.data || []).reduce((s, i) => s + Number(i.total), 0),
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (amount: number) =>
    new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);

  const widgets = [
    {
      title: language === 'bn' ? 'মোট কাস্টমার' : 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: language === 'bn' ? 'মোট অর্ডার' : 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: language === 'bn' ? 'মোট আয়' : 'Total Revenue',
      value: fmt(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: language === 'bn' ? 'মোট বকেয়া' : 'Total Due',
      value: fmt(stats.totalDue),
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: language === 'bn' ? 'সক্রিয় সার্ভিস' : 'Active Services',
      value: stats.activeServices,
      icon: RefreshCcw,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: language === 'bn' ? 'আজকের আয়' : 'Today Income',
      value: fmt(stats.todayIncome),
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'আপনার ব্যবসার সারসংক্ষেপ' : 'Overview of your business'}
          </p>
        </div>

        {/* Dashboard Widgets */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {widgets.map((w, i) => (
            <Card key={i} className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {w.title}
                </CardTitle>
                <div className={cn('rounded-lg p-2', w.bgColor)}>
                  <w.icon className={cn('h-5 w-5', w.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : w.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <ExpiringServicesAlert />
      </div>
    </AdminLayout>
  );
}
