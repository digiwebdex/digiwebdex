import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import {
  ShoppingCart,
  FileText,
  Users,
  DollarSign,
  Globe,
  Server,
  FolderKanban,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { ExpiringServicesAlert } from '@/components/admin/analytics/ExpiringServicesAlert';

interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalUsers: number;
  unpaidInvoices: number;
  activeDomains: number;
  activeHosting: number;
  activeProjects: number;
  expiringDomains: number;
  expiringHosting: number;
}

export default function AdminDashboard() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<AdminStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalUsers: 0,
    unpaidInvoices: 0,
    activeDomains: 0,
    activeHosting: 0,
    activeProjects: 0,
    expiringDomains: 0,
    expiringHosting: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        orders,
        invoicesPaid,
        invoicesThisMonth,
        invoicesUnpaid,
        profiles,
        domains,
        hosting,
        projects,
      ] = await Promise.all([
        supabase.from('orders').select('id, status, total'),
        supabase.from('invoices').select('total').eq('status', 'paid'),
        supabase.from('invoices').select('total').eq('status', 'paid').gte('paid_at', startOfMonth.toISOString()),
        supabase.from('invoices').select('id').eq('status', 'unpaid'),
        supabase.from('profiles').select('id'),
        supabase.from('domains').select('id, status, expiry_date'),
        supabase.from('hosting_accounts').select('id, status, expiry_date'),
        supabase.from('projects').select('id, status'),
      ]);

      const totalRevenue = (invoicesPaid.data || []).reduce((sum, inv) => sum + Number(inv.total), 0);
      const monthlyRevenue = (invoicesThisMonth.data || []).reduce((sum, inv) => sum + Number(inv.total), 0);

      const expiringDomains = (domains.data || []).filter(
        (d) => d.expiry_date && new Date(d.expiry_date) <= thirtyDaysFromNow && d.status === 'active'
      ).length;

      const expiringHosting = (hosting.data || []).filter(
        (h) => h.expiry_date && new Date(h.expiry_date) <= thirtyDaysFromNow && h.status === 'active'
      ).length;

      setStats({
        totalOrders: orders.data?.length || 0,
        pendingOrders: orders.data?.filter((o) => o.status === 'pending').length || 0,
        totalRevenue,
        monthlyRevenue,
        totalUsers: profiles.data?.length || 0,
        unpaidInvoices: invoicesUnpaid.data?.length || 0,
        activeDomains: domains.data?.filter((d) => d.status === 'active').length || 0,
        activeHosting: hosting.data?.filter((h) => h.status === 'active').length || 0,
        activeProjects: projects.data?.filter((p) => ['in_progress', 'review'].includes(p.status)).length || 0,
        expiringDomains,
        expiringHosting,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const mainStats = [
    {
      title: language === 'bn' ? 'মোট অর্ডার' : 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: language === 'bn' ? 'মোট আয়' : 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: language === 'bn' ? 'এই মাসের আয়' : 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue),
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: language === 'bn' ? 'মোট ব্যবহারকারী' : 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  const serviceStats = [
    {
      title: language === 'bn' ? 'সক্রিয় ডোমেইন' : 'Active Domains',
      value: stats.activeDomains,
      icon: Globe,
      color: 'text-cyan-500',
    },
    {
      title: language === 'bn' ? 'সক্রিয় হোস্টিং' : 'Active Hosting',
      value: stats.activeHosting,
      icon: Server,
      color: 'text-pink-500',
    },
    {
      title: language === 'bn' ? 'চলমান প্রজেক্ট' : 'Active Projects',
      value: stats.activeProjects,
      icon: FolderKanban,
      color: 'text-indigo-500',
    },
  ];

  const alerts = [
    {
      show: stats.pendingOrders > 0,
      title: language === 'bn' ? 'বিবেচনাধীন অর্ডার' : 'Pending Orders',
      value: stats.pendingOrders,
      type: 'warning',
    },
    {
      show: stats.unpaidInvoices > 0,
      title: language === 'bn' ? 'অপরিশোধিত ইনভয়েস' : 'Unpaid Invoices',
      value: stats.unpaidInvoices,
      type: 'warning',
    },
    {
      show: stats.expiringDomains > 0,
      title: language === 'bn' ? 'মেয়াদ উত্তীর্ণ হচ্ছে (ডোমেইন)' : 'Expiring Domains (30d)',
      value: stats.expiringDomains,
      type: 'error',
    },
    {
      show: stats.expiringHosting > 0,
      title: language === 'bn' ? 'মেয়াদ উত্তীর্ণ হচ্ছে (হোস্টিং)' : 'Expiring Hosting (30d)',
      value: stats.expiringHosting,
      type: 'error',
    },
  ].filter((a) => a.show);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn'
              ? 'আপনার ব্যবসার সারসংক্ষেপ'
              : 'Overview of your business'}
          </p>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {alerts.map((alert, index) => (
              <Card
                key={index}
                className={cn(
                  'border-l-4',
                  alert.type === 'error' ? 'border-l-destructive' : 'border-l-yellow-500'
                )}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <AlertCircle
                    className={cn(
                      'h-5 w-5',
                      alert.type === 'error' ? 'text-destructive' : 'text-yellow-500'
                    )}
                  />
                  <div>
                    <p className="text-sm text-muted-foreground">{alert.title}</p>
                    <p className="text-lg font-bold">{alert.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Main Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mainStats.map((stat, index) => (
            <Card key={index} className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Stats */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{language === 'bn' ? 'সার্ভিস পরিসংখ্যান' : 'Service Statistics'}</CardTitle>
            <CardDescription>
              {language === 'bn'
                ? 'সক্রিয় সার্ভিসগুলোর সংক্ষেপ'
                : 'Overview of active services'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              {serviceStats.map((stat, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="rounded-full bg-muted p-3">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{loading ? '...' : stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Services & Renewal Alerts */}
        <ExpiringServicesAlert />
      </div>
    </AdminLayout>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
