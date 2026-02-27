import React, { useEffect, useState } from 'react';
import { ExportToolbar } from '@/components/admin/common/ExportToolbar';
import { useLanguage } from '@/lib/i18n';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { subscriptionService, type SubscriptionWithDetails, type SubscriptionStats } from '@/services/subscription';
import { StatusBadge } from '@/components/admin/common/StatusBadge';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Users, 
  AlertTriangle,
  DollarSign,
  Calendar,
  Search,
  Pause,
  Play,
  XCircle,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSubscriptions() {
  const { language } = useLanguage();
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsData, statsData] = await Promise.all([
        subscriptionService.getSubscriptions(
          statusFilter !== 'all' ? { status: statusFilter as any } : undefined
        ),
        subscriptionService.getSubscriptionStats(),
      ]);
      setSubscriptions(subsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error(language === 'bn' ? 'ডেটা লোড করতে ব্যর্থ' : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (subscriptionId: string) => {
    try {
      await subscriptionService.suspendSubscription(subscriptionId, 'Manual suspension by admin');
      toast.success(language === 'bn' ? 'সাবস্ক্রিপশন স্থগিত' : 'Subscription suspended');
      fetchData();
    } catch (error) {
      toast.error(language === 'bn' ? 'স্থগিত করতে ব্যর্থ' : 'Failed to suspend');
    }
  };

  const handleReactivate = async (subscriptionId: string) => {
    try {
      await subscriptionService.reactivateSubscription(subscriptionId);
      toast.success(language === 'bn' ? 'সাবস্ক্রিপশন পুনরায় সক্রিয়' : 'Subscription reactivated');
      fetchData();
    } catch (error) {
      toast.error(language === 'bn' ? 'পুনরায় সক্রিয় করতে ব্যর্থ' : 'Failed to reactivate');
    }
  };

  const handleCancel = async (subscriptionId: string) => {
    try {
      await subscriptionService.cancelSubscription(subscriptionId, 'Cancelled by admin');
      toast.success(language === 'bn' ? 'সাবস্ক্রিপশন বাতিল' : 'Subscription cancelled');
      fetchData();
    } catch (error) {
      toast.error(language === 'bn' ? 'বাতিল করতে ব্যর্থ' : 'Failed to cancel');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      sub.plan_name.toLowerCase().includes(query) ||
      sub.service_type.toLowerCase().includes(query) ||
      (sub.profile as any)?.full_name?.toLowerCase().includes(query)
    );
  });

  const statsCards = [
    {
      title: language === 'bn' ? 'সক্রিয় সাবস্ক্রিপশন' : 'Active Subscriptions',
      value: stats?.totalActive || 0,
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: language === 'bn' ? 'মাসিক রেকারিং রেভিনিউ (MRR)' : 'Monthly Recurring Revenue',
      value: formatCurrency(stats?.mrr || 0),
      icon: DollarSign,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: language === 'bn' ? 'বার্ষিক রেকারিং রেভিনিউ (ARR)' : 'Annual Recurring Revenue',
      value: formatCurrency(stats?.arr || 0),
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: language === 'bn' ? 'চার্ন রেট' : 'Churn Rate',
      value: `${(stats?.churnRate || 0).toFixed(1)}%`,
      icon: TrendingDown,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: language === 'bn' ? 'নবায়ন সাফল্যের হার' : 'Renewal Success Rate',
      value: `${(stats?.renewalSuccessRate || 0).toFixed(1)}%`,
      icon: RefreshCw,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: language === 'bn' ? 'আসন্ন নবায়ন' : 'Upcoming Renewals',
      value: stats?.upcomingRenewals || 0,
      icon: Calendar,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'bn' ? 'সাবস্ক্রিপশন ম্যানেজমেন্ট' : 'Subscription Management'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'bn'
                ? 'সাবস্ক্রিপশন এবং রেকারিং বিলিং পরিচালনা করুন'
                : 'Manage subscriptions and recurring billing'}
            </p>
          </div>
          <div className="flex gap-2">
            <ExportToolbar
              data={subscriptions.map(s => ({ plan: s.plan_name, service: s.service_type, customer: (s.profile as any)?.full_name || 'N/A', amount: String(s.amount), cycle: s.billing_cycle, status: s.status, next_billing: s.next_billing_date } as Record<string, unknown>))}
              columns={[{ key: 'plan', header: 'Plan' }, { key: 'service', header: 'Service' }, { key: 'customer', header: 'Customer' }, { key: 'amount', header: 'Amount' }, { key: 'cycle', header: 'Cycle' }, { key: 'status', header: 'Status' }, { key: 'next_billing', header: 'Next Billing' }]}
              filename="subscriptions"
              title={language === 'bn' ? 'সাবস্ক্রিপশন' : 'Subscriptions'}
            />
            <Button onClick={fetchData} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              {language === 'bn' ? 'ওভারভিউ' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="subscriptions">
              <CreditCard className="h-4 w-4 mr-2" />
              {language === 'bn' ? 'সাবস্ক্রিপশন' : 'Subscriptions'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {statsCards.map((stat, index) => (
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

            {/* Alerts */}
            {stats && stats.totalSuspended > 0 && (
              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="flex items-center gap-3 p-4">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">
                      {language === 'bn'
                        ? `${stats.totalSuspended} টি সাবস্ক্রিপশন স্থগিত`
                        : `${stats.totalSuspended} subscriptions suspended`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'bn'
                        ? 'পেমেন্ট বকেয়ার কারণে স্থগিত'
                        : 'Suspended due to overdue payments'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6 mt-6">
            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={language === 'bn' ? 'সার্চ করুন...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder={language === 'bn' ? 'স্ট্যাটাস' : 'Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'bn' ? 'সব' : 'All'}</SelectItem>
                  <SelectItem value="active">{language === 'bn' ? 'সক্রিয়' : 'Active'}</SelectItem>
                  <SelectItem value="suspended">{language === 'bn' ? 'স্থগিত' : 'Suspended'}</SelectItem>
                  <SelectItem value="cancelled">{language === 'bn' ? 'বাতিল' : 'Cancelled'}</SelectItem>
                  <SelectItem value="pending">{language === 'bn' ? 'বিচারাধীন' : 'Pending'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subscriptions Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'bn' ? 'গ্রাহক' : 'Customer'}</TableHead>
                      <TableHead>{language === 'bn' ? 'প্ল্যান' : 'Plan'}</TableHead>
                      <TableHead>{language === 'bn' ? 'সার্ভিস' : 'Service'}</TableHead>
                      <TableHead>{language === 'bn' ? 'সাইকেল' : 'Cycle'}</TableHead>
                      <TableHead>{language === 'bn' ? 'পরিমাণ' : 'Amount'}</TableHead>
                      <TableHead>{language === 'bn' ? 'পরবর্তী বিলিং' : 'Next Billing'}</TableHead>
                      <TableHead>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                      <TableHead>{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : filteredSubscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          {language === 'bn' ? 'কোনো সাবস্ক্রিপশন পাওয়া যায়নি' : 'No subscriptions found'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {(subscription.profile as any)?.full_name || 'N/A'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(subscription.profile as any)?.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{subscription.plan_name}</TableCell>
                          <TableCell>{subscription.service_type}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {subscription.billing_cycle === 'monthly'
                                ? (language === 'bn' ? 'মাসিক' : 'Monthly')
                                : subscription.billing_cycle === 'quarterly'
                                ? (language === 'bn' ? 'ত্রৈমাসিক' : 'Quarterly')
                                : (language === 'bn' ? 'বার্ষিক' : 'Yearly')}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(Number(subscription.amount))}
                          </TableCell>
                          <TableCell>{formatDate(subscription.next_billing_date)}</TableCell>
                          <TableCell>
                            <StatusBadge status={subscription.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {subscription.status === 'active' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleSuspend(subscription.id)}
                                  title={language === 'bn' ? 'স্থগিত করুন' : 'Suspend'}
                                >
                                  <Pause className="h-4 w-4 text-yellow-500" />
                                </Button>
                              )}
                              {subscription.status === 'suspended' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleReactivate(subscription.id)}
                                  title={language === 'bn' ? 'পুনরায় সক্রিয়' : 'Reactivate'}
                                >
                                  <Play className="h-4 w-4 text-green-500" />
                                </Button>
                              )}
                              {subscription.status !== 'cancelled' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCancel(subscription.id)}
                                  title={language === 'bn' ? 'বাতিল করুন' : 'Cancel'}
                                >
                                  <XCircle className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
