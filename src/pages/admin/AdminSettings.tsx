import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { systemSettingsService, SystemSetting } from '@/services/settings';
import type { Json } from '@/integrations/supabase/types';
import { 
  Settings, 
  Bell, 
  CreditCard, 
  Building2, 
  Shield, 
  Zap,
  Mail,
  MessageSquare,
  Phone,
  Loader2,
  Save
} from 'lucide-react';

type SettingsCategory = 'general' | 'notifications' | 'payment' | 'business' | 'automation' | 'security' | 'pricing';

interface SettingsGroup {
  [key: string]: SystemSetting;
}

export default function AdminSettings() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsGroup>({});
  const [activeTab, setActiveTab] = useState<SettingsCategory>('general');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const allSettings = await systemSettingsService.getAllSettings();
      const settingsMap: SettingsGroup = {};
      allSettings.forEach(s => {
        settingsMap[s.key] = s;
      });
      setSettings(settingsMap);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error(language === 'bn' ? 'সেটিংস লোড করতে সমস্যা হয়েছে' : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: string, value: Json) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], value }
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const updates: Record<string, unknown> = {};
      Object.entries(settings).forEach(([key, setting]) => {
        updates[key] = setting.value;
      });
      await systemSettingsService.updateMultipleSettings(updates);
      toast.success(language === 'bn' ? 'সেটিংস সংরক্ষিত হয়েছে' : 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(language === 'bn' ? 'সেটিংস সংরক্ষণে সমস্যা হয়েছে' : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const getValue = (key: string): string => {
    const val = settings[key]?.value;
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    return JSON.stringify(val) || '';
  };

  const getBoolValue = (key: string): boolean => {
    const val = settings[key]?.value;
    return val === true || val === 'true';
  };

  const getNumberValue = (key: string): number => {
    const val = settings[key]?.value;
    return typeof val === 'number' ? val : Number(val) || 0;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'bn' ? 'সিস্টেম সেটিংস' : 'System Settings'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'bn' ? 'সব ব্যবসায়িক সেটিংস এখান থেকে পরিচালনা করুন' : 'Manage all business settings from here'}
            </p>
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsCategory)}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="general" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'bn' ? 'সাধারণ' : 'General'}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'bn' ? 'নোটিফিকেশন' : 'Notifications'}</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'bn' ? 'পেমেন্ট' : 'Payment'}</span>
            </TabsTrigger>
            <TabsTrigger value="business" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'bn' ? 'ব্যবসা' : 'Business'}</span>
            </TabsTrigger>
            <TabsTrigger value="automation" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'bn' ? 'অটোমেশন' : 'Automation'}</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'bn' ? 'নিরাপত্তা' : 'Security'}</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'bn' ? 'মূল্য' : 'Pricing'}</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'bn' ? 'কোম্পানি তথ্য' : 'Company Information'}</CardTitle>
                <CardDescription>
                  {language === 'bn' ? 'আপনার কোম্পানির মৌলিক তথ্য' : 'Basic information about your company'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'bn' ? 'কোম্পানির নাম' : 'Company Name'}</Label>
                    <Input
                      value={getValue('company_name')}
                      onChange={(e) => updateSetting('company_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'bn' ? 'ইমেইল' : 'Email'}</Label>
                    <Input
                      type="email"
                      value={getValue('company_email')}
                      onChange={(e) => updateSetting('company_email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'bn' ? 'ফোন' : 'Phone'}</Label>
                    <Input
                      value={getValue('company_phone')}
                      onChange={(e) => updateSetting('company_phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'bn' ? 'লোগো URL' : 'Logo URL'}</Label>
                    <Input
                      value={getValue('company_logo_url')}
                      onChange={(e) => updateSetting('company_logo_url', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'bn' ? 'ঠিকানা' : 'Address'}</Label>
                  <Textarea
                    value={getValue('company_address')}
                    onChange={(e) => updateSetting('company_address', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {language === 'bn' ? 'SMS কনফিগারেশন' : 'SMS Configuration'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SMS API URL</Label>
                    <Input
                      value={getValue('sms_api_url')}
                      onChange={(e) => updateSetting('sms_api_url', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SMS API Key</Label>
                    <Input
                      type="password"
                      value={getValue('sms_api_key')}
                      onChange={(e) => updateSetting('sms_api_key', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sender ID</Label>
                    <Input
                      value={getValue('sms_sender_id')}
                      onChange={(e) => updateSetting('sms_sender_id', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  {language === 'bn' ? 'WhatsApp কনফিগারেশন' : 'WhatsApp Configuration'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>WhatsApp API URL</Label>
                    <Input
                      value={getValue('whatsapp_api_url')}
                      onChange={(e) => updateSetting('whatsapp_api_url', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Token</Label>
                    <Input
                      type="password"
                      value={getValue('whatsapp_api_token')}
                      onChange={(e) => updateSetting('whatsapp_api_token', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone ID</Label>
                    <Input
                      value={getValue('whatsapp_phone_id')}
                      onChange={(e) => updateSetting('whatsapp_phone_id', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  {language === 'bn' ? 'ইমেইল SMTP কনফিগারেশন' : 'Email SMTP Configuration'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SMTP Host</Label>
                    <Input
                      value={getValue('smtp_host')}
                      onChange={(e) => updateSetting('smtp_host', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP Port</Label>
                    <Input
                      type="number"
                      value={getNumberValue('smtp_port')}
                      onChange={(e) => updateSetting('smtp_port', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP Username</Label>
                    <Input
                      value={getValue('smtp_user')}
                      onChange={(e) => updateSetting('smtp_user', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP Password</Label>
                    <Input
                      type="password"
                      value={getValue('smtp_password')}
                      onChange={(e) => updateSetting('smtp_password', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>From Email</Label>
                    <Input
                      value={getValue('smtp_from_email')}
                      onChange={(e) => updateSetting('smtp_from_email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>From Name</Label>
                    <Input
                      value={getValue('smtp_from_name')}
                      onChange={(e) => updateSetting('smtp_from_name', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'bn' ? 'মোবাইল পেমেন্ট' : 'Mobile Payment'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>bKash Number</Label>
                    <Input
                      value={getValue('bkash_number')}
                      onChange={(e) => updateSetting('bkash_number', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nagad Number</Label>
                    <Input
                      value={getValue('nagad_number')}
                      onChange={(e) => updateSetting('nagad_number', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rocket Number</Label>
                    <Input
                      value={getValue('rocket_number')}
                      onChange={(e) => updateSetting('rocket_number', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{language === 'bn' ? 'ব্যাংক তথ্য' : 'Bank Details'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'bn' ? 'ব্যাংকের নাম' : 'Bank Name'}</Label>
                    <Input
                      value={getValue('bank_name')}
                      onChange={(e) => updateSetting('bank_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'bn' ? 'অ্যাকাউন্ট নাম' : 'Account Name'}</Label>
                    <Input
                      value={getValue('bank_account_name')}
                      onChange={(e) => updateSetting('bank_account_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'bn' ? 'অ্যাকাউন্ট নম্বর' : 'Account Number'}</Label>
                    <Input
                      value={getValue('bank_account_number')}
                      onChange={(e) => updateSetting('bank_account_number', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'bn' ? 'ব্রাঞ্চ' : 'Branch'}</Label>
                    <Input
                      value={getValue('bank_branch')}
                      onChange={(e) => updateSetting('bank_branch', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'bn' ? 'রাউটিং নম্বর' : 'Routing Number'}</Label>
                    <Input
                      value={getValue('bank_routing_number')}
                      onChange={(e) => updateSetting('bank_routing_number', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Settings */}
          <TabsContent value="business" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'bn' ? 'ব্যবসায়িক সেটিংস' : 'Business Settings'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'bn' ? 'ডিফল্ট মুদ্রা' : 'Default Currency'}</Label>
                    <Input
                      value={getValue('default_currency')}
                      onChange={(e) => updateSetting('default_currency', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'bn' ? 'গ্রেস পিরিয়ড (দিন)' : 'Grace Period (days)'}</Label>
                    <Input
                      type="number"
                      value={getNumberValue('grace_period_days')}
                      onChange={(e) => updateSetting('grace_period_days', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'bn' ? 'রিমাইন্ডার ইন্টারভাল (দিন)' : 'Reminder Interval (days)'}</Label>
                    <Input
                      type="number"
                      value={getNumberValue('reminder_interval_days')}
                      onChange={(e) => updateSetting('reminder_interval_days', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'bn' ? 'ডিফল্ট অ্যাফিলিয়েট কমিশন (%)' : 'Default Affiliate Commission (%)'}</Label>
                    <Input
                      type="number"
                      value={getNumberValue('default_commission_rate')}
                      onChange={(e) => updateSetting('default_commission_rate', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'bn' ? 'ডিফল্ট রিসেলার মার্জিন (%)' : 'Default Reseller Margin (%)'}</Label>
                    <Input
                      type="number"
                      value={getNumberValue('default_reseller_margin')}
                      onChange={(e) => updateSetting('default_reseller_margin', Number(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Settings */}
          <TabsContent value="automation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'bn' ? 'অটোমেশন কন্ট্রোল' : 'Automation Controls'}</CardTitle>
                <CardDescription>
                  {language === 'bn' ? 'স্বয়ংক্রিয় প্রসেসগুলি চালু/বন্ধ করুন' : 'Toggle automatic processes on/off'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{language === 'bn' ? 'স্বয়ংক্রিয় রিমাইন্ডার' : 'Auto Reminder'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'bn' ? 'পেমেন্ট ও রিনিউয়াল রিমাইন্ডার' : 'Payment and renewal reminders'}
                    </p>
                  </div>
                  <Switch
                    checked={getBoolValue('auto_reminder_enabled')}
                    onCheckedChange={(checked) => updateSetting('auto_reminder_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>{language === 'bn' ? 'অটো রিনিউ সাবস্ক্রিপশন' : 'Auto Renew Subscription'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'bn' ? 'সাবস্ক্রিপশন স্বয়ংক্রিয়ভাবে রিনিউ করুন' : 'Automatically renew subscriptions'}
                    </p>
                  </div>
                  <Switch
                    checked={getBoolValue('subscription_auto_renew')}
                    onCheckedChange={(checked) => updateSetting('subscription_auto_renew', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>{language === 'bn' ? 'অটো সাসপেন্ড' : 'Auto Suspend'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'bn' ? 'পেমেন্ট না হলে স্বয়ংক্রিয়ভাবে সাসপেন্ড' : 'Automatically suspend on non-payment'}
                    </p>
                  </div>
                  <Switch
                    checked={getBoolValue('auto_suspend_enabled')}
                    onCheckedChange={(checked) => updateSetting('auto_suspend_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>{language === 'bn' ? 'প্রপোজাল রিমাইন্ডার' : 'Proposal Reminder'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'bn' ? 'পেন্ডিং প্রপোজালের জন্য রিমাইন্ডার' : 'Remind for pending proposals'}
                    </p>
                  </div>
                  <Switch
                    checked={getBoolValue('proposal_reminder_enabled')}
                    onCheckedChange={(checked) => updateSetting('proposal_reminder_enabled', checked)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>{language === 'bn' ? 'অটো সাসপেন্ড দিন' : 'Auto Suspend Days'}</Label>
                    <Input
                      type="number"
                      value={getNumberValue('auto_suspend_days')}
                      onChange={(e) => updateSetting('auto_suspend_days', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'bn' ? 'প্রপোজাল রিমাইন্ডার দিন' : 'Proposal Reminder Days'}</Label>
                    <Input
                      type="number"
                      value={getNumberValue('proposal_reminder_days')}
                      onChange={(e) => updateSetting('proposal_reminder_days', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'bn' ? 'মাইলস্টোন রিমাইন্ডার দিন' : 'Milestone Reminder Days'}</Label>
                    <Input
                      type="number"
                      value={getNumberValue('milestone_reminder_days')}
                      onChange={(e) => updateSetting('milestone_reminder_days', Number(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'bn' ? 'নিরাপত্তা সেটিংস' : 'Security Settings'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{language === 'bn' ? 'রেট লিমিট' : 'Rate Limiting'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'bn' ? 'API রেট লিমিটিং চালু করুন' : 'Enable API rate limiting'}
                    </p>
                  </div>
                  <Switch
                    checked={getBoolValue('rate_limit_enabled')}
                    onCheckedChange={(checked) => updateSetting('rate_limit_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>{language === 'bn' ? 'IP রিস্ট্রিকশন' : 'IP Restriction'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'bn' ? 'অ্যাডমিনের জন্য IP রিস্ট্রিকশন' : 'Restrict admin access by IP'}
                    </p>
                  </div>
                  <Switch
                    checked={getBoolValue('ip_restriction_enabled')}
                    onCheckedChange={(checked) => updateSetting('ip_restriction_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>{language === 'bn' ? 'টু-ফ্যাক্টর অথেনটিকেশন' : 'Two-Factor Authentication'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'bn' ? 'অ্যাডমিনদের জন্য 2FA বাধ্যতামূলক করুন' : 'Require 2FA for admin users'}
                    </p>
                  </div>
                  <Switch
                    checked={getBoolValue('two_factor_required')}
                    onCheckedChange={(checked) => updateSetting('two_factor_required', checked)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>{language === 'bn' ? 'রেট লিমিট (প্রতি মিনিটে)' : 'Rate Limit (per minute)'}</Label>
                    <Input
                      type="number"
                      value={getNumberValue('rate_limit_requests')}
                      onChange={(e) => updateSetting('rate_limit_requests', Number(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Settings */}
          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'bn' ? 'মূল্য ও ডিসকাউন্ট' : 'Pricing & Discounts'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{language === 'bn' ? 'ডিসকাউন্ট সিস্টেম' : 'Discount System'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'bn' ? 'কুপন ও ডিসকাউন্ট চালু করুন' : 'Enable coupons and discounts'}
                    </p>
                  </div>
                  <Switch
                    checked={getBoolValue('discount_system_enabled')}
                    onCheckedChange={(checked) => updateSetting('discount_system_enabled', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{language === 'bn' ? 'সর্বোচ্চ ডিসকাউন্ট (%)' : 'Max Discount (%)'}</Label>
                  <Input
                    type="number"
                    value={getNumberValue('max_discount_percentage')}
                    onChange={(e) => updateSetting('max_discount_percentage', Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
