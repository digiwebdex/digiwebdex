import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, CreditCard, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type InvoiceStatus = Database['public']['Enums']['invoice_status'];

export default function InvoicesPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  const fetchInvoices = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const statusConfig: Record<InvoiceStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      unpaid: { label: language === 'bn' ? 'অপরিশোধিত' : 'Unpaid', variant: 'outline' },
      paid: { label: language === 'bn' ? 'পরিশোধিত' : 'Paid', variant: 'default' },
      partial: { label: language === 'bn' ? 'আংশিক' : 'Partial', variant: 'secondary' },
      overdue: { label: language === 'bn' ? 'বকেয়া' : 'Overdue', variant: 'destructive' },
      cancelled: { label: language === 'bn' ? 'বাতিল' : 'Cancelled', variant: 'secondary' },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
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
              {language === 'bn' ? 'ইনভয়েস' : 'Invoices'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'bn'
                ? 'আপনার সকল ইনভয়েসের তালিকা দেখুন'
                : 'View all your invoices'}
            </p>
          </div>
          <Button onClick={fetchInvoices} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : invoices.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {language === 'bn'
                  ? 'আপনার কোনো ইনভয়েস নেই'
                  : 'You have no invoices yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{invoice.invoice_number}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {language === 'bn' ? 'তৈরি হয়েছে' : 'Created'}: {formatDate(invoice.created_at)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(invoice.status)}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {language === 'bn' ? 'শেষ তারিখ' : 'Due Date'}
                      </p>
                      <div className="flex items-center gap-2">
                        {invoice.status === 'overdue' && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                        <p className="font-medium">{formatDate(invoice.due_date)}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-sm text-muted-foreground">
                        {language === 'bn' ? 'মোট' : 'Total'}
                      </p>
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(Number(invoice.total), invoice.currency || 'BDT')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {invoice.status === 'unpaid' && (
                        <Button size="sm">
                          <CreditCard className="h-4 w-4 mr-2" />
                          {language === 'bn' ? 'পেমেন্ট করুন' : 'Pay Now'}
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </div>
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
