import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Activity, CheckCircle, XCircle, AlertTriangle, Search, BarChart3, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

interface TrackingEvent {
  id: string;
  event_name: string;
  event_id: string;
  source: string;
  user_data: Record<string, unknown> | null;
  custom_data: Record<string, unknown> | null;
  status: string;
  error_message: string | null;
  response_data: Record<string, unknown> | null;
  created_at: string;
}

interface MetricCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2, 160 60% 45%))',
  'hsl(var(--chart-3, 30 80% 55%))',
  'hsl(var(--chart-4, 280 65% 60%))',
  'hsl(var(--chart-5, 340 75% 55%))',
];

export default function AdminTrackingAnalytics() {
  const { language } = useLanguage();
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7');
  const [totalCount, setTotalCount] = useState(0);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const days = parseInt(dateRange);
      const fromDate = startOfDay(subDays(new Date(), days)).toISOString();
      const toDate = endOfDay(new Date()).toISOString();

      let query = supabase
        .from('tracking_event_logs')
        .select('*', { count: 'exact' })
        .gte('created_at', fromDate)
        .lte('created_at', toDate)
        .order('created_at', { ascending: false })
        .limit(500);

      if (sourceFilter !== 'all') {
        query = query.eq('source', sourceFilter);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (searchTerm) {
        query = query.ilike('event_name', `%${searchTerm}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setEvents((data || []) as TrackingEvent[]);
      setTotalCount(count || 0);
    } catch (err) {
      toast.error('Failed to fetch tracking events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [sourceFilter, statusFilter, dateRange]);

  const handleSearch = () => fetchEvents();

  // Compute metrics
  const totalEvents = events.length;
  const sentEvents = events.filter(e => e.status === 'sent').length;
  const failedEvents = events.filter(e => e.status === 'failed').length;
  const successRate = totalEvents > 0 ? ((sentEvents / totalEvents) * 100).toFixed(1) : '0';

  const uniqueSources = [...new Set(events.map(e => e.source))];
  const uniqueEventNames = [...new Set(events.map(e => e.event_name))];

  // Events by source
  const eventsBySource = uniqueSources.map(source => ({
    name: source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: events.filter(e => e.source === source).length,
    source,
  }));

  // Events by name (top 10)
  const eventsByName = uniqueEventNames
    .map(name => ({ name, count: events.filter(e => e.event_name === name).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Daily trend
  const days = parseInt(dateRange);
  const dailyTrend = Array.from({ length: Math.min(days, 30) }, (_, i) => {
    const date = subDays(new Date(), Math.min(days, 30) - 1 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEvents = events.filter(e => format(new Date(e.created_at), 'yyyy-MM-dd') === dateStr);
    return {
      date: format(date, 'MMM dd'),
      total: dayEvents.length,
      sent: dayEvents.filter(e => e.status === 'sent').length,
      failed: dayEvents.filter(e => e.status === 'failed').length,
    };
  });

  // Hourly distribution (last 24h)
  const hourlyData = Array.from({ length: 24 }, (_, h) => {
    const hourEvents = events.filter(e => {
      const eventDate = new Date(e.created_at);
      const now = new Date();
      return eventDate >= subDays(now, 1) && eventDate.getHours() === h;
    });
    return { hour: `${h}:00`, count: hourEvents.length };
  });

  const metrics: MetricCard[] = [
    {
      title: language === 'bn' ? 'মোট ইভেন্ট' : 'Total Events',
      value: totalCount,
      subtitle: language === 'bn' ? `গত ${dateRange} দিন` : `Last ${dateRange} days`,
      icon: Activity,
      color: 'text-primary',
    },
    {
      title: language === 'bn' ? 'সফল পাঠানো' : 'Successfully Sent',
      value: sentEvents,
      subtitle: `${successRate}% ${language === 'bn' ? 'সফল' : 'success rate'}`,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: language === 'bn' ? 'ব্যর্থ' : 'Failed',
      value: failedEvents,
      subtitle: language === 'bn' ? 'ত্রুটি সনাক্ত' : 'Errors detected',
      icon: XCircle,
      color: 'text-destructive',
    },
    {
      title: language === 'bn' ? 'ইভেন্ট টাইপ' : 'Event Types',
      value: uniqueEventNames.length,
      subtitle: `${uniqueSources.length} ${language === 'bn' ? 'সোর্স' : 'sources'}`,
      icon: BarChart3,
      color: 'text-blue-500',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'bn' ? 'ট্র্যাকিং অ্যানালিটিক্স' : 'Tracking Analytics'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'bn'
                ? 'GA4, Google Ads এবং Facebook Pixel ইভেন্ট মনিটরিং'
                : 'Monitor GA4, Google Ads & Facebook Pixel event data quality'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24h</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchEvents} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Data Quality Alert */}
        {failedEvents > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="font-medium text-destructive">
                  {language === 'bn' ? 'ডেটা কোয়ালিটি সমস্যা' : 'Data Quality Issues Detected'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {failedEvents} {language === 'bn' ? 'টি ইভেন্ট ব্যর্থ হয়েছে' : 'events failed to send'}.{' '}
                  {language === 'bn' ? 'নিচের লগ চেক করুন।' : 'Check logs below for details.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Tabs */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">
              <TrendingUp className="h-4 w-4 mr-1.5" />
              {language === 'bn' ? 'প্রবণতা' : 'Trends'}
            </TabsTrigger>
            <TabsTrigger value="distribution">
              <BarChart3 className="h-4 w-4 mr-1.5" />
              {language === 'bn' ? 'বিভাজন' : 'Distribution'}
            </TabsTrigger>
            <TabsTrigger value="hourly">
              <Clock className="h-4 w-4 mr-1.5" />
              {language === 'bn' ? 'ঘন্টাভিত্তিক' : 'Hourly'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'bn' ? 'দৈনিক ইভেন্ট প্রবণতা' : 'Daily Event Trend'}</CardTitle>
                <CardDescription>{language === 'bn' ? 'সফল vs ব্যর্থ ইভেন্ট' : 'Sent vs Failed events over time'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs fill-muted-foreground" />
                      <YAxis className="text-xs fill-muted-foreground" />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} name="Total" dot={false} />
                      <Line type="monotone" dataKey="sent" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Sent" dot={false} />
                      <Line type="monotone" dataKey="failed" stroke="hsl(var(--destructive))" strokeWidth={2} name="Failed" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'bn' ? 'সোর্স অনুযায়ী' : 'By Source'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={eventsBySource} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                          {eventsBySource.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{language === 'bn' ? 'টপ ইভেন্ট' : 'Top Events'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={eventsByName} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" className="text-xs fill-muted-foreground" />
                        <YAxis type="category" dataKey="name" width={120} className="text-xs fill-muted-foreground" />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hourly">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'bn' ? 'ঘন্টাভিত্তিক বিতরণ' : 'Hourly Distribution'}</CardTitle>
                <CardDescription>{language === 'bn' ? 'গত ২৪ ঘন্টায় ইভেন্ট' : 'Events in last 24 hours by hour'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="hour" className="text-xs fill-muted-foreground" />
                      <YAxis className="text-xs fill-muted-foreground" />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Event Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'bn' ? 'ইভেন্ট লগ' : 'Event Logs'}</CardTitle>
            <CardDescription>
              {language === 'bn' ? 'সকল ট্র্যাকিং ইভেন্টের বিস্তারিত লগ' : 'Detailed log of all tracking events'}
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === 'bn' ? 'ইভেন্ট নাম খুঁজুন...' : 'Search event name...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="ga4_mp_proxy">GA4 MP Proxy</SelectItem>
                  <SelectItem value="google_capi">Google CAPI</SelectItem>
                  <SelectItem value="fb_capi">Facebook CAPI</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'bn' ? 'সময়' : 'Time'}</TableHead>
                    <TableHead>{language === 'bn' ? 'ইভেন্ট' : 'Event'}</TableHead>
                    <TableHead>{language === 'bn' ? 'সোর্স' : 'Source'}</TableHead>
                    <TableHead>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                    <TableHead>{language === 'bn' ? 'ইভেন্ট ID' : 'Event ID'}</TableHead>
                    <TableHead>{language === 'bn' ? 'রেসপন্স' : 'Response'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {language === 'bn' ? 'কোন ইভেন্ট পাওয়া যায়নি' : 'No events found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.slice(0, 100).map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="text-xs whitespace-nowrap">
                          {format(new Date(event.created_at), 'MMM dd, HH:mm:ss')}
                        </TableCell>
                        <TableCell className="font-medium text-sm">{event.event_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {event.source?.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={event.status === 'sent' ? 'default' : 'destructive'} className="text-xs">
                            {event.status === 'sent' ? (
                              <><CheckCircle className="h-3 w-3 mr-1" /> Sent</>
                            ) : (
                              <><XCircle className="h-3 w-3 mr-1" /> Failed</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono max-w-[120px] truncate" title={event.event_id}>
                          {event.event_id}
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">
                          {event.error_message || (event.response_data ? JSON.stringify(event.response_data) : '—')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {events.length > 100 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Showing 100 of {events.length} events
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
