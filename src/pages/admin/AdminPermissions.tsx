import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Save, Loader2 } from 'lucide-react';

type AppRole = 'admin' | 'staff' | 'support';

interface Permission {
  id: string;
  role: string;
  module: string;
  action: string;
  allowed: boolean;
}

const MODULES = [
  'orders', 'invoices', 'customers', 'domains', 'hosting',
  'leads', 'payments', 'subscriptions', 'projects', 'proposals',
  'tickets', 'blog', 'seo', 'services', 'packages',
  'resellers', 'settings', 'analytics', 'users',
];

const ACTIONS = ['view', 'edit', 'delete', 'export', 'financial'];

const ROLES: AppRole[] = ['admin', 'staff', 'support'];

const ROLE_LABELS: Record<AppRole, { en: string; bn: string }> = {
  admin: { en: 'Admin', bn: 'অ্যাডমিন' },
  staff: { en: 'Staff', bn: 'স্টাফ' },
  support: { en: 'Support', bn: 'সাপোর্ট' },
};

const ACTION_LABELS: Record<string, { en: string; bn: string }> = {
  view: { en: 'View', bn: 'দেখুন' },
  edit: { en: 'Edit', bn: 'সম্পাদনা' },
  delete: { en: 'Delete', bn: 'মুছুন' },
  export: { en: 'Export', bn: 'এক্সপোর্ট' },
  financial: { en: 'Financial', bn: 'আর্থিক' },
};

export default function AdminPermissions() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('role_permissions')
      .select('*')
      .in('role', ROLES)
      .order('module')
      .order('action');

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setPermissions(data || []);
    }
    setLoading(false);
  };

  const getPermission = (role: string, module: string, action: string): boolean => {
    const key = `${role}-${module}-${action}`;
    if (changes.has(key)) return changes.get(key)!;
    const perm = permissions.find(p => p.role === role && p.module === module && p.action === action);
    return perm?.allowed ?? false;
  };

  const togglePermission = (role: string, module: string, action: string) => {
    const key = `${role}-${module}-${action}`;
    const current = getPermission(role, module, action);
    setChanges(prev => new Map(prev).set(key, !current));
  };

  const handleSave = async () => {
    if (changes.size === 0) return;
    setSaving(true);

    const upserts: Array<{ role: string; module: string; action: string; allowed: boolean }> = [];
    changes.forEach((allowed, key) => {
      const [role, module, action] = key.split('-');
      upserts.push({ role: role as AppRole, module, action, allowed });
    });

    // Process each upsert
    let hasError = false;
    for (const item of upserts) {
      const existing = permissions.find(p => p.role === item.role && p.module === item.module && p.action === item.action);
      if (existing) {
        const { error } = await supabase
          .from('role_permissions')
          .update({ allowed: item.allowed })
          .eq('id', existing.id);
        if (error) hasError = true;
      } else {
        const { error } = await supabase
          .from('role_permissions')
          .insert({ role: item.role as AppRole, module: item.module, action: item.action, allowed: item.allowed });
        if (error) hasError = true;
      }
    }

    if (hasError) {
      toast({ title: 'Error', description: language === 'bn' ? 'কিছু পারমিশন সেভ হয়নি' : 'Some permissions failed to save', variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Success', description: language === 'bn' ? 'পারমিশন আপডেট হয়েছে' : 'Permissions updated successfully' });
      setChanges(new Map());
      fetchPermissions();
    }
    setSaving(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{language === 'bn' ? 'রোল পারমিশন' : 'Role Permissions'}</h1>
              <p className="text-sm text-muted-foreground">
                {language === 'bn' ? 'প্রতিটি রোলের জন্য মডিউল অনুযায়ী অনুমতি কনফিগার করুন' : 'Configure module-level access for each role'}
              </p>
            </div>
          </div>
          {changes.size > 0 && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {language === 'bn' ? `সেভ করুন (${changes.size})` : `Save Changes (${changes.size})`}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="admin">
            <TabsList>
              {ROLES.map(role => (
                <TabsTrigger key={role} value={role} className="capitalize">
                  {language === 'bn' ? ROLE_LABELS[role].bn : ROLE_LABELS[role].en}
                </TabsTrigger>
              ))}
            </TabsList>

            {ROLES.map(role => (
              <TabsContent key={role} value={role}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant={role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                        {language === 'bn' ? ROLE_LABELS[role].bn : ROLE_LABELS[role].en}
                      </Badge>
                      <span className="text-sm font-normal text-muted-foreground">
                        {language === 'bn' ? '— মডিউল অনুমতি' : '— Module Permissions'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold">
                              {language === 'bn' ? 'মডিউল' : 'Module'}
                            </th>
                            {ACTIONS.map(action => (
                              <th key={action} className="text-center py-3 px-3 font-semibold">
                                {language === 'bn' ? ACTION_LABELS[action].bn : ACTION_LABELS[action].en}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {MODULES.map(module => (
                            <tr key={module} className="border-b last:border-0 hover:bg-muted/50">
                              <td className="py-3 px-4 font-medium capitalize">{module}</td>
                              {ACTIONS.map(action => {
                                const key = `${role}-${module}-${action}`;
                                const isChanged = changes.has(key);
                                return (
                                  <td key={action} className="text-center py-3 px-3">
                                    <div className="flex justify-center">
                                      <Switch
                                        checked={getPermission(role, module, action)}
                                        onCheckedChange={() => togglePermission(role, module, action)}
                                        className={isChanged ? 'ring-2 ring-primary' : ''}
                                      />
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
}
