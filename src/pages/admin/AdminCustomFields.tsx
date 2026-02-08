import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { systemSettingsService, CustomField, CustomFieldType } from '@/services/settings';
import { Loader2, Plus, Edit, Trash2, Save, Users, FolderKanban, ShoppingCart, UserPlus } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/admin/common';

const FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'url', label: 'URL' },
  { value: 'date', label: 'Date' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'multiselect', label: 'Multi-Select' },
  { value: 'checkbox', label: 'Checkbox' },
];

const ENTITY_TYPES = [
  { value: 'lead', label: 'Lead', labelBn: 'লিড', icon: UserPlus },
  { value: 'project', label: 'Project', labelBn: 'প্রজেক্ট', icon: FolderKanban },
  { value: 'order', label: 'Order', labelBn: 'অর্ডার', icon: ShoppingCart },
  { value: 'client', label: 'Client', labelBn: 'ক্লায়েন্ট', icon: Users },
];

export default function AdminCustomFields() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState<CustomField[]>([]);
  const [activeTab, setActiveTab] = useState('lead');
  const [editingField, setEditingField] = useState<Partial<CustomField> | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteField, setDeleteField] = useState<CustomField | null>(null);

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      setLoading(true);
      const data = await systemSettingsService.getCustomFields();
      setFields(data);
    } catch (error) {
      console.error('Error loading fields:', error);
      toast.error(language === 'bn' ? 'ফিল্ড লোড করতে সমস্যা হয়েছে' : 'Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingField({
      entity_type: activeTab as 'lead' | 'project' | 'order' | 'client',
      field_key: '',
      field_label_en: '',
      field_label_bn: '',
      field_type: 'text',
      is_required: false,
      is_active: true,
      sort_order: fields.filter(f => f.entity_type === activeTab).length,
      options: [],
    });
    setShowEditModal(true);
  };

  const handleEdit = (field: CustomField) => {
    setEditingField({ ...field });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editingField || !editingField.field_key || !editingField.field_label_en) {
      toast.error(language === 'bn' ? 'অনুগ্রহ করে সব ফিল্ড পূরণ করুন' : 'Please fill all required fields');
      return;
    }

    try {
      setSaving(true);

      if ('id' in editingField && editingField.id) {
        await systemSettingsService.updateCustomField(editingField.id, editingField);
      } else {
        await systemSettingsService.createCustomField(editingField as CustomField);
      }

      await loadFields();
      setShowEditModal(false);
      toast.success(language === 'bn' ? 'ফিল্ড সংরক্ষিত হয়েছে' : 'Field saved successfully');
    } catch (error) {
      console.error('Error saving field:', error);
      toast.error(language === 'bn' ? 'ফিল্ড সংরক্ষণে সমস্যা হয়েছে' : 'Failed to save field');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteField) return;

    try {
      await systemSettingsService.deleteCustomField(deleteField.id);
      await loadFields();
      setDeleteField(null);
      toast.success(language === 'bn' ? 'ফিল্ড মুছে ফেলা হয়েছে' : 'Field deleted successfully');
    } catch (error) {
      console.error('Error deleting field:', error);
      toast.error(language === 'bn' ? 'ফিল্ড মুছতে সমস্যা হয়েছে' : 'Failed to delete field');
    }
  };

  const getFieldsByEntity = (entityType: string) => {
    return fields.filter(f => f.entity_type === entityType).sort((a, b) => a.sort_order - b.sort_order);
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
              {language === 'bn' ? 'কাস্টম ফিল্ড ম্যানেজার' : 'Custom Field Manager'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'bn' ? 'লিড, প্রজেক্ট, অর্ডার ও ক্লায়েন্টের জন্য কাস্টম ফিল্ড তৈরি করুন' : 'Create custom fields for leads, projects, orders, and clients'}
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            {language === 'bn' ? 'নতুন ফিল্ড' : 'Add Field'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            {ENTITY_TYPES.map(entity => {
              const Icon = entity.icon;
              return (
                <TabsTrigger key={entity.value} value={entity.value} className="gap-2">
                  <Icon className="h-4 w-4" />
                  {language === 'bn' ? entity.labelBn : entity.label}
                  <Badge variant="secondary" className="ml-1">
                    {getFieldsByEntity(entity.value).length}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {ENTITY_TYPES.map(entity => (
            <TabsContent key={entity.value} value={entity.value} className="space-y-4">
              {getFieldsByEntity(entity.value).length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    {language === 'bn' 
                      ? `এই ${entity.labelBn}-এর জন্য কোনো কাস্টম ফিল্ড নেই` 
                      : `No custom fields for ${entity.label}s yet`}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {getFieldsByEntity(entity.value).map(field => (
                    <Card key={field.id} className={!field.is_active ? 'opacity-60' : ''}>
                      <CardHeader className="flex flex-row items-center justify-between py-3">
                        <div className="flex items-center gap-4">
                          <div>
                            <CardTitle className="text-base">
                              {language === 'bn' ? field.field_label_bn || field.field_label_en : field.field_label_en}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {field.field_key} • {field.field_type}
                              {field.is_required && <Badge variant="destructive" className="ml-2">Required</Badge>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(field)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteField(field)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingField?.id 
                  ? (language === 'bn' ? 'ফিল্ড এডিট করুন' : 'Edit Field')
                  : (language === 'bn' ? 'নতুন ফিল্ড' : 'New Field')}
              </DialogTitle>
            </DialogHeader>

            {editingField && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Field Key</Label>
                  <Input
                    placeholder="e.g., company_size"
                    value={editingField.field_key || ''}
                    onChange={(e) => setEditingField({ 
                      ...editingField, 
                      field_key: e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
                    })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Label (English)</Label>
                    <Input
                      value={editingField.field_label_en || ''}
                      onChange={(e) => setEditingField({ ...editingField, field_label_en: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label (বাংলা)</Label>
                    <Input
                      value={editingField.field_label_bn || ''}
                      onChange={(e) => setEditingField({ ...editingField, field_label_bn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Field Type</Label>
                  <Select
                    value={editingField.field_type || 'text'}
                    onValueChange={(value) => setEditingField({ ...editingField, field_type: value as CustomFieldType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Value</Label>
                  <Input
                    value={editingField.default_value || ''}
                    onChange={(e) => setEditingField({ ...editingField, default_value: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingField.is_required || false}
                      onCheckedChange={(checked) => setEditingField({ ...editingField, is_required: checked })}
                    />
                    <Label>{language === 'bn' ? 'বাধ্যতামূলক' : 'Required'}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingField.is_active !== false}
                      onCheckedChange={(checked) => setEditingField({ ...editingField, is_active: checked })}
                    />
                    <Label>{language === 'bn' ? 'সক্রিয়' : 'Active'}</Label>
                  </div>
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

        {/* Delete Confirm */}
        <DeleteConfirmDialog
          open={!!deleteField}
          onOpenChange={() => setDeleteField(null)}
          onConfirm={handleDelete}
          title={language === 'bn' ? 'ফিল্ড মুছুন' : 'Delete Field'}
          description={language === 'bn' 
            ? 'আপনি কি এই ফিল্ড মুছে ফেলতে চান? এই ফিল্ডের সব ডেটা হারিয়ে যাবে।' 
            : 'Are you sure you want to delete this field? All data for this field will be lost.'}
        />
      </div>
    </AdminLayout>
  );
}
