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
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2, ExternalLink, PauseCircle, PlayCircle, HardDrive } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

type HostingAccount = Database['public']['Tables']['hosting_accounts']['Row'] & {
  domains?: { domain_name: string } | null;
};

interface Profile {
  user_id: string;
  full_name: string | null;
  phone: string | null;
}

interface DomainOption {
  id: string;
  domain_name: string;
}

const HOSTING_STATUSES = [
  { value: 'pending', label_en: 'Pending', label_bn: 'বিবেচনাধীন' },
  { value: 'active', label_en: 'Active', label_bn: 'সক্রিয়' },
  { value: 'suspended', label_en: 'Suspended', label_bn: 'স্থগিত' },
  { value: 'terminated', label_en: 'Terminated', label_bn: 'বাতিল' },
  { value: 'expired', label_en: 'Expired', label_bn: 'মেয়াদ উত্তীর্ণ' },
];

export default function AdminHosting() {
  const { language } = useLanguage();
  const [accounts, setAccounts] = useState<HostingAccount[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [domainOptions, setDomainOptions] = useState<DomainOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<HostingAccount | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    package_name: '',
    status: 'pending' as Database['public']['Enums']['hosting_status'],
    user_id: '' as string | null,
    domain_id: '' as string | null,
    disk_limit_mb: 5120,
    bandwidth_limit_mb: 51200,
    email_limit: 5,
    database_limit: 3,
    cpanel_url: '',
    expiry_date: '',
    auto_renew: true,
    suspended_reason: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [accountsRes, profilesRes, domainsRes] = await Promise.all([
      supabase.from('hosting_accounts').select('*, domains:domain_id (domain_name)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('user_id, full_name, phone'),
      supabase.from('domains').select('id, domain_name').order('domain_name'),
    ]);
    if (accountsRes.data) setAccounts(accountsRes.data as HostingAccount[]);
    if (profilesRes.data) setProfiles(profilesRes.data);
    if (domainsRes.data) setDomainOptions(domainsRes.data);
    setLoading(false);
  };

  const handleOpenModal = (account?: HostingAccount) => {
    if (account) {
      setSelectedAccount(account);
      setFormData({
        username: account.username || '',
        package_name: account.package_name || '',
        status: account.status,
        user_id: account.user_id,
        domain_id: account.domain_id,
        disk_limit_mb: account.disk_limit_mb || 5120,
        bandwidth_limit_mb: account.bandwidth_limit_mb || 51200,
        email_limit: account.email_limit || 5,
        database_limit: account.database_limit || 3,
        cpanel_url: account.cpanel_url || '',
        expiry_date: account.expiry_date || '',
        auto_renew: account.auto_renew ?? true,
        suspended_reason: account.suspended_reason || '',
      });
    } else {
      setSelectedAccount(null);
      setFormData({
        username: '',
        package_name: '',
        status: 'pending',
        user_id: null,
        domain_id: null,
        disk_limit_mb: 5120,
        bandwidth_limit_mb: 51200,
        email_limit: 5,
        database_limit: 3,
        cpanel_url: '',
        expiry_date: '',
        auto_renew: true,
        suspended_reason: '',
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.package_name) {
      toast({ title: 'Error', description: 'Package name is required', variant: 'destructive' });
      return;
    }
    setSaving(true);

    const payload = {
      username: formData.username || null,
      package_name: formData.package_name,
      status: formData.status,
      user_id: formData.user_id || null,
      domain_id: formData.domain_id || null,
      disk_limit_mb: formData.disk_limit_mb,
      bandwidth_limit_mb: formData.bandwidth_limit_mb,
      email_limit: formData.email_limit,
      database_limit: formData.database_limit,
      cpanel_url: formData.cpanel_url || null,
      expiry_date: formData.expiry_date || null,
      auto_renew: formData.auto_renew,
      suspended_reason: formData.status === 'suspended' ? (formData.suspended_reason || 'Admin action') : null,
    };

    const { error } = selectedAccount
      ? await supabase.from('hosting_accounts').update(payload).eq('id', selectedAccount.id)
      : await supabase.from('hosting_accounts').insert(payload);

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
    if (!selectedAccount) return;
    setSaving(true);
    const { error } = await supabase.from('hosting_accounts').delete().eq('id', selectedAccount.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Deleted' });
      setDeleteDialogOpen(false);
      fetchData();
    }
    setSaving(false);
  };

  const toggleSuspend = async (account: HostingAccount) => {
    const newSt = account.status === 'suspended' ? 'active' : 'suspended';
    const { error } = await supabase.from('hosting_accounts').update({
      status: newSt,
      suspended_reason: newSt === 'suspended' ? 'Admin action' : null,
    }).eq('id', account.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Success' });
      fetchData();
    }
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return '-';
    const profile = profiles.find(p => p.user_id === userId);
    return profile?.full_name || userId.slice(0, 8) + '...';
  };

  const columns: Column<HostingAccount>[] = [
    {
      key: 'username',
      header: language === 'bn' ? 'অ্যাকাউন্ট' : 'Account',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium font-mono">{row.username || 'N/A'}</p>
          <p className="text-xs text-muted-foreground">{row.domains?.domain_name || '-'}</p>
        </div>
      ),
    },
    {
      key: 'user_id',
      header: language === 'bn' ? 'কাস্টমার' : 'Customer',
      render: (row) => getUserName(row.user_id),
    },
    {
      key: 'package_name',
      header: language === 'bn' ? 'প্যাকেজ' : 'Package',
      render: (row) => row.package_name || '-',
    },
    {
      key: 'disk_limit_mb',
      header: language === 'bn' ? 'রিসোর্স' : 'Resources',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <p>{row.disk_limit_mb ? `${row.disk_limit_mb} MB` : '∞'} disk</p>
          <p>{row.email_limit ?? '∞'} emails</p>
        </div>
      ),
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
          {row.status !== 'terminated' && (
            <Button
              size="icon"
              variant="ghost"
              className={row.status === 'suspended' ? 'text-green-600' : 'text-destructive'}
              onClick={() => toggleSuspend(row)}
            >
              {row.status === 'suspended' ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
            </Button>
          )}
          {row.cpanel_url && (
            <Button size="icon" variant="ghost" asChild>
              <a href={row.cpanel_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
            </Button>
          )}
          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { setSelectedAccount(row); setDeleteDialogOpen(true); }}>
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
            <h1 className="text-3xl font-bold">{language === 'bn' ? 'হোস্টিং ম্যানেজমেন্ট' : 'Hosting Management'}</h1>
            <p className="text-muted-foreground">
              {language === 'bn' ? 'হোস্টিং অ্যাকাউন্ট তৈরি ও পরিচালনা করুন' : 'Create and manage hosting accounts'}
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'bn' ? 'নতুন অ্যাকাউন্ট' : 'Add Account'}
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <DataTable
              data={accounts}
              columns={columns}
              loading={loading}
              searchKeys={['username', 'package_name']}
              searchPlaceholder={language === 'bn' ? 'ইউজারনেম বা প্যাকেজ দিয়ে খুঁজুন...' : 'Search by username or package...'}
              onRowClick={handleOpenModal}
            />
          </CardContent>
        </Card>
      </div>

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={selectedAccount ? (language === 'bn' ? 'হোস্টিং সম্পাদনা' : 'Edit Hosting') : (language === 'bn' ? 'নতুন হোস্টিং' : 'Add Hosting Account')}
        onSubmit={handleSave}
        loading={saving}
        size="lg"
      >
        <div className="space-y-4">
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
              <Label>{language === 'bn' ? 'ডোমেইন' : 'Domain'}</Label>
              <Select value={formData.domain_id || 'none'} onValueChange={(v) => setFormData({ ...formData, domain_id: v === 'none' ? null : v })}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'bn' ? 'নির্বাচন করুন' : 'Select domain'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{language === 'bn' ? 'কোনোটি নয়' : 'None'}</SelectItem>
                  {domainOptions.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.domain_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'ইউজারনেম' : 'Username'}</Label>
              <Input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="cpanel_user" className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'প্যাকেজ নাম' : 'Package Name'} *</Label>
              <Input value={formData.package_name} onChange={(e) => setFormData({ ...formData, package_name: e.target.value })} placeholder="Starter Hosting" />
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="h-4 w-4 text-primary" />
              <Label className="font-semibold">{language === 'bn' ? 'রিসোর্স লিমিট' : 'Resource Limits'}</Label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">{language === 'bn' ? 'ডিস্ক (MB)' : 'Disk (MB)'}</Label>
                <Input type="number" value={formData.disk_limit_mb} onChange={(e) => setFormData({ ...formData, disk_limit_mb: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{language === 'bn' ? 'ব্যান্ডউইথ (MB)' : 'Bandwidth (MB)'}</Label>
                <Input type="number" value={formData.bandwidth_limit_mb} onChange={(e) => setFormData({ ...formData, bandwidth_limit_mb: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{language === 'bn' ? 'ইমেইল' : 'Emails'}</Label>
                <Input type="number" value={formData.email_limit} onChange={(e) => setFormData({ ...formData, email_limit: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{language === 'bn' ? 'ডেটাবেস' : 'Databases'}</Label>
                <Input type="number" value={formData.database_limit} onChange={(e) => setFormData({ ...formData, database_limit: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as Database['public']['Enums']['hosting_status'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HOSTING_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {language === 'bn' ? s.label_bn : s.label_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'মেয়াদ শেষ' : 'Expiry Date'}</Label>
              <Input type="date" value={formData.expiry_date} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>cPanel URL</Label>
            <Input value={formData.cpanel_url} onChange={(e) => setFormData({ ...formData, cpanel_url: e.target.value })} placeholder="https://server.example.com:2083" />
          </div>

          {formData.status === 'suspended' && (
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'স্থগিতের কারণ' : 'Suspension Reason'}</Label>
              <Input value={formData.suspended_reason} onChange={(e) => setFormData({ ...formData, suspended_reason: e.target.value })} placeholder="Reason for suspension" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Switch checked={formData.auto_renew} onCheckedChange={(c) => setFormData({ ...formData, auto_renew: c })} />
            <Label>{language === 'bn' ? 'অটো রিনিউ' : 'Auto Renew'}</Label>
          </div>
        </div>
      </FormModal>

      <DeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} loading={saving} />
    </AdminLayout>
  );
}