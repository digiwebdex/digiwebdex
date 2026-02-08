import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { systemSettingsService, HomepageSection } from '@/services/settings';
import { Loader2, Save, Edit, Eye, EyeOff, GripVertical, Plus } from 'lucide-react';

export default function AdminHomepageCMS() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await systemSettingsService.getHomepageSections();
      setSections(data);
    } catch (error) {
      console.error('Error loading sections:', error);
      toast.error(language === 'bn' ? 'সেকশন লোড করতে সমস্যা হয়েছে' : 'Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section: HomepageSection) => {
    setEditingSection({ ...section });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editingSection) return;

    try {
      setSaving(true);
      await systemSettingsService.updateHomepageSection(editingSection.id, editingSection);
      await loadSections();
      setShowEditModal(false);
      toast.success(language === 'bn' ? 'সেকশন আপডেট হয়েছে' : 'Section updated successfully');
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error(language === 'bn' ? 'সেকশন সংরক্ষণে সমস্যা হয়েছে' : 'Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (section: HomepageSection) => {
    try {
      await systemSettingsService.updateHomepageSection(section.id, { is_active: !section.is_active });
      await loadSections();
      toast.success(language === 'bn' ? 'স্ট্যাটাস আপডেট হয়েছে' : 'Status updated');
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(language === 'bn' ? 'স্ট্যাটাস আপডেটে সমস্যা হয়েছে' : 'Failed to update status');
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
              {language === 'bn' ? 'হোমপেজ কন্টেন্ট ম্যানেজার' : 'Homepage Content Manager'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'bn' ? 'হোমপেজের সব সেকশন এডিট করুন' : 'Edit all homepage sections'}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {sections.map((section) => (
            <Card key={section.id} className={!section.is_active ? 'opacity-60' : ''}>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <div>
                    <CardTitle className="text-lg">
                      {language === 'bn' ? section.title_bn || section.section_key : section.title_en || section.section_key}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Key: {section.section_key}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActive(section)}
                  >
                    {section.is_active ? (
                      <Eye className="h-4 w-4 text-primary" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(section)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {language === 'bn' ? 'এডিট' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? section.subtitle_bn : section.subtitle_en}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {language === 'bn' ? 'সেকশন এডিট করুন' : 'Edit Section'}: {editingSection?.section_key}
              </DialogTitle>
            </DialogHeader>

            {editingSection && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title (English)</Label>
                    <Input
                      value={editingSection.title_en || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, title_en: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (বাংলা)</Label>
                    <Input
                      value={editingSection.title_bn || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, title_bn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subtitle (English)</Label>
                    <Input
                      value={editingSection.subtitle_en || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, subtitle_en: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle (বাংলা)</Label>
                    <Input
                      value={editingSection.subtitle_bn || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, subtitle_bn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Content (English)</Label>
                    <Textarea
                      rows={4}
                      value={editingSection.content_en || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, content_en: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Content (বাংলা)</Label>
                    <Textarea
                      rows={4}
                      value={editingSection.content_bn || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, content_bn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CTA Text (English)</Label>
                    <Input
                      value={editingSection.cta_text_en || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, cta_text_en: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA Text (বাংলা)</Label>
                    <Input
                      value={editingSection.cta_text_bn || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, cta_text_bn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CTA Link</Label>
                    <Input
                      value={editingSection.cta_link || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, cta_link: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input
                      value={editingSection.image_url || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, image_url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingSection.is_active}
                    onCheckedChange={(checked) => setEditingSection({ ...editingSection, is_active: checked })}
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
