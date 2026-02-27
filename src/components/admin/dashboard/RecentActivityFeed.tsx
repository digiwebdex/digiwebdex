import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, CreditCard, FileText, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { bn, enUS } from 'date-fns/locale';

interface Activity {
  id: string;
  type: 'order' | 'payment' | 'invoice' | 'customer';
  title: string;
  description: string;
  time: string;
  status?: string;
}

export function RecentActivityFeed() {
  const { language } = useLanguage();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const [orders, payments, invoices] = await Promise.all([
        supabase
          .from('orders')
          .select('id, order_number, status, total, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('manual_payments')
          .select('id, method, amount, status, created_at, transaction_id')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('invoices')
          .select('id, invoice_number, status, total, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const items: Activity[] = [];

      (orders.data || []).forEach((o) =>
        items.push({
          id: o.id,
          type: 'order',
          title: `Order ${o.order_number}`,
          description: `৳${Number(o.total).toLocaleString()}`,
          time: o.created_at,
          status: o.status,
        })
      );

      (payments.data || []).forEach((p) =>
        items.push({
          id: p.id,
          type: 'payment',
          title: `Payment via ${p.method}`,
          description: `৳${Number(p.amount).toLocaleString()} — ${p.transaction_id}`,
          time: p.created_at,
          status: p.status,
        })
      );

      (invoices.data || []).forEach((inv) =>
        items.push({
          id: inv.id,
          type: 'invoice',
          title: `Invoice ${inv.invoice_number}`,
          description: `৳${Number(inv.total).toLocaleString()}`,
          time: inv.created_at,
          status: inv.status,
        })
      );

      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setActivities(items.slice(0, 10));
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const iconMap = {
    order: ShoppingCart,
    payment: CreditCard,
    invoice: FileText,
    customer: UserPlus,
  };

  const statusColor = (s?: string) => {
    if (!s) return 'secondary';
    if (['paid', 'completed', 'verified', 'active'].includes(s)) return 'default';
    if (['pending', 'unpaid', 'processing'].includes(s)) return 'secondary';
    if (['cancelled', 'rejected', 'failed'].includes(s)) return 'destructive';
    return 'outline';
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>{language === 'bn' ? 'সাম্প্রতিক কার্যক্রম' : 'Recent Activity'}</CardTitle>
        <CardDescription>
          {language === 'bn' ? 'সর্বশেষ অর্ডার, পেমেন্ট ও ইনভয়েস' : 'Latest orders, payments & invoices'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-9 w-9 rounded-full bg-muted" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {language === 'bn' ? 'কোনো কার্যক্রম নেই' : 'No recent activity'}
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((a) => {
              const Icon = iconMap[a.type];
              return (
                <div key={`${a.type}-${a.id}`} className="flex items-start gap-3">
                  <div className="rounded-full bg-muted p-2 mt-0.5">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{a.title}</span>
                      {a.status && (
                        <Badge variant={statusColor(a.status) as any} className="text-[10px] px-1.5 py-0">
                          {a.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap mt-0.5">
                    {formatDistanceToNow(new Date(a.time), {
                      addSuffix: true,
                      locale: language === 'bn' ? bn : enUS,
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
