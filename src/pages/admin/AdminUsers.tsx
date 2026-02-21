import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column, FormModal } from '@/components/admin/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Pencil, Shield, ShieldCheck, ShieldAlert, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  email?: string;
  role?: string;
};

const ROLES = [
  { value: 'client', label_en: 'Client', label_bn: 'ক্লায়েন্ট', icon: Shield },
  { value: 'staff', label_en: 'Staff', label_bn: 'স্টাফ', icon: ShieldCheck },
  { value: 'admin', label_en: 'Admin', label_bn: 'অ্যাডমিন', icon: ShieldAlert },
];

export default function AdminUsers() {
  const { language } = useLanguage();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [newRole, setNewRole] = useState('client');
  const [saving, setSaving] = useState(false);

  // Add user form state
  const [addForm, setAddForm] = useState({
    email: '', password: '', full_name: '', phone: '', company_name: '', role: 'client',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    const usersWithRoles = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.user_id)
          .single();
        return { ...profile, role: roleData?.role || 'client' };
      })
    );

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const handleEditUser = (user: Profile) => {
    setSelectedUser(user);
    setNewRole(user.role || 'client');
    setRoleModalOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    setSaving(true);
    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: selectedUser.user_id,
        role: newRole as Database['public']['Enums']['app_role'],
      }, { onConflict: 'user_id' });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Success', description: language === 'bn' ? 'রোল আপডেট হয়েছে' : 'Role updated' });
      setRoleModalOpen(false);
      fetchUsers();
    }
    setSaving(false);
  };

  const handleAddUser = async () => {
    if (!addForm.email || !addForm.password) {
      toast({ title: 'Error', description: language === 'bn' ? 'ইমেইল ও পাসওয়ার্ড আবশ্যক' : 'Email and password required', variant: 'destructive' });
      return;
    }
    setSaving(true);

    const { data, error } = await supabase.functions.invoke('admin-create-user', {
      body: addForm,
    });

    if (error || data?.error) {
      toast({ title: 'Error', description: data?.error || error?.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Success', description: language === 'bn' ? 'নতুন কাস্টমার যোগ হয়েছে' : 'New customer added' });
      setAddModalOpen(false);
      setAddForm({ email: '', password: '', full_name: '', phone: '', company_name: '', role: 'client' });
      fetchUsers();
    }
    setSaving(false);
  };

  const getRoleIcon = (role: string) => {
    const roleConfig = ROLES.find((r) => r.value === role);
    const Icon = roleConfig?.icon || Shield;
    const color = role === 'admin' ? 'text-destructive' : role === 'staff' ? 'text-primary' : 'text-muted-foreground';
    return <Icon className={`h-4 w-4 ${color}`} />;
  };

  const columns: Column<Profile>[] = [
    {
      key: 'user',
      header: language === 'bn' ? 'ব্যবহারকারী' : 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={row.avatar_url || undefined} />
            <AvatarFallback>{(row.full_name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.full_name || 'No name'}</p>
            <p className="text-sm text-muted-foreground">{row.phone || '-'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'company',
      header: language === 'bn' ? 'কোম্পানি' : 'Company',
      render: (row) => row.company_name || '-',
    },
    {
      key: 'location',
      header: language === 'bn' ? 'অবস্থান' : 'Location',
      render: (row) => [row.city, row.country].filter(Boolean).join(', ') || '-',
    },
    {
      key: 'role',
      header: language === 'bn' ? 'রোল' : 'Role',
      render: (row) => {
        const roleConfig = ROLES.find((r) => r.value === row.role);
        return (
          <div className="flex items-center gap-2">
            {getRoleIcon(row.role || 'client')}
            <span>{roleConfig ? (language === 'bn' ? roleConfig.label_bn : roleConfig.label_en) : row.role}</span>
          </div>
        );
      },
    },
    {
      key: 'created_at',
      header: language === 'bn' ? 'যোগদান' : 'Joined',
      sortable: true,
      render: (row) => format(new Date(row.created_at), 'dd MMM yyyy'),
    },
    {
      key: 'actions',
      header: language === 'bn' ? 'অ্যাকশন' : 'Actions',
      render: (row) => (
        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditUser(row); }}>
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{language === 'bn' ? 'কাস্টমার ম্যানেজমেন্ট' : 'Customer Management'}</h1>
            <p className="text-muted-foreground">
              {language === 'bn' ? 'কাস্টমার এবং রোল পরিচালনা করুন' : 'Manage customers and roles'}
            </p>
          </div>
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'bn' ? 'নতুন কাস্টমার' : 'Add Customer'}
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <DataTable
              data={users}
              columns={columns}
              loading={loading}
              searchKeys={['full_name', 'company_name', 'phone']}
              searchPlaceholder={language === 'bn' ? 'নাম বা ফোন দিয়ে খুঁজুন...' : 'Search by name or phone...'}
              onRowClick={handleEditUser}
            />
          </CardContent>
        </Card>
      </div>

      {/* Role Change Modal */}
      <FormModal
        open={roleModalOpen}
        onOpenChange={setRoleModalOpen}
        title={language === 'bn' ? 'রোল পরিবর্তন' : 'Change Role'}
        onSubmit={handleSaveRole}
        loading={saving}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={selectedUser?.avatar_url || undefined} />
              <AvatarFallback>{(selectedUser?.full_name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{selectedUser?.full_name || 'No name'}</p>
              <p className="text-sm text-muted-foreground">{selectedUser?.phone || '-'}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{language === 'bn' ? 'রোল' : 'Role'}</Label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <div className="flex items-center gap-2">
                      <r.icon className="h-4 w-4" />
                      {language === 'bn' ? r.label_bn : r.label_en}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormModal>

      {/* Add Customer Modal */}
      <FormModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        title={language === 'bn' ? 'নতুন কাস্টমার যোগ করুন' : 'Add New Customer'}
        onSubmit={handleAddUser}
        loading={saving}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'পুরো নাম' : 'Full Name'} *</Label>
              <Input
                value={addForm.full_name}
                onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                placeholder={language === 'bn' ? 'নাম লিখুন' : 'Enter name'}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'ইমেইল' : 'Email'} *</Label>
              <Input
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder={language === 'bn' ? 'ইমেইল লিখুন' : 'Enter email'}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'পাসওয়ার্ড' : 'Password'} *</Label>
              <Input
                type="password"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                placeholder={language === 'bn' ? 'পাসওয়ার্ড লিখুন' : 'Enter password'}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'ফোন' : 'Phone'}</Label>
              <Input
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                placeholder={language === 'bn' ? 'ফোন নম্বর' : 'Phone number'}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'কোম্পানি' : 'Company'}</Label>
              <Input
                value={addForm.company_name}
                onChange={(e) => setAddForm({ ...addForm, company_name: e.target.value })}
                placeholder={language === 'bn' ? 'কোম্পানির নাম' : 'Company name'}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'রোল' : 'Role'}</Label>
              <Select value={addForm.role} onValueChange={(v) => setAddForm({ ...addForm, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {language === 'bn' ? r.label_bn : r.label_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </FormModal>
    </AdminLayout>
  );
}
