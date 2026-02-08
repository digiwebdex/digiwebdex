import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { systemSettingsService, ProposalTemplate } from '@/services/settings';
import { Loader2, Plus, Edit, Save, Star, Palette, FileText } from 'lucide-react';

export default function AdminProposalTemplates() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<Partial<ProposalTemplate> | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await systemSettingsService.getProposalTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error(language === 'bn' ? 'টেমপ্লেট লোড করতে সমস্যা হয়েছে' : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTemplate({
      name: '',
      is_default: false,
      header_text_en: '',
      header_text_bn: '',
      footer_text_en: '',
      footer_text_bn: '',
      terms_conditions_en: '',
      terms_conditions_bn: '',
      payment_instructions_en: '',
      payment_instructions_bn: '',
      logo_url: '',
      primary_color: '#2563eb',
      secondary_color: '#1e40af',
      accent_color: '#3b82f6',
      show_company_details: true,
      show_bank_details: true,
      show_mobile_payment: true,
      custom_css: '',
    });
    setShowEditModal(true);
  };

  const handleEdit = (template: ProposalTemplate) => {
    setEditingTemplate({ ...template });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editingTemplate || !editingTemplate.name) {
      toast.error(language === 'bn' ? 'টেমপ্লেট নাম দিন' : 'Please provide a template name');
      return;
    }

    try {
      setSaving(true);

      if ('id' in editingTemplate && editingTemplate.id) {
        await systemSettingsService.updateProposalTemplate(editingTemplate.id, editingTemplate);
      } else {
        await systemSettingsService.createProposalTemplate(editingTemplate as ProposalTemplate);
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
              {language === 'bn' ? 'প্রপোজাল টেমপ্লেট' : 'Proposal Templates'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'bn' ? 'কাস্টম প্রপোজাল টেমপ্লেট তৈরি ও পরিচালনা করুন' : 'Create and manage custom proposal templates'}
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            {language === 'bn' ? 'নতুন টেমপ্লেট' : 'Add Template'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <Card key={template.id} className="relative">
              {template.is_default && (
                <Badge className="absolute top-2 right-2 gap-1">
                  <Star className="h-3 w-3" />
                  Default
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {template.name}
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <div 
                      className="w-4 h-4 rounded-full border" 
                      style={{ backgroundColor: template.primary_color }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border" 
                      style={{ backgroundColor: template.secondary_color }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border" 
                      style={{ backgroundColor: template.accent_color }}
                    />
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => handleEdit(template)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {language === 'bn' ? 'এডিট করুন' : 'Edit Template'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate && 'id' in editingTemplate
                  ? (language === 'bn' ? 'টেমপ্লেট এডিট করুন' : 'Edit Template')
                  : (language === 'bn' ? 'নতুন টেমপ্লেট' : 'New Template')}
              </DialogTitle>
            </DialogHeader>

            {editingTemplate && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input
                      value={editingTemplate.name || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Logo URL</Label>
                    <Input
                      value={editingTemplate.logo_url || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, logo_url: e.target.value })}
                    />
                  </div>
                </div>

                {/* Colors */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      {language === 'bn' ? 'রঙ থিম' : 'Color Theme'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          className="w-12 h-10 p-1"
                          value={editingTemplate.primary_color || '#2563eb'}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, primary_color: e.target.value })}
                        />
                        <Input
                          value={editingTemplate.primary_color || ''}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, primary_color: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          className="w-12 h-10 p-1"
                          value={editingTemplate.secondary_color || '#1e40af'}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, secondary_color: e.target.value })}
                        />
                        <Input
                          value={editingTemplate.secondary_color || ''}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, secondary_color: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Accent Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          className="w-12 h-10 p-1"
                          value={editingTemplate.accent_color || '#3b82f6'}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, accent_color: e.target.value })}
                        />
                        <Input
                          value={editingTemplate.accent_color || ''}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, accent_color: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Header & Footer */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Header Text (English)</Label>
                    <Textarea
                      rows={3}
                      value={editingTemplate.header_text_en || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, header_text_en: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Header Text (বাংলা)</Label>
                    <Textarea
                      rows={3}
                      value={editingTemplate.header_text_bn || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, header_text_bn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Footer Text (English)</Label>
                    <Textarea
                      rows={3}
                      value={editingTemplate.footer_text_en || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, footer_text_en: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Footer Text (বাংলা)</Label>
                    <Textarea
                      rows={3}
                      value={editingTemplate.footer_text_bn || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, footer_text_bn: e.target.value })}
                    />
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Terms & Conditions (English)</Label>
                    <Textarea
                      rows={4}
                      value={editingTemplate.terms_conditions_en || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, terms_conditions_en: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Terms & Conditions (বাংলা)</Label>
                    <Textarea
                      rows={4}
                      value={editingTemplate.terms_conditions_bn || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, terms_conditions_bn: e.target.value })}
                    />
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Instructions (English)</Label>
                    <Textarea
                      rows={3}
                      value={editingTemplate.payment_instructions_en || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, payment_instructions_en: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Instructions (বাংলা)</Label>
                    <Textarea
                      rows={3}
                      value={editingTemplate.payment_instructions_bn || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, payment_instructions_bn: e.target.value })}
                    />
                  </div>
                </div>

                {/* Display Options */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingTemplate.show_company_details !== false}
                      onCheckedChange={(checked) => setEditingTemplate({ ...editingTemplate, show_company_details: checked })}
                    />
                    <Label>Show Company Details</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingTemplate.show_bank_details !== false}
                      onCheckedChange={(checked) => setEditingTemplate({ ...editingTemplate, show_bank_details: checked })}
                    />
                    <Label>Show Bank Details</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingTemplate.show_mobile_payment !== false}
                      onCheckedChange={(checked) => setEditingTemplate({ ...editingTemplate, show_mobile_payment: checked })}
                    />
                    <Label>Show Mobile Payment</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingTemplate.is_default || false}
                      onCheckedChange={(checked) => setEditingTemplate({ ...editingTemplate, is_default: checked })}
                    />
                    <Label>Set as Default</Label>
                  </div>
                </div>

                {/* Custom CSS */}
                <div className="space-y-2">
                  <Label>Custom CSS (Optional)</Label>
                  <Textarea
                    rows={4}
                    placeholder="/* Add custom styles here */"
                    value={editingTemplate.custom_css || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, custom_css: e.target.value })}
                  />
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
