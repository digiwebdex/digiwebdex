import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { DataTable, Column, DeleteConfirmDialog } from '@/components/admin/common';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, ArrowLeft, ShoppingCart, FileText, Globe, Server, CreditCard, FolderKanban, Headphones, Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { logAudit } from '@/lib/auditLog';

type ServicePackage = {
  id: string;
  name_en: string;
  name_bn: string;
  service_id: string;
  price: number;
};

interface Customer {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  city: string | null;
  country: string | null;
  address: string | null;
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
  // Create/Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [saving, setSaving] = useState(false);
  // Package selections
  const [editDomain, setEditDomain] = useState('');
  const [editHosting, setEditHosting] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editSoftware, setEditSoftware] = useState('');
  const [packages, setPackages] = useState<{ hosting: ServicePackage[]; domain: ServicePackage[]; website: ServicePackage[]; software: ServicePackage[] }>({ hosting: [], domain: [], website: [], software: [] });
  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  useEffect(() => { fetchCustomers(); fetchPackages(); }, []);

  const fetchPackages = async () => {
    const { data } = await supabase.from('service_packages').select('id, name_en, name_bn, service_id, price').eq('is_active', true).order('sort_order');
    if (data) {
      const { data: services } = await supabase.from('services').select('id, service_type').eq('is_active', true);
      const serviceMap: Record<string, string> = {};
      services?.forEach(s => { serviceMap[s.id] = s.service_type; });
      const grouped = { hosting: [] as ServicePackage[], domain: [] as ServicePackage[], website: [] as ServicePackage[], software: [] as ServicePackage[] };
      data.forEach((pkg: any) => {
        const type = serviceMap[pkg.service_id];
        if (type === 'hosting') grouped.hosting.push(pkg);
        else if (type === 'domain') grouped.domain.push(pkg);
        else if (type === 'web_development') grouped.website.push(pkg);
        else if (type === 'software_development') grouped.software.push(pkg);
      });
      setPackages(grouped);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone, company_name, city, country, address, created_at')
        .order('created_at', { ascending: false });

      if (profiles) {
        const { data: roles } = await supabase.from('user_roles').select('user_id, role').eq('role', 'client');
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
        orders: orders.data || [], invoices: invoices.data || [],
        domains: domains.data || [], hosting: hosting.data || [],
        payments: payments.data || [], projects: projects.data || [],
        tickets: tickets.data || [], subscriptions: subscriptions.data || [],
      });
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditCustomer(null);
    setEditName(''); setEditPhone(''); setEditCompany(''); setEditCity(''); setEditAddress(''); setEditEmail(''); setEditPassword('');
    setEditDomain(''); setEditHosting(''); setEditWebsite(''); setEditSoftware('');
    setEditOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditCustomer(customer);
    setEditName(customer.full_name || '');
    setEditPhone(customer.phone || '');
    setEditCompany(customer.company_name || '');
    setEditCity(customer.city || '');
    setEditAddress(customer.address || '');
    setEditEmail('');
    setEditPassword('');
    setEditOpen(true);
  };

  const handleSaveCustomer = async () => {
    setSaving(true);
    if (editCustomer) {
      // Update existing profile
      const { error } = await supabase.from('profiles').update({
        full_name: editName, phone: editPhone, company_name: editCompany, city: editCity, address: editAddress,
      }).eq('user_id', editCustomer.user_id);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        await logAudit('update', 'customer', editCustomer.user_id, null, { full_name: editName, phone: editPhone } as any);
        toast({ title: language === 'bn' ? 'কাস্টমার আপডেট হয়েছে' : 'Customer updated' });
        setEditOpen(false);
        fetchCustomers();
        if (selectedCustomer?.user_id === editCustomer.user_id) {
          setSelectedCustomer({ ...editCustomer, full_name: editName, phone: editPhone, company_name: editCompany, city: editCity, address: editAddress });
        }
      }
    } else {
      // Create new customer via edge function
      if (!editEmail || !editPassword) {
        toast({ title: 'Error', description: 'Email and password required', variant: 'destructive' });
        setSaving(false);
        return;
      }
      try {
        const { data, error } = await supabase.functions.invoke('admin-create-user', {
          body: { email: editEmail, password: editPassword, full_name: editName, phone: editPhone, company_name: editCompany, city: editCity, address: editAddress, role: 'client', domain: editDomain, hosting: editHosting, website: editWebsite, software: editSoftware },
        });
        if (error) throw error;
        await logAudit('create', 'customer', null, null, { email: editEmail, full_name: editName } as any);
        toast({ title: language === 'bn' ? 'কাস্টমার তৈরি হয়েছে' : 'Customer created' });
        setEditOpen(false);
        fetchCustomers();
      } catch (error) {
        toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
      }
    }
    setSaving(false);
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    // We can't delete auth user from client side, just log it
    toast({ title: language === 'bn' ? 'কাস্টমার ডিলিট সম্পন্ন হয়নি' : 'Customer deletion requires backend support', variant: 'destructive' });
    setDeleteOpen(false);
  };

  const columns: Column<Customer & Record<string, unknown>>[] = [
    {
      key: 'full_name', header: language === 'bn' ? 'নাম' : 'Name', sortable: true,
      render: (row) => (<div><div className="font-medium">{row.full_name || 'N/A'}</div>{row.company_name && <div className="text-xs text-muted-foreground">{String(row.company_name)}</div>}</div>),
      exportValue: (row) => String(row.full_name || 'N/A'),
    },
    { key: 'phone', header: language === 'bn' ? 'ফোন' : 'Phone', render: (row) => row.phone || '-', exportValue: (row) => String(row.phone || '') },
    { key: 'city', header: language === 'bn' ? 'শহর' : 'City', render: (row) => row.city || '-', exportValue: (row) => String(row.city || '') },
    {
      key: 'created_at', header: language === 'bn' ? 'যোগদান' : 'Joined', sortable: true,
      render: (row) => row.created_at ? format(new Date(String(row.created_at)), 'dd MMM yyyy') : '-',
      exportValue: (row) => row.created_at ? format(new Date(String(row.created_at)), 'dd MMM yyyy') : '',
    },
    {
      key: 'actions', header: language === 'bn' ? 'অ্যাকশন' : 'Actions',
      render: (row) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="icon" variant="ghost" onClick={() => openEditModal(row as Customer)}><Pencil className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { setCustomerToDelete(row as Customer); setDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-green-500/10 text-green-600', paid: 'bg-green-500/10 text-green-600', completed: 'bg-green-500/10 text-green-600',
      pending: 'bg-yellow-500/10 text-yellow-600', unpaid: 'bg-red-500/10 text-red-600', processing: 'bg-blue-500/10 text-blue-600',
      cancelled: 'bg-gray-500/10 text-gray-600', suspended: 'bg-red-500/10 text-red-600', open: 'bg-blue-500/10 text-blue-600',
      closed: 'bg-gray-500/10 text-gray-600', in_progress: 'bg-blue-500/10 text-blue-600',
    };
    return map[status] || 'bg-muted text-muted-foreground';
  };

  if (selectedCustomer) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => { setSelectedCustomer(null); setDetail(null); }}><ArrowLeft className="h-5 w-5" /></Button>
              <div>
                <h1 className="text-2xl font-bold">{selectedCustomer.full_name || 'N/A'}</h1>
                <p className="text-muted-foreground">
                  {selectedCustomer.phone && <span>{selectedCustomer.phone}</span>}
                  {selectedCustomer.company_name && <span> • {selectedCustomer.company_name}</span>}
                  {selectedCustomer.city && <span> • {selectedCustomer.city}</span>}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => openEditModal(selectedCustomer)}>
              <Pencil className="h-4 w-4 mr-2" />
              {language === 'bn' ? 'সম্পাদনা' : 'Edit'}
            </Button>
          </div>

          {detailLoading ? (
            <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : detail && (
            <>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                <SummaryCard icon={ShoppingCart} label={language === 'bn' ? 'অর্ডার' : 'Orders'} count={detail.orders.length} />
                <SummaryCard icon={FileText} label={language === 'bn' ? 'ইনভয়েস' : 'Invoices'} count={detail.invoices.length} />
                <SummaryCard icon={Globe} label={language === 'bn' ? 'ডোমেইন' : 'Domains'} count={detail.domains.length} />
                <SummaryCard icon={Server} label={language === 'bn' ? 'হোস্টিং' : 'Hosting'} count={detail.hosting.length} />
              </div>

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

                <TabsContent value="orders"><DetailList items={detail.orders} emptyText={language === 'bn' ? 'কোনো অর্ডার নেই' : 'No orders'} renderItem={(o) => (
                  <div className="flex items-center justify-between border rounded-lg p-4">
                    <div><div className="font-medium">{o.order_number}</div><div className="text-sm text-muted-foreground">{o.service_type} • {format(new Date(o.created_at), 'dd MMM yyyy')}</div></div>
                    <div className="text-right"><div className="font-bold">৳{o.total?.toLocaleString()}</div><Badge className={getStatusColor(o.status)}>{o.status}</Badge></div>
                  </div>
                )} /></TabsContent>

                <TabsContent value="invoices"><DetailList items={detail.invoices} emptyText={language === 'bn' ? 'কোনো ইনভয়েস নেই' : 'No invoices'} renderItem={(i) => (
                  <div className="flex items-center justify-between border rounded-lg p-4">
                    <div><div className="font-medium">{i.invoice_number}</div><div className="text-sm text-muted-foreground">{i.due_date ? `Due: ${format(new Date(i.due_date), 'dd MMM yyyy')}` : ''}</div></div>
                    <div className="text-right"><div className="font-bold">৳{i.total?.toLocaleString()}</div><Badge className={getStatusColor(i.status)}>{i.status}</Badge></div>
                  </div>
                )} /></TabsContent>

                <TabsContent value="payments"><DetailList items={detail.payments} emptyText={language === 'bn' ? 'কোনো পেমেন্ট নেই' : 'No payments'} renderItem={(p) => (
                  <div className="flex items-center justify-between border rounded-lg p-4">
                    <div><div className="font-medium">{p.transaction_id}</div><div className="text-sm text-muted-foreground">{p.gateway} • {format(new Date(p.created_at), 'dd MMM yyyy')}</div></div>
                    <div className="text-right"><div className="font-bold">৳{p.amount?.toLocaleString()}</div><Badge className={getStatusColor(p.status)}>{p.status}</Badge></div>
                  </div>
                )} /></TabsContent>

                <TabsContent value="domains"><DetailList items={detail.domains} emptyText={language === 'bn' ? 'কোনো ডোমেইন নেই' : 'No domains'} renderItem={(d) => (
                  <div className="flex items-center justify-between border rounded-lg p-4">
                    <div><div className="font-medium">{d.domain_name}</div><div className="text-sm text-muted-foreground">{d.expiry_date ? `Expires: ${format(new Date(d.expiry_date), 'dd MMM yyyy')}` : ''}</div></div>
                    <Badge className={getStatusColor(d.status)}>{d.status}</Badge>
                  </div>
                )} /></TabsContent>

                <TabsContent value="hosting"><DetailList items={detail.hosting} emptyText={language === 'bn' ? 'কোনো হোস্টিং নেই' : 'No hosting'} renderItem={(h) => (
                  <div className="flex items-center justify-between border rounded-lg p-4">
                    <div><div className="font-medium">{h.package_name || h.username}</div><div className="text-sm text-muted-foreground">{h.expiry_date ? `Expires: ${format(new Date(h.expiry_date), 'dd MMM yyyy')}` : ''}</div></div>
                    <Badge className={getStatusColor(h.status)}>{h.status}</Badge>
                  </div>
                )} /></TabsContent>

                <TabsContent value="projects"><DetailList items={detail.projects} emptyText={language === 'bn' ? 'কোনো প্রজেক্ট নেই' : 'No projects'} renderItem={(p) => (
                  <div className="flex items-center justify-between border rounded-lg p-4">
                    <div><div className="font-medium">{p.name || p.project_name}</div><div className="text-sm text-muted-foreground">{format(new Date(p.created_at), 'dd MMM yyyy')}</div></div>
                    <Badge className={getStatusColor(p.status)}>{p.status}</Badge>
                  </div>
                )} /></TabsContent>

                <TabsContent value="tickets"><DetailList items={detail.tickets} emptyText={language === 'bn' ? 'কোনো টিকেট নেই' : 'No tickets'} renderItem={(t) => (
                  <div className="flex items-center justify-between border rounded-lg p-4">
                    <div><div className="font-medium">{t.ticket_number} - {t.subject}</div><div className="text-sm text-muted-foreground">{t.priority} • {format(new Date(t.created_at), 'dd MMM yyyy')}</div></div>
                    <Badge className={getStatusColor(t.status)}>{t.status}</Badge>
                  </div>
                )} /></TabsContent>

                <TabsContent value="subscriptions"><DetailList items={detail.subscriptions} emptyText={language === 'bn' ? 'কোনো সাবস্ক্রিপশন নেই' : 'No subscriptions'} renderItem={(s) => (
                  <div className="flex items-center justify-between border rounded-lg p-4">
                    <div><div className="font-medium">{s.plan_name}</div><div className="text-sm text-muted-foreground">{s.service_type} • ৳{s.amount?.toLocaleString()}/{s.billing_cycle}</div></div>
                    <Badge className={getStatusColor(s.status)}>{s.status}</Badge>
                  </div>
                )} /></TabsContent>
              </Tabs>
            </>
          )}
        </div>

        {/* Edit Modal (also used from detail view) */}
        <CustomerFormModal
          open={editOpen} onOpenChange={setEditOpen} isEdit={!!editCustomer}
          name={editName} setName={setEditName} phone={editPhone} setPhone={setEditPhone}
          company={editCompany} setCompany={setEditCompany} city={editCity} setCity={setEditCity}
          address={editAddress} setAddress={setEditAddress} email={editEmail} setEmail={setEditEmail}
          password={editPassword} setPassword={setEditPassword}
          domain={editDomain} setDomain={setEditDomain} hosting={editHosting} setHosting={setEditHosting}
          website={editWebsite} setWebsite={setEditWebsite} software={editSoftware} setSoftware={setEditSoftware}
          packages={packages}
          saving={saving} onSave={handleSaveCustomer} language={language}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{language === 'bn' ? 'কাস্টমার তালিকা' : 'Customer List'}</h1>
              <p className="text-muted-foreground">{language === 'bn' ? 'সকল কাস্টমারের তথ্য দেখুন ও পরিচালনা করুন' : 'View and manage all customers'}</p>
            </div>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'bn' ? 'কাস্টমার যোগ করুন' : 'Add Customer'}
          </Button>
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
          exportFilename="customers"
          exportTitle={language === 'bn' ? 'কাস্টমার তালিকা' : 'Customer List'}
        />
      </div>

      <CustomerFormModal
        open={editOpen} onOpenChange={setEditOpen} isEdit={!!editCustomer}
        name={editName} setName={setEditName} phone={editPhone} setPhone={setEditPhone}
        company={editCompany} setCompany={setEditCompany} city={editCity} setCity={setEditCity}
        address={editAddress} setAddress={setEditAddress} email={editEmail} setEmail={setEditEmail}
        password={editPassword} setPassword={setEditPassword}
        domain={editDomain} setDomain={setEditDomain} hosting={editHosting} setHosting={setEditHosting}
        website={editWebsite} setWebsite={setEditWebsite} software={editSoftware} setSoftware={setEditSoftware}
        packages={packages}
        saving={saving} onSave={handleSaveCustomer} language={language}
      />

      <DeleteConfirmDialog
        open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDeleteCustomer}
        title={language === 'bn' ? 'কাস্টমার মুছে ফেলুন' : 'Delete Customer'}
        description={language === 'bn' ? `আপনি কি নিশ্চিত যে আপনি ${customerToDelete?.full_name} মুছে ফেলতে চান?` : `Are you sure you want to delete ${customerToDelete?.full_name}?`}
      />
    </AdminLayout>
  );
}

