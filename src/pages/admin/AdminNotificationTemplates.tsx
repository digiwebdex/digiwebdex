import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Edit, Save, Mail, MessageSquare, Phone, Bell } from 'lucide-react';

interface NotificationTemplate {
  id: string;
  slug: string;
  name: string;
  notification_type: 'email' | 'sms' | 'whatsapp' | 'in_app';
  event_name: string | null;
  subject_en: string | null;
  subject_bn: string | null;
  body_en: string | null;
  body_bn: string | null;
  variables: unknown[];
  is_active: boolean;
}

const NOTIFICATION_TYPES = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'sms', label: 'SMS', icon: MessageSquare },
  { value: 'whatsapp', label: 'WhatsApp', icon: Phone },
  { value: 'in_app', label: 'In-App', icon: Bell },
];

const AVAILABLE_VARIABLES = [
  '{{name}}', '{{email}}', '{{phone}}', '{{order_id}}', '{{order_number}}',
  '{{amount}}', '{{service_name}}', '{{invoice_number}}', '{{due_date}}',
  '{{company_name}}', '{{ticket_number}}', '{{project_name}}', '{{milestone_title}}',
];

export default function AdminNotificationTemplates() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [activeTab, setActiveTab] = useState('email');
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setTemplates((data || []) as unknown as NotificationTemplate[]);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error(language === 'bn' ? 'টেমপ্লেট লোড করতে সমস্যা হয়েছে' : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTemplate({
      id: '',
      slug: '',
      name: '',
      notification_type: activeTab as NotificationTemplate['notification_type'],
      event_name: '',
      subject_en: '',
      subject_bn: '',
      body_en: '',
      body_bn: '',
      variables: [],
      is_active: true,
    });
    setShowEditModal(true);
  };

  const handleEdit = (template: NotificationTemplate) => {
    setEditingTemplate({ ...template });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editingTemplate || !editingTemplate.name || !editingTemplate.slug) {
      toast.error(language === 'bn' ? 'অনুগ্রহ করে সব ফিল্ড পূরণ করুন' : 'Please fill all required fields');
      return;
    }

    try {
      setSaving(true);

      if (editingTemplate.id) {
        const { error } = await supabase
          .from('notification_templates')
          .update({
            name: editingTemplate.name,
            event_name: editingTemplate.event_name,
            subject_en: editingTemplate.subject_en,
            subject_bn: editingTemplate.subject_bn,
            body_en: editingTemplate.body_en,
            body_bn: editingTemplate.body_bn,
            is_active: editingTemplate.is_active,
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_templates')
          .insert([{
            slug: editingTemplate.slug,
            name: editingTemplate.name,
            notification_type: editingTemplate.notification_type,
            event_name: editingTemplate.event_name,
            subject_en: editingTemplate.subject_en,
            subject_bn: editingTemplate.subject_bn,
            body_en: editingTemplate.body_en,
            body_bn: editingTemplate.body_bn,
            is_active: editingTemplate.is_active,
          }]);

        if (error) throw error;
      }

      await loadTemplates();
      setShowEditModal(false);
      toast.success(language === 'bn' ? 'টেমপ্লেট সংরক্ষিত হয়েছে' : 'Template saved successfully');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(language === 'bn' ? 'টেমপ্লেট সংরক্ষণে সমস্যা হয়েছে' : 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const getTemplatesByType = (type: string) => {
    return templates.filter(t => t.notification_type === type);
  };

  const insertVariable = (variable: string) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      body_en: (editingTemplate.body_en || '') + ' ' + variable,
    });
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
              {language === 'bn' ? 'নোটিফিকেশন টেমপ্লেট' : 'Notification Templates'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'bn' ? 'ইমেইল, SMS, WhatsApp ও ইন-অ্যাপ নোটিফিকেশন টেমপ্লেট পরিচালনা করুন' : 'Manage email, SMS, WhatsApp, and in-app notification templates'}
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            {language === 'bn' ? 'নতুন টেমপ্লেট' : 'Add Template'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            {NOTIFICATION_TYPES.map(type => {
              const Icon = type.icon;
              return (
                <TabsTrigger key={type.value} value={type.value} className="gap-2">
                  <Icon className="h-4 w-4" />
                  {type.label}
                  <Badge variant="secondary" className="ml-1">
                    {getTemplatesByType(type.value).length}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {NOTIFICATION_TYPES.map(type => (
            <TabsContent key={type.value} value={type.value} className="space-y-4">
              {getTemplatesByType(type.value).length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    {language === 'bn' 
                      ? `${type.label} টেমপ্লেট নেই` 
                      : `No ${type.label} templates yet`}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {getTemplatesByType(type.value).map(template => (
                    <Card key={template.id} className={!template.is_active ? 'opacity-60' : ''}>
                      <CardHeader className="flex flex-row items-center justify-between py-3">
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {template.slug} {template.event_name && `• ${template.event_name}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!template.is_active && (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                            <Edit className="h-4 w-4 mr-1" />
                            {language === 'bn' ? 'এডিট' : 'Edit'}
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate?.id 
                  ? (language === 'bn' ? 'টেমপ্লেট এডিট করুন' : 'Edit Template')
                  : (language === 'bn' ? 'নতুন টেমপ্লেট' : 'New Template')}
              </DialogTitle>
            </DialogHeader>

            {editingTemplate && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input
                      placeholder="e.g., order_created"
                      value={editingTemplate.slug}
                      onChange={(e) => setEditingTemplate({ 
                        ...editingTemplate, 
                        slug: e.target.value.toLowerCase().replace(/\s+/g, '_')
                      })}
                      disabled={!!editingTemplate.id}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Event Name</Label>
                    <Input
                      placeholder="e.g., ORDER_CREATED"
                      value={editingTemplate.event_name || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, event_name: e.target.value })}
                    />
                  </div>
                </div>

                {editingTemplate.notification_type === 'email' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Subject (English)</Label>
                      <Input
                        value={editingTemplate.subject_en || ''}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, subject_en: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subject (বাংলা)</Label>
                      <Input
                        value={editingTemplate.subject_bn || ''}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, subject_bn: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Available Variables</Label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_VARIABLES.map(variable => (
                      <Badge 
                        key={variable} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => insertVariable(variable)}
                      >
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Body (English)</Label>
                    <Textarea
                      rows={8}
                      value={editingTemplate.body_en || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, body_en: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Body (বাংলা)</Label>
                    <Textarea
                      rows={8}
                      value={editingTemplate.body_bn || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, body_bn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingTemplate.is_active}
                    onCheckedChange={(checked) => setEditingTemplate({ ...editingTemplate, is_active: checked })}
                  />
                  <Label>{language === 'bn' ? 'সক্রিয়' : 'Active'}</Label>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {language === 'bn' ? 'সংরক্ষণ' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
