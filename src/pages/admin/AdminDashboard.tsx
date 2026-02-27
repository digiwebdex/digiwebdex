import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Users, ShoppingCart, DollarSign, AlertCircle, RefreshCcw, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/admin/dashboard/StatCard';
import { RecentActivityFeed } from '@/components/admin/dashboard/RecentActivityFeed';
import { ExpiringServicesAlert } from '@/components/admin/analytics/ExpiringServicesAlert';

interface DashboardStats {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  totalDue: number;
  activeServices: number;
  todayIncome: number;
}

async function getDashboardStats(): Promise<DashboardStats> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [profiles, orders, paidInvoices, dueInvoices, subscriptions, todayPaid] =
    await Promise.all([
      supabase.from('profiles').select('id'),
      supabase.from('orders').select('id'),
      supabase.from('invoices').select('total').eq('status', 'paid'),
      supabase.from('invoices').select('due_amount').in('status', ['unpaid', 'partial']),
      supabase.from('subscriptions').select('id').eq('status', 'active'),
      supabase.from('invoices').select('total').eq('status', 'paid').gte('paid_at', todayStart.toISOString()),
    ]);

  return {
    totalCustomers: profiles.data?.length || 0,
    totalOrders: orders.data?.length || 0,
    totalRevenue: (paidInvoices.data || []).reduce((s, i) => s + Number(i.total), 0),
    totalDue: (dueInvoices.data || []).reduce((s, i) => s + Number(i.due_amount || 0), 0),
    activeServices: subscriptions.data?.length || 0,
    todayIncome: (todayPaid.data || []).reduce((s, i) => s + Number(i.total), 0),
  };
}

export default function AdminDashboard() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((e) => console.error('Stats fetch failed:', e))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(n);

  const s = stats || { totalCustomers: 0, totalOrders: 0, totalRevenue: 0, totalDue: 0, activeServices: 0, todayIncome: 0 };

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

        {/* Stat Widgets */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title={language === 'bn' ? 'মোট কাস্টমার' : 'Total Customers'} value={s.totalCustomers} icon={Users} color="text-blue-500" bgColor="bg-blue-500/10" loading={loading} />
          <StatCard title={language === 'bn' ? 'মোট অর্ডার' : 'Total Orders'} value={s.totalOrders} icon={ShoppingCart} color="text-green-500" bgColor="bg-green-500/10" loading={loading} />
          <StatCard title={language === 'bn' ? 'মোট আয়' : 'Total Revenue'} value={fmt(s.totalRevenue)} icon={DollarSign} color="text-purple-500" bgColor="bg-purple-500/10" loading={loading} />
          <StatCard title={language === 'bn' ? 'মোট বকেয়া' : 'Total Due'} value={fmt(s.totalDue)} icon={AlertCircle} color="text-red-500" bgColor="bg-red-500/10" loading={loading} />
          <StatCard title={language === 'bn' ? 'সক্রিয় সার্ভিস' : 'Active Services'} value={s.activeServices} icon={RefreshCcw} color="text-cyan-500" bgColor="bg-cyan-500/10" loading={loading} />
          <StatCard title={language === 'bn' ? 'আজকের আয়' : 'Today Income'} value={fmt(s.todayIncome)} icon={TrendingUp} color="text-orange-500" bgColor="bg-orange-500/10" loading={loading} />
        </div>

        {/* Recent Activity */}
        <RecentActivityFeed />

        {/* Expiring Services */}
        <ExpiringServicesAlert />
      </div>
    </AdminLayout>
  );
}