// Reusable sub-components
function CustomerFormModal({ open, onOpenChange, isEdit, name, setName, phone, setPhone, company, setCompany, city, setCity, address, setAddress, email, setEmail, password, setPassword, domain, setDomain, hosting, setHosting, website, setWebsite, software, setSoftware, packages, saving, onSave, language }: any) {
  const renderPackageSelect = (label: string, value: string, onChange: (v: string) => void, options: ServicePackage[]) => (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder={language === 'bn' ? 'নির্বাচন করুন' : 'Select'} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="none">{language === 'bn' ? 'নেই' : 'None'}</SelectItem>
          {options.map((pkg: ServicePackage) => (
            <SelectItem key={pkg.id} value={pkg.id}>
              {language === 'bn' ? pkg.name_bn : pkg.name_en} - ৳{pkg.price}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? (language === 'bn' ? 'কাস্টমার সম্পাদনা' : 'Edit Customer') : (language === 'bn' ? 'নতুন কাস্টমার' : 'New Customer')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {!isEdit && (
            <>
              <div className="space-y-1"><Label>Email *</Label><Input type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} /></div>
              <div className="space-y-1"><Label>Password *</Label><Input type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} /></div>
            </>
          )}
          <div className="space-y-1"><Label>{language === 'bn' ? 'নাম' : 'Full Name'}</Label><Input value={name} onChange={(e: any) => setName(e.target.value)} /></div>
          <div className="space-y-1"><Label>{language === 'bn' ? 'ফোন' : 'Phone'}</Label><Input value={phone} onChange={(e: any) => setPhone(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>{language === 'bn' ? 'কোম্পানি' : 'Company'}</Label><Input value={company} onChange={(e: any) => setCompany(e.target.value)} /></div>
            <div className="space-y-1"><Label>{language === 'bn' ? 'শহর' : 'City'}</Label><Input value={city} onChange={(e: any) => setCity(e.target.value)} /></div>
          </div>
          <div className="space-y-1"><Label>{language === 'bn' ? 'ঠিকানা' : 'Address'}</Label><Input value={address} onChange={(e: any) => setAddress(e.target.value)} /></div>
          {!isEdit && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{language === 'bn' ? 'ডোমেইন নাম' : 'Domain Name'}</Label>
                <Input value={domain} onChange={(e: any) => setDomain(e.target.value)} placeholder={language === 'bn' ? 'example.com' : 'example.com'} />
              </div>
               {renderPackageSelect(language === 'bn' ? 'হোস্টিং প্যাকেজ' : 'Hosting Package', hosting, setHosting, packages?.hosting || [])}
              {renderPackageSelect(language === 'bn' ? 'ওয়েবসাইট প্যাকেজ' : 'Website Package', website, setWebsite, packages?.website || [])}
              {renderPackageSelect(language === 'bn' ? 'সফটওয়্যার প্যাকেজ' : 'Software Package', software, setSoftware, packages?.software || [])}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{language === 'bn' ? 'বাতিল' : 'Cancel'}</Button>
          <Button onClick={onSave} disabled={saving}>{saving ? '...' : (isEdit ? (language === 'bn' ? 'আপডেট' : 'Update') : (language === 'bn' ? 'তৈরি করুন' : 'Create'))}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailList({ items, emptyText, renderItem }: { items: any[]; emptyText: string; renderItem: (item: any) => React.ReactNode }) {
  return (
    <Card><CardContent className="pt-6">
      {items.length === 0 ? <p className="text-center py-8 text-muted-foreground">{emptyText}</p> : (
        <div className="space-y-3">{items.map((item) => <div key={item.id}>{renderItem(item)}</div>)}</div>
      )}
    </CardContent></Card>
  );
}

function SummaryCard({ icon: Icon, label, count }: { icon: React.ElementType; label: string; count: number }) {
  return (
    <Card><CardContent className="flex items-center gap-3 p-4">
      <div className="rounded-lg bg-primary/10 p-2"><Icon className="h-5 w-5 text-primary" /></div>
      <div><div className="text-2xl font-bold">{count}</div><div className="text-sm text-muted-foreground">{label}</div></div>
    </CardContent></Card>
  );
}
