import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { DataTable, Column } from '@/components/admin/common/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, ArrowLeft, ShoppingCart, FileText, Globe, Server, CreditCard, FolderKanban, Headphones } from 'lucide-react';
import { format } from 'date-fns';

interface Customer {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  city: string | null;
  country: string | null;
  email?: string;
  created_at?: string;
}

interface CustomerDetail {
  orders: any[];
  invoices: any[];
  domains: any[];
  hosting: any[];
  payments: any[];
  projects: any[];
  tickets: any[];
  subscriptions: any[];
}

export default function AdminCustomers() {
  const { language } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone, company_name, city, country, created_at')
        .order('created_at', { ascending: false });

      if (profiles) {
        // Fetch emails from user_roles to confirm they are clients
        const { data: roles } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .eq('role', 'client');

        const clientIds = new Set(roles?.map(r => r.user_id) || []);
        const clientProfiles = profiles.filter(p => clientIds.has(p.user_id));
        setCustomers(clientProfiles);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailLoading(true);
    try {
      const userId = customer.user_id;
      const [orders, invoices, domains, hosting, payments, projects, tickets, subscriptions] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('domains').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('hosting_accounts').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('payments').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('support_tickets').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      ]);

      setDetail({
        orders: orders.data || [],
        invoices: invoices.data || [],
        domains: domains.data || [],
        hosting: hosting.data || [],
        payments: payments.data || [],
        projects: projects.data || [],
        tickets: tickets.data || [],
        subscriptions: subscriptions.data || [],
      });
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const columns: Column<Customer & Record<string, unknown>>[] = [
    {
      key: 'full_name',
      header: language === 'bn' ? 'নাম' : 'Name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-medium">{row.full_name || 'N/A'}</div>
          {row.company_name && <div className="text-xs text-muted-foreground">{String(row.company_name)}</div>}
        </div>
      ),
    },
    {
      key: 'phone',
      header: language === 'bn' ? 'ফোন' : 'Phone',
      render: (row) => row.phone || '-',
    },
    {
      key: 'city',
      header: language === 'bn' ? 'শহর' : 'City',
      render: (row) => row.city || '-',
    },
    {
      key: 'created_at',
      header: language === 'bn' ? 'যোগদান' : 'Joined',
      sortable: true,
      render: (row) => row.created_at ? format(new Date(String(row.created_at)), 'dd MMM yyyy') : '-',
    },
  ];

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-green-500/10 text-green-600',
      paid: 'bg-green-500/10 text-green-600',
      completed: 'bg-green-500/10 text-green-600',
      pending: 'bg-yellow-500/10 text-yellow-600',
      unpaid: 'bg-red-500/10 text-red-600',
      processing: 'bg-blue-500/10 text-blue-600',
      cancelled: 'bg-gray-500/10 text-gray-600',
      suspended: 'bg-red-500/10 text-red-600',
      open: 'bg-blue-500/10 text-blue-600',
      closed: 'bg-gray-500/10 text-gray-600',
      in_progress: 'bg-blue-500/10 text-blue-600',
    };
    return map[status] || 'bg-muted text-muted-foreground';
  };

  if (selectedCustomer) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => { setSelectedCustomer(null); setDetail(null); }}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{selectedCustomer.full_name || 'N/A'}</h1>
              <p className="text-muted-foreground">
                {selectedCustomer.phone && <span>{selectedCustomer.phone}</span>}
                {selectedCustomer.company_name && <span> • {selectedCustomer.company_name}</span>}
                {selectedCustomer.city && <span> • {selectedCustomer.city}</span>}
              </p>
            </div>
          </div>

          {detailLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : detail && (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                <SummaryCard icon={ShoppingCart} label={language === 'bn' ? 'অর্ডার' : 'Orders'} count={detail.orders.length} />
                <SummaryCard icon={FileText} label={language === 'bn' ? 'ইনভয়েস' : 'Invoices'} count={detail.invoices.length} />
                <SummaryCard icon={Globe} label={language === 'bn' ? 'ডোমেইন' : 'Domains'} count={detail.domains.length} />
                <SummaryCard icon={Server} label={language === 'bn' ? 'হোস্টিং' : 'Hosting'} count={detail.hosting.length} />
              </div>

              {/* Tabs */}
              <Tabs defaultValue="orders">
                <TabsList className="flex-wrap h-auto">
                  <TabsTrigger value="orders">{language === 'bn' ? 'অর্ডার' : 'Orders'} ({detail.orders.length})</TabsTrigger>
                  <TabsTrigger value="invoices">{language === 'bn' ? 'ইনভয়েস' : 'Invoices'} ({detail.invoices.length})</TabsTrigger>
                  <TabsTrigger value="payments">{language === 'bn' ? 'পেমেন্ট' : 'Payments'} ({detail.payments.length})</TabsTrigger>
                  <TabsTrigger value="domains">{language === 'bn' ? 'ডোমেইন' : 'Domains'} ({detail.domains.length})</TabsTrigger>
                  <TabsTrigger value="hosting">{language === 'bn' ? 'হোস্টিং' : 'Hosting'} ({detail.hosting.length})</TabsTrigger>
                  <TabsTrigger value="projects">{language === 'bn' ? 'প্রজেক্ট' : 'Projects'} ({detail.projects.length})</TabsTrigger>
                  <TabsTrigger value="tickets">{language === 'bn' ? 'টিকেট' : 'Tickets'} ({detail.tickets.length})</TabsTrigger>
                  <TabsTrigger value="subscriptions">{language === 'bn' ? 'সাবস্ক্রিপশন' : 'Subs'} ({detail.subscriptions.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="orders">
                  <Card>
                    <CardContent className="pt-6">
                      {detail.orders.length === 0 ? <EmptyState text={language === 'bn' ? 'কোনো অর্ডার নেই' : 'No orders'} /> : (
                        <div className="space-y-3">
                          {detail.orders.map((o: any) => (
                            <div key={o.id} className="flex items-center justify-between border rounded-lg p-4">
                              <div>
                                <div className="font-medium">{o.order_number}</div>
                                <div className="text-sm text-muted-foreground">{o.service_type} • {format(new Date(o.created_at), 'dd MMM yyyy')}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">৳{o.total?.toLocaleString()}</div>
                                <Badge className={getStatusColor(o.status)}>{o.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="invoices">
                  <Card>
                    <CardContent className="pt-6">
                      {detail.invoices.length === 0 ? <EmptyState text={language === 'bn' ? 'কোনো ইনভয়েস নেই' : 'No invoices'} /> : (
                        <div className="space-y-3">
                          {detail.invoices.map((i: any) => (
                            <div key={i.id} className="flex items-center justify-between border rounded-lg p-4">
                              <div>
                                <div className="font-medium">{i.invoice_number}</div>
                                <div className="text-sm text-muted-foreground">{i.due_date ? `Due: ${format(new Date(i.due_date), 'dd MMM yyyy')}` : ''}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">৳{i.total?.toLocaleString()}</div>
                                <Badge className={getStatusColor(i.status)}>{i.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payments">
                  <Card>
                    <CardContent className="pt-6">
                      {detail.payments.length === 0 ? <EmptyState text={language === 'bn' ? 'কোনো পেমেন্ট নেই' : 'No payments'} /> : (
                        <div className="space-y-3">
                          {detail.payments.map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between border rounded-lg p-4">
                              <div>
                                <div className="font-medium">{p.transaction_id}</div>
                                <div className="text-sm text-muted-foreground">{p.gateway} • {format(new Date(p.created_at), 'dd MMM yyyy')}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">৳{p.amount?.toLocaleString()}</div>
                                <Badge className={getStatusColor(p.status)}>{p.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="domains">
                  <Card>
                    <CardContent className="pt-6">
                      {detail.domains.length === 0 ? <EmptyState text={language === 'bn' ? 'কোনো ডোমেইন নেই' : 'No domains'} /> : (
                        <div className="space-y-3">
                          {detail.domains.map((d: any) => (
                            <div key={d.id} className="flex items-center justify-between border rounded-lg p-4">
                              <div>
                                <div className="font-medium">{d.domain_name}</div>
                                <div className="text-sm text-muted-foreground">{d.expiry_date ? `Expires: ${format(new Date(d.expiry_date), 'dd MMM yyyy')}` : ''}</div>
                              </div>
                              <Badge className={getStatusColor(d.status)}>{d.status}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="hosting">
                  <Card>
                    <CardContent className="pt-6">
                      {detail.hosting.length === 0 ? <EmptyState text={language === 'bn' ? 'কোনো হোস্টিং নেই' : 'No hosting'} /> : (
                        <div className="space-y-3">
                          {detail.hosting.map((h: any) => (
                            <div key={h.id} className="flex items-center justify-between border rounded-lg p-4">
                              <div>
                                <div className="font-medium">{h.package_name || h.username}</div>
                                <div className="text-sm text-muted-foreground">{h.expiry_date ? `Expires: ${format(new Date(h.expiry_date), 'dd MMM yyyy')}` : ''}</div>
                              </div>
                              <Badge className={getStatusColor(h.status)}>{h.status}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="projects">
                  <Card>
                    <CardContent className="pt-6">
                      {detail.projects.length === 0 ? <EmptyState text={language === 'bn' ? 'কোনো প্রজেক্ট নেই' : 'No projects'} /> : (
                        <div className="space-y-3">
                          {detail.projects.map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between border rounded-lg p-4">
                              <div>
                                <div className="font-medium">{p.name || p.project_name}</div>
                                <div className="text-sm text-muted-foreground">{format(new Date(p.created_at), 'dd MMM yyyy')}</div>
                              </div>
                              <Badge className={getStatusColor(p.status)}>{p.status}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tickets">
                  <Card>
                    <CardContent className="pt-6">
                      {detail.tickets.length === 0 ? <EmptyState text={language === 'bn' ? 'কোনো টিকেট নেই' : 'No tickets'} /> : (
                        <div className="space-y-3">
                          {detail.tickets.map((t: any) => (
                            <div key={t.id} className="flex items-center justify-between border rounded-lg p-4">
                              <div>
                                <div className="font-medium">{t.ticket_number} - {t.subject}</div>
                                <div className="text-sm text-muted-foreground">{t.priority} • {format(new Date(t.created_at), 'dd MMM yyyy')}</div>
                              </div>
                              <Badge className={getStatusColor(t.status)}>{t.status}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="subscriptions">
                  <Card>
                    <CardContent className="pt-6">
                      {detail.subscriptions.length === 0 ? <EmptyState text={language === 'bn' ? 'কোনো সাবস্ক্রিপশন নেই' : 'No subscriptions'} /> : (
                        <div className="space-y-3">
                          {detail.subscriptions.map((s: any) => (
                            <div key={s.id} className="flex items-center justify-between border rounded-lg p-4">
                              <div>
                                <div className="font-medium">{s.plan_name}</div>
                                <div className="text-sm text-muted-foreground">{s.service_type} • ৳{s.amount?.toLocaleString()}/{s.billing_cycle}</div>
                              </div>
                              <Badge className={getStatusColor(s.status)}>{s.status}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{language === 'bn' ? 'কাস্টমার তালিকা' : 'Customer List'}</h1>
            <p className="text-muted-foreground">
              {language === 'bn' ? 'সকল কাস্টমারের তথ্য দেখুন ও পরিচালনা করুন' : 'View and manage all customers'}
            </p>
          </div>
        </div>

        <DataTable
          data={customers as (Customer & Record<string, unknown>)[]}
          columns={columns}
          searchKeys={['full_name', 'phone', 'company_name', 'city']}
          searchPlaceholder={language === 'bn' ? 'নাম, ফোন বা কোম্পানি দিয়ে খুঁজুন...' : 'Search by name, phone or company...'}
          onRowClick={(row) => fetchCustomerDetails(row as Customer)}
          loading={loading}
          emptyMessage={language === 'bn' ? 'কোনো কাস্টমার নেই' : 'No customers found'}
          getRowId={(row) => String(row.user_id)}
          pageSize={15}
        />
      </div>
    </AdminLayout>
  );
}

function SummaryCard({ icon: Icon, label, count }: { icon: React.ElementType; label: string; count: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="text-2xl font-bold">{count}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-center py-8 text-muted-foreground">{text}</p>;
}
