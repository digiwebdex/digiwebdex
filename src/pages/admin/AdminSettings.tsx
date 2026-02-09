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
  Save,
  Facebook,
  Cookie,
  TestTube2,
  Activity
} from 'lucide-react';

type SettingsCategory = 'general' | 'notifications' | 'payment' | 'business' | 'automation' | 'security' | 'pricing' | 'tracking';

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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
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
            <TabsTrigger value="tracking" className="gap-2">
              <Facebook className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'bn' ? 'ট্র্যাকিং' : 'Tracking'}</span>
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

            <Card>
              <CardHeader>
                <CardTitle>{language === 'bn' ? 'ওয়েবসাইট ফিচার' : 'Website Features'}</CardTitle>
                <CardDescription>
                  {language === 'bn' ? 'ওয়েবসাইটের বিভিন্ন ফিচার চালু/বন্ধ করুন' : 'Enable/disable various website features'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{language === 'bn' ? 'কল ব্যাক রিকোয়েস্ট বাটন' : 'Callback Request Button'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'bn' 
                        ? 'ভিজিটরদের জন্য ফ্লোটিং কল ব্যাক বাটন দেখান' 
                        : 'Show floating callback button for visitors'}
                    </p>
                  </div>
                  <Switch
                    checked={getBoolValue('callback_button_enabled')}
                    onCheckedChange={(checked) => updateSetting('callback_button_enabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{language === 'bn' ? 'হেডার অর্ডার বাটন' : 'Header Order Button'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'bn' 
                        ? 'হেডারে "অর্ডার করুন" বাটন দেখান' 
                        : 'Show "Order Now" button in header'}
                    </p>
                  </div>
                  <Switch
                    checked={getBoolValue('header_order_button_enabled')}
                    onCheckedChange={(checked) => updateSetting('header_order_button_enabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{language === 'bn' ? 'ফ্লোটিং অর্ডার বাটন' : 'Floating Order Button'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'bn' 
                        ? 'ফ্লোটিং "অর্ডার করুন" বাটন ও মোবাইল বার দেখান' 
                        : 'Show floating "Order Now" button & mobile bar'}
                    </p>
                  </div>
                  <Switch
                    checked={getBoolValue('floating_order_button_enabled')}
                    onCheckedChange={(checked) => updateSetting('floating_order_button_enabled', checked)}
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

          {/* Facebook Tracking Settings */}
          <TabsContent value="tracking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Facebook className="h-5 w-5 text-blue-600" />
                  {language === 'bn' ? 'Facebook Pixel কনফিগারেশন' : 'Facebook Pixel Configuration'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' 
                    ? 'Facebook Ads এর জন্য ট্র্যাকিং সেটআপ করুন'
                    : 'Configure tracking for Facebook Ads optimization'}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pixel ID</Label>
                    <Input
                      value={getValue('fb_pixel_id')}
                      onChange={(e) => updateSetting('fb_pixel_id', e.target.value)}
                      placeholder="e.g., 1234567890123456"
                    />
                    <p className="text-xs text-muted-foreground">
                      {language === 'bn' 
                        ? 'Facebook Events Manager থেকে Pixel ID খুঁজুন'
                        : 'Find in Facebook Events Manager → Data Sources'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Access Token (CAPI)</Label>
                    <Input
                      type="password"
                      value={getValue('fb_access_token')}
                      onChange={(e) => updateSetting('fb_access_token', e.target.value)}
                      placeholder="EAA..."
                    />
                    <p className="text-xs text-muted-foreground">
                      {language === 'bn' 
                        ? 'Conversions API এর জন্য অ্যাক্সেস টোকেন'
                        : 'Required for Server-Side Conversion API'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label>{language === 'bn' ? 'Server-Side CAPI' : 'Server-Side CAPI'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'bn' 
                        ? 'Conversion API চালু করুন (ভালো ট্র্যাকিং)'
                        : 'Enable Conversions API for better tracking accuracy'}
                    </p>
                  </div>
                  <Switch
                    checked={getBoolValue('fb_capi_enabled')}
                    onCheckedChange={(checked) => updateSetting('fb_capi_enabled', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <TestTube2 className="h-4 w-4" />
                    {language === 'bn' ? 'টেস্ট ইভেন্ট কোড' : 'Test Event Code'}
                  </Label>
                  <Input
                    value={getValue('fb_test_event_code')}
                    onChange={(e) => updateSetting('fb_test_event_code', e.target.value)}
                    placeholder="TEST12345"
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === 'bn' 
                      ? 'Events Manager → Test Events থেকে কোড পান। প্রোডাকশনে খালি রাখুন।'
                      : 'Get from Events Manager → Test Events. Leave empty in production.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-5 w-5" />
                  {language === 'bn' ? 'Cookie Consent' : 'Cookie Consent'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{language === 'bn' ? 'Cookie Consent Banner' : 'Cookie Consent Banner'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'bn' 
                        ? 'GDPR কমপ্লায়েন্সের জন্য consent banner দেখান'
                        : 'Show consent banner for GDPR/Privacy compliance'}
                    </p>
                  </div>
                  <Switch
                    checked={getBoolValue('cookie_consent_enabled')}
                    onCheckedChange={(checked) => updateSetting('cookie_consent_enabled', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{language === 'bn' ? 'Consent Text (English)' : 'Consent Text (English)'}</Label>
                  <Input
                    value={getValue('cookie_consent_text_en')}
                    onChange={(e) => updateSetting('cookie_consent_text_en', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{language === 'bn' ? 'Consent Text (বাংলা)' : 'Consent Text (Bangla)'}</Label>
                  <Input
                    value={getValue('cookie_consent_text_bn')}
                    onChange={(e) => updateSetting('cookie_consent_text_bn', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {language === 'bn' ? 'ট্র্যাক করা ইভেন্ট' : 'Tracked Events'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { event: 'PageView', desc: language === 'bn' ? 'পেজ ভিজিট' : 'Page visits' },
                    { event: 'ViewContent', desc: language === 'bn' ? 'সার্ভিস পেজ দেখা' : 'Service page views' },
                    { event: 'Lead', desc: language === 'bn' ? 'লিড ফর্ম সাবমিট' : 'Lead form submissions' },
                    { event: 'AddToCart', desc: language === 'bn' ? 'প্যাকেজ সিলেক্ট' : 'Package selection' },
                    { event: 'InitiateCheckout', desc: language === 'bn' ? 'অর্ডার শুরু' : 'Order initiation' },
                    { event: 'Purchase', desc: language === 'bn' ? 'পেমেন্ট সম্পন্ন' : 'Payment completed' },
                  ].map(({ event, desc }) => (
                    <div key={event} className="p-3 rounded-lg bg-muted/50 border">
                      <p className="font-medium text-sm">{event}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  {language === 'bn' 
                    ? '* এই ইভেন্টগুলো স্বয়ংক্রিয়ভাবে ট্র্যাক হয় এবং Facebook-এ পাঠানো হয়।'
                    : '* These events are automatically tracked and sent to Facebook.'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
