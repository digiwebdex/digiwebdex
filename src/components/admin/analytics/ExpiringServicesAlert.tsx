import { useEffect, useState } from 'react';
import { analyticsService, type ExpiringService } from '@/services/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Globe, Server, AlertTriangle, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function ExpiringServicesAlert() {
  const [services, setServices] = useState<ExpiringService[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchExpiringServices() {
      try {
        const data = await analyticsService.getExpiringServices(30);
        setServices(data);
      } catch (error) {
        console.error('Failed to fetch expiring services:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchExpiringServices();
  }, []);

  const sendRenewalAlert = async (service: ExpiringService) => {
    setSendingIds(prev => new Set(prev).add(service.id));
    try {
      // Get user profile info
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('user_id', service.userId)
        .single();

      const typeLabel = service.type === 'hosting' ? 'হোস্টিং' : 'ডোমেইন';
      const customerName = profile?.full_name || 'Customer';
      const expiryFormatted = new Date(service.expiryDate).toLocaleDateString('bn-BD');

      // Send SMS if phone available
      if (profile?.phone) {
        await supabase.functions.invoke('send-sms', {
          body: {
            phone: profile.phone,
            message: `DigiWebDex: প্রিয় ${customerName}, আপনার ${typeLabel} "${service.name}" এর মেয়াদ ${service.daysUntilExpiry} দিন পর (${expiryFormatted}) শেষ হবে। ১ বছরের রিনিউয়াল করতে যোগাযোগ করুন: 01674533303`,
            type: 'customer',
          },
        });
      }

      // Send Email notification
      await supabase.from('notifications').insert({
        user_id: service.userId,
        notification_type: 'email',
        recipient: service.userId,
        subject: `${service.type === 'hosting' ? 'Hosting' : 'Domain'} Renewal Reminder - ${service.name}`,
        body: `প্রিয় ${customerName},\n\nআপনার ${typeLabel} "${service.name}" এর মেয়াদ আগামী ${service.daysUntilExpiry} দিনের মধ্যে (${expiryFormatted}) শেষ হচ্ছে।\n\n১ বছরের জন্য রিনিউ করতে অনুগ্রহ করে যোগাযোগ করুন অথবা আপনার ড্যাশবোর্ড থেকে পেমেন্ট করুন।\n\nধন্যবাদ,\nDigiWebDex Team`,
        status: 'pending',
        metadata: { entity_type: service.type, days: service.daysUntilExpiry, service_name: service.name },
      });

      // In-app notification
      await supabase.from('notifications').insert({
        user_id: service.userId,
        notification_type: 'in_app',
        recipient: service.userId,
        subject: `${typeLabel} রিনিউয়াল রিমাইন্ডার`,
        body: `আপনার ${typeLabel} "${service.name}" এর মেয়াদ ${service.daysUntilExpiry} দিন পর শেষ হবে। ১ বছরের রিনিউয়াল করুন।`,
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: { entity_type: service.type, days: service.daysUntilExpiry },
      });

      // Log the renewal reminder
      await supabase.from('renewal_logs').insert({
        entity_type: service.type,
        entity_id: service.id,
        old_expiry_date: service.expiryDate,
      });

      setSentIds(prev => new Set(prev).add(service.id));
      toast.success(`${service.name} - রিনিউয়াল অ্যালার্ট পাঠানো হয়েছে`);
    } catch (error) {
      console.error('Failed to send renewal alert:', error);
      toast.error(`${service.name} - অ্যালার্ট পাঠাতে ব্যর্থ`);
    } finally {
      setSendingIds(prev => {
        const next = new Set(prev);
        next.delete(service.id);
        return next;
      });
    }
  };

  const sendAllAlerts = async () => {
    setSendingAll(true);
    const unsent = services.filter(s => !sentIds.has(s.id));
    for (const service of unsent) {
      await sendRenewalAlert(service);
    }
    setSendingAll(false);
    toast.success('সকল রিনিউয়াল অ্যালার্ট পাঠানো হয়েছে');
  };

  const getSeverityColor = (days: number) => {
    if (days <= 7) return 'destructive';
    if (days <= 15) return 'secondary';
    return 'outline';
  };

  const getSeverityBg = (days: number) => {
    if (days <= 7) return 'bg-destructive/10';
    if (days <= 15) return 'bg-yellow-500/10';
    return '';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            মেয়াদ উত্তীর্ণ হচ্ছে
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            মেয়াদ উত্তীর্ণ হচ্ছে (৩০ দিনের মধ্যে)
          </CardTitle>
          {services.length > 0 && (
            <Button
              size="sm"
              onClick={sendAllAlerts}
              disabled={sendingAll || sentIds.size === services.length}
            >
              {sendingAll ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Send className="h-4 w-4 mr-1" />
              )}
              সবাইকে SMS/Email পাঠান
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          রিনিউয়াল সময়কাল: ১ বছর | SMS ও Email এর মাধ্যমে কাস্টমারকে জানানো হবে
        </p>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            আগামী ৩০ দিনে কোনো সেবার মেয়াদ উত্তীর্ণ হচ্ছে না
          </p>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getSeverityBg(service.daysUntilExpiry)}`}
                >
                  <div className="flex items-center gap-3">
                    {service.type === 'domain' ? (
                      <Globe className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Server className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        মেয়াদ: {new Date(service.expiryDate).toLocaleDateString('bn-BD')} | রিনিউ: ১ বছর
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor(service.daysUntilExpiry)}>
                      {service.daysUntilExpiry} দিন বাকি
                    </Badge>
                    {sentIds.has(service.id) ? (
                      <Button size="sm" variant="ghost" disabled>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendRenewalAlert(service)}
                        disabled={sendingIds.has(service.id)}
                      >
                        {sendingIds.has(service.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
