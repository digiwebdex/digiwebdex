import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column, StatusBadge, FormModal, DeleteConfirmDialog } from '@/components/admin/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2, ExternalLink, Globe, Server, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

type Domain = Database['public']['Tables']['domains']['Row'];

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  ttl: number;
  priority?: number;
}

interface Profile {
  user_id: string;
  full_name: string | null;
  phone: string | null;
}

const DOMAIN_STATUSES = [
  { value: 'pending', label_en: 'Pending', label_bn: 'বিবেচনাধীন' },
  { value: 'registered', label_en: 'Registered', label_bn: 'রেজিস্টার্ড' },
  { value: 'active', label_en: 'Active', label_bn: 'সক্রিয়' },
  { value: 'expired', label_en: 'Expired', label_bn: 'মেয়াদ উত্তীর্ণ' },
  { value: 'suspended', label_en: 'Suspended', label_bn: 'স্থগিত' },
  { value: 'transferring', label_en: 'Transferring', label_bn: 'স্থানান্তরিত হচ্ছে' },
];

const DNS_RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV'];

const emptyDnsRecord: DnsRecord = { type: 'A', name: '@', value: '', ttl: 3600 };

export default function AdminDomains() {
  const { language } = useLanguage();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [formData, setFormData] = useState({
    domain_name: '',
    tld: 'com',
    status: 'pending' as Database['public']['Enums']['domain_status'],
    user_id: '' as string | null,
    registrar: '',
    registration_date: '',
    expiry_date: '',
    auto_renew: true,
    whois_privacy: false,
    nameservers: ['', '', '', ''] as string[],
    dns_records: [] as DnsRecord[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [domainsRes, profilesRes] = await Promise.all([
      supabase.from('domains').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('user_id, full_name, phone'),
    ]);
    if (domainsRes.data) setDomains(domainsRes.data);
    if (profilesRes.data) setProfiles(profilesRes.data);
    setLoading(false);
  };

  const handleOpenModal = (domain?: Domain) => {
    if (domain) {
      setSelectedDomain(domain);
      const ns = Array.isArray(domain.nameservers) ? (domain.nameservers as string[]) : [];
      const dns = Array.isArray(domain.dns_records) ? (domain.dns_records as unknown as DnsRecord[]) : [];
      setFormData({
        domain_name: domain.domain_name,
        tld: domain.tld,
        status: domain.status,
        user_id: domain.user_id,
        registrar: domain.registrar || '',
        registration_date: domain.registration_date || '',
        expiry_date: domain.expiry_date || '',
        auto_renew: domain.auto_renew ?? true,
        whois_privacy: domain.whois_privacy ?? false,
        nameservers: [...ns, '', '', '', ''].slice(0, 4),
        dns_records: dns.length > 0 ? dns : [],
      });
    } else {
      setSelectedDomain(null);
      setFormData({
        domain_name: '',
        tld: 'com',
        status: 'pending',
        user_id: null,
        registrar: '',
        registration_date: '',
        expiry_date: '',
        auto_renew: true,
        whois_privacy: false,
        nameservers: ['', '', '', ''],
        dns_records: [],
      });
    }
    setActiveTab('general');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.domain_name || !formData.tld) {
      toast({ title: 'Error', description: 'Domain name and TLD are required', variant: 'destructive' });
      return;
    }
    setSaving(true);

    const payload = {
      domain_name: formData.domain_name,
      tld: formData.tld,
      status: formData.status,
      user_id: formData.user_id || null,
      registrar: formData.registrar || null,
      registration_date: formData.registration_date || null,
      expiry_date: formData.expiry_date || null,
      auto_renew: formData.auto_renew,
      whois_privacy: formData.whois_privacy,
      nameservers: formData.nameservers.filter(Boolean) as unknown as Database['public']['Tables']['domains']['Update']['nameservers'],
      dns_records: formData.dns_records.filter(r => r.value).map(r => ({ ...r })) as unknown as Database['public']['Tables']['domains']['Update']['dns_records'],
    };

    const { error } = selectedDomain
      ? await supabase.from('domains').update(payload).eq('id', selectedDomain.id)
      : await supabase.from('domains').insert(payload as unknown as Database['public']['Tables']['domains']['Insert']);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Success' });
      setModalOpen(false);
      fetchData();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedDomain) return;
    setSaving(true);
    const { error } = await supabase.from('domains').delete().eq('id', selectedDomain.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Deleted' });
      setDeleteDialogOpen(false);
      fetchData();
    }
    setSaving(false);
  };

  const addDnsRecord = () => {
    setFormData(prev => ({ ...prev, dns_records: [...prev.dns_records, { ...emptyDnsRecord }] }));
  };

  const updateDnsRecord = (index: number, field: keyof DnsRecord, value: string | number) => {
    setFormData(prev => {
      const records = [...prev.dns_records];
      records[index] = { ...records[index], [field]: value };
      return { ...prev, dns_records: records };
    });
  };

  const removeDnsRecord = (index: number) => {
    setFormData(prev => ({ ...prev, dns_records: prev.dns_records.filter((_, i) => i !== index) }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: language === 'bn' ? 'কপি হয়েছে' : 'Copied' });
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return '-';
    const profile = profiles.find(p => p.user_id === userId);
    return profile?.full_name || userId.slice(0, 8) + '...';
  };

  const columns: Column<Domain>[] = [
    {
      key: 'domain_name',
      header: language === 'bn' ? 'ডোমেইন' : 'Domain',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <div>
            <span className="font-medium">{row.domain_name}</span>
            <p className="text-xs text-muted-foreground">{getUserName(row.user_id)}</p>
          </div>
          <a href={`https://${row.domain_name}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ),
    },
    {
      key: 'tld',
      header: 'TLD',
      render: (row) => <span className="font-mono text-sm">.{row.tld}</span>,
    },
    {
      key: 'registrar',
      header: language === 'bn' ? 'রেজিস্ট্রার' : 'Registrar',
      render: (row) => row.registrar || '-',
    },
    {
      key: 'registration_date',
      header: language === 'bn' ? 'রেজিস্ট্রেশন' : 'Registered',
      render: (row) => row.registration_date ? format(new Date(row.registration_date), 'dd MMM yyyy') : '-',
    },
    {
      key: 'expiry_date',
      header: language === 'bn' ? 'মেয়াদ' : 'Expiry',
      render: (row) => {
        if (!row.expiry_date) return '-';
        const expiry = new Date(row.expiry_date);
        const isExpiring = expiry < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return (
          <span className={isExpiring ? 'text-destructive font-medium' : ''}>
            {format(expiry, 'dd MMM yyyy')}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: language === 'bn' ? 'স্ট্যাটাস' : 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: language === 'bn' ? 'অ্যাকশন' : 'Actions',
      render: (row) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="icon" variant="ghost" onClick={() => handleOpenModal(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { setSelectedDomain(row); setDeleteDialogOpen(true); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{language === 'bn' ? 'ডোমেইন ম্যানেজমেন্ট' : 'Domain Management'}</h1>
            <p className="text-muted-foreground">
              {language === 'bn' ? 'ডোমেইন, DNS রেকর্ড এবং নেমসার্ভার পরিচালনা করুন' : 'Manage domains, DNS records & nameservers'}
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'bn' ? 'নতুন ডোমেইন' : 'Add Domain'}
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <DataTable
              data={domains}
              columns={columns}
              loading={loading}
              searchKeys={['domain_name', 'registrar']}
              searchPlaceholder={language === 'bn' ? 'ডোমেইন নাম দিয়ে খুঁজুন...' : 'Search domains...'}
              onRowClick={handleOpenModal}
            />
          </CardContent>
        </Card>
      </div>

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={selectedDomain ? (language === 'bn' ? 'ডোমেইন সম্পাদনা' : 'Edit Domain') : (language === 'bn' ? 'নতুন ডোমেইন' : 'Add Domain')}
        onSubmit={handleSave}
        loading={saving}
        size="xl"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">
              <Globe className="h-4 w-4 mr-1" />
              {language === 'bn' ? 'সাধারণ' : 'General'}
            </TabsTrigger>
            <TabsTrigger value="nameservers">
              <Server className="h-4 w-4 mr-1" />
              {language === 'bn' ? 'নেমসার্ভার' : 'Nameservers'}
            </TabsTrigger>
            <TabsTrigger value="dns">
              DNS {language === 'bn' ? 'রেকর্ড' : 'Records'}
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'ডোমেইন নাম' : 'Domain Name'} *</Label>
                <Input
                  value={formData.domain_name}
                  onChange={(e) => setFormData({ ...formData, domain_name: e.target.value })}
                  placeholder="example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>TLD *</Label>
                <Input
                  value={formData.tld}
                  onChange={(e) => setFormData({ ...formData, tld: e.target.value })}
                  placeholder="com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'কাস্টমার' : 'Customer'}</Label>
                <Select value={formData.user_id || 'none'} onValueChange={(v) => setFormData({ ...formData, user_id: v === 'none' ? null : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'bn' ? 'নির্বাচন করুন' : 'Select customer'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{language === 'bn' ? 'কেউ নয়' : 'None'}</SelectItem>
                    {profiles.map((p) => (
                      <SelectItem key={p.user_id} value={p.user_id}>
                        {p.full_name || p.phone || p.user_id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as Database['public']['Enums']['domain_status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOMAIN_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {language === 'bn' ? s.label_bn : s.label_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'রেজিস্ট্রার' : 'Registrar'}</Label>
                <Input value={formData.registrar} onChange={(e) => setFormData({ ...formData, registrar: e.target.value })} placeholder="e.g., Namecheap" />
              </div>
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'রেজিস্ট্রেশন তারিখ' : 'Registration Date'}</Label>
                <Input type="date" value={formData.registration_date} onChange={(e) => setFormData({ ...formData, registration_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'মেয়াদ শেষ' : 'Expiry Date'}</Label>
                <Input type="date" value={formData.expiry_date} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={formData.auto_renew} onCheckedChange={(c) => setFormData({ ...formData, auto_renew: c })} />
                <Label>{language === 'bn' ? 'অটো রিনিউ' : 'Auto Renew'}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.whois_privacy} onCheckedChange={(c) => setFormData({ ...formData, whois_privacy: c })} />
                <Label>WHOIS Privacy</Label>
              </div>
            </div>
          </TabsContent>

          {/* Nameservers Tab */}
          <TabsContent value="nameservers" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              {language === 'bn' ? 'ডোমেইনের নেমসার্ভার সেট করুন (সর্বনিম্ন ২টি)' : 'Set nameservers for this domain (minimum 2)'}
            </p>
            {formData.nameservers.map((ns, i) => (
              <div key={i} className="flex items-center gap-3">
                <Label className="w-8 text-muted-foreground">NS{i + 1}</Label>
                <Input
                  value={ns}
                  onChange={(e) => {
                    const updated = [...formData.nameservers];
                    updated[i] = e.target.value;
                    setFormData({ ...formData, nameservers: updated });
                  }}
                  placeholder={`ns${i + 1}.example.com`}
                  className="font-mono text-sm"
                />
                {ns && (
                  <Button size="icon" variant="ghost" onClick={() => copyToClipboard(ns)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </TabsContent>

          {/* DNS Records Tab */}
          <TabsContent value="dns" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {language === 'bn' ? 'DNS রেকর্ড পরিচালনা করুন' : 'Manage DNS records'}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={addDnsRecord}>
                <Plus className="h-3 w-3 mr-1" />
                {language === 'bn' ? 'রেকর্ড যোগ করুন' : 'Add Record'}
              </Button>
            </div>

            {formData.dns_records.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                {language === 'bn' ? 'কোনো DNS রেকর্ড নেই। উপরের বাটনে ক্লিক করে যোগ করুন।' : 'No DNS records. Click Add Record to create one.'}
              </div>
            ) : (
              <div className="space-y-3">
                {formData.dns_records.map((record, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg bg-muted/30">
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">{language === 'bn' ? 'টাইপ' : 'Type'}</Label>
                      <Select value={record.type} onValueChange={(v) => updateDnsRecord(i, 'type', v)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {DNS_RECORD_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs">{language === 'bn' ? 'নাম' : 'Name'}</Label>
                      <Input className="h-9 font-mono text-sm" value={record.name} onChange={(e) => updateDnsRecord(i, 'name', e.target.value)} placeholder="@" />
                    </div>
                    <div className="col-span-4 space-y-1">
                      <Label className="text-xs">{language === 'bn' ? 'ভ্যালু' : 'Value'}</Label>
                      <Input className="h-9 font-mono text-sm" value={record.value} onChange={(e) => updateDnsRecord(i, 'value', e.target.value)} placeholder="192.168.1.1" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">TTL</Label>
                      <Input className="h-9" type="number" value={record.ttl} onChange={(e) => updateDnsRecord(i, 'ttl', parseInt(e.target.value) || 3600)} />
                    </div>
                    <div className="col-span-1">
                      <Button type="button" size="icon" variant="ghost" className="text-destructive h-9 w-9" onClick={() => removeDnsRecord(i)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </FormModal>

      <DeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} loading={saving} />
    </AdminLayout>
  );
}