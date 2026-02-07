import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column, StatusBadge, DeleteConfirmDialog, FormModal } from '@/components/admin/common';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2, Globe, FileText, MapPin } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type LandingPage = Database['public']['Tables']['landing_pages']['Row'];
type LocationPage = Database['public']['Tables']['location_pages']['Row'];

export default function AdminSEO() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('landing');
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [locationPages, setLocationPages] = useState<LocationPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LandingPage | LocationPage | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title_en: '',
    title_bn: '',
    slug: '',
    meta_title_en: '',
    meta_title_bn: '',
    meta_description_en: '',
    meta_description_bn: '',
    content_en: '',
    content_bn: '',
    is_published: true,
    is_indexed: true,
    priority: 0.7,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [landingRes, locationRes] = await Promise.all([
      supabase.from('landing_pages').select('*').order('created_at', { ascending: false }),
      supabase.from('location_pages').select('*').order('created_at', { ascending: false }),
    ]);

    if (landingRes.data) setLandingPages(landingRes.data);
    if (locationRes.data) setLocationPages(locationRes.data);
    setLoading(false);
  };

  const handleOpenModal = (item?: LandingPage | LocationPage) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        title_en: item.title_en,
        title_bn: item.title_bn,
        slug: item.slug,
        meta_title_en: item.meta_title_en || '',
        meta_title_bn: item.meta_title_bn || '',
        meta_description_en: item.meta_description_en || '',
        meta_description_bn: item.meta_description_bn || '',
        content_en: item.content_en || '',
        content_bn: item.content_bn || '',
        is_published: item.is_published ?? true,
        is_indexed: item.is_indexed ?? true,
        priority: item.priority || 0.7,
      });
    } else {
      setSelectedItem(null);
      setFormData({
        title_en: '',
        title_bn: '',
        slug: '',
        meta_title_en: '',
        meta_title_bn: '',
        meta_description_en: '',
        meta_description_bn: '',
        content_en: '',
        content_bn: '',
        is_published: true,
        is_indexed: true,
        priority: 0.7,
      });
    }
    setModalOpen(true);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSave = async () => {
    if (!formData.title_en || !formData.title_bn || !formData.slug) {
      toast({ title: 'Error', description: 'Title and slug are required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const table = activeTab === 'landing' ? 'landing_pages' : 'location_pages';
    
    const payload: Record<string, unknown> = {
      title_en: formData.title_en,
      title_bn: formData.title_bn,
      slug: formData.slug,
      meta_title_en: formData.meta_title_en || null,
      meta_title_bn: formData.meta_title_bn || null,
      meta_description_en: formData.meta_description_en || null,
      meta_description_bn: formData.meta_description_bn || null,
      content_en: formData.content_en || null,
      content_bn: formData.content_bn || null,
      is_published: formData.is_published,
      is_indexed: formData.is_indexed,
      priority: formData.priority,
    };

    if (activeTab === 'location') {
      payload.location_name_en = formData.title_en;
      payload.location_name_bn = formData.title_bn;
    }

    const { error } = selectedItem
      ? await supabase.from(table).update(payload as never).eq('id', selectedItem.id)
      : await supabase.from(table).insert(payload as never);

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
    if (!selectedItem) return;
    setSaving(true);
    const table = activeTab === 'landing' ? 'landing_pages' : 'location_pages';
    const { error } = await supabase.from(table).delete().eq('id', selectedItem.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Success' });
      setDeleteDialogOpen(false);
      fetchData();
    }
    setSaving(false);
  };

  const landingColumns: Column<LandingPage>[] = [
    {
      key: 'title',
      header: language === 'bn' ? 'শিরোনাম' : 'Title',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium">{language === 'bn' ? row.title_bn : row.title_en}</p>
          <p className="text-sm text-muted-foreground">/{row.slug}</p>
        </div>
      ),
    },
    {
      key: 'page_type',
      header: language === 'bn' ? 'টাইপ' : 'Type',
      render: (row) => row.page_type,
    },
    {
      key: 'status',
      header: language === 'bn' ? 'স্ট্যাটাস' : 'Status',
      render: (row) => <StatusBadge status={row.is_published ? 'published' : 'draft'} />,
    },
    {
      key: 'indexed',
      header: language === 'bn' ? 'ইনডেক্সড' : 'Indexed',
      render: (row) => row.is_indexed ? '✓' : '✗',
    },
    {
      key: 'views_count',
      header: language === 'bn' ? 'ভিউ' : 'Views',
      sortable: true,
      render: (row) => row.views_count || 0,
    },
    {
      key: 'actions',
      header: language === 'bn' ? 'অ্যাকশন' : 'Actions',
      render: (row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button size="icon" variant="ghost" onClick={() => handleOpenModal(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive"
            onClick={() => {
              setSelectedItem(row);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const locationColumns: Column<LocationPage>[] = [
    {
      key: 'title',
      header: language === 'bn' ? 'লোকেশন' : 'Location',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium">{language === 'bn' ? row.location_name_bn : row.location_name_en}</p>
          <p className="text-sm text-muted-foreground">/{row.slug}</p>
        </div>
      ),
    },
    {
      key: 'division',
      header: language === 'bn' ? 'বিভাগ' : 'Division',
      render: (row) => row.division || '-',
    },
    {
      key: 'district',
      header: language === 'bn' ? 'জেলা' : 'District',
      render: (row) => row.district || '-',
    },
    {
      key: 'status',
      header: language === 'bn' ? 'স্ট্যাটাস' : 'Status',
      render: (row) => <StatusBadge status={row.is_published ? 'published' : 'draft'} />,
    },
    {
      key: 'actions',
      header: language === 'bn' ? 'অ্যাকশন' : 'Actions',
      render: (row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button size="icon" variant="ghost" onClick={() => { setActiveTab('location'); handleOpenModal(row); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive"
            onClick={() => {
              setActiveTab('location');
              setSelectedItem(row);
              setDeleteDialogOpen(true);
            }}
          >
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
            <h1 className="text-3xl font-bold">{language === 'bn' ? 'SEO ম্যানেজমেন্ট' : 'SEO Management'}</h1>
            <p className="text-muted-foreground">
              {language === 'bn' ? 'ল্যান্ডিং পেজ এবং লোকেশন পেজ পরিচালনা করুন' : 'Manage landing pages and location pages'}
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'bn' ? 'নতুন পেজ' : 'New Page'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="landing" className="gap-2">
              <Globe className="h-4 w-4" />
              {language === 'bn' ? 'ল্যান্ডিং পেজ' : 'Landing Pages'}
            </TabsTrigger>
            <TabsTrigger value="location" className="gap-2">
              <MapPin className="h-4 w-4" />
              {language === 'bn' ? 'লোকেশন পেজ' : 'Location Pages'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="landing">
            <Card>
              <CardContent className="pt-6">
                <DataTable
                  data={landingPages}
                  columns={landingColumns}
                  loading={loading}
                  searchKeys={['title_en', 'title_bn', 'slug']}
                  searchPlaceholder={language === 'bn' ? 'পেজ খুঁজুন...' : 'Search pages...'}
                  onRowClick={handleOpenModal}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location">
            <Card>
              <CardContent className="pt-6">
                <DataTable
                  data={locationPages}
                  columns={locationColumns}
                  loading={loading}
                  searchKeys={['location_name_en', 'location_name_bn', 'slug']}
                  searchPlaceholder={language === 'bn' ? 'লোকেশন খুঁজুন...' : 'Search locations...'}
                  onRowClick={(row) => { setActiveTab('location'); handleOpenModal(row); }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={selectedItem ? (language === 'bn' ? 'পেজ সম্পাদনা' : 'Edit Page') : (language === 'bn' ? 'নতুন পেজ' : 'New Page')}
        onSubmit={handleSave}
        loading={saving}
        size="lg"
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'} *</Label>
              <Input
                value={formData.title_en}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    title_en: e.target.value,
                    slug: !selectedItem ? generateSlug(e.target.value) : formData.slug,
                  });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (Bengali)'} *</Label>
              <Input value={formData.title_bn} onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'প্রায়োরিটি' : 'Priority'}</Label>
              <Input 
                type="number" 
                step="0.1" 
                min="0" 
                max="1" 
                value={formData.priority} 
                onChange={(e) => setFormData({ ...formData, priority: parseFloat(e.target.value) || 0.7 })} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'মেটা টাইটেল (ইংরেজি)' : 'Meta Title (English)'}</Label>
              <Input value={formData.meta_title_en} onChange={(e) => setFormData({ ...formData, meta_title_en: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'মেটা টাইটেল (বাংলা)' : 'Meta Title (Bengali)'}</Label>
              <Input value={formData.meta_title_bn} onChange={(e) => setFormData({ ...formData, meta_title_bn: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'মেটা ডেসক্রিপশন (ইংরেজি)' : 'Meta Description (English)'}</Label>
              <Textarea value={formData.meta_description_en} onChange={(e) => setFormData({ ...formData, meta_description_en: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'মেটা ডেসক্রিপশন (বাংলা)' : 'Meta Description (Bengali)'}</Label>
              <Textarea value={formData.meta_description_bn} onChange={(e) => setFormData({ ...formData, meta_description_bn: e.target.value })} rows={2} />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={formData.is_published} onCheckedChange={(c) => setFormData({ ...formData, is_published: c })} />
              <Label>{language === 'bn' ? 'প্রকাশিত' : 'Published'}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.is_indexed} onCheckedChange={(c) => setFormData({ ...formData, is_indexed: c })} />
              <Label>{language === 'bn' ? 'ইনডেক্সড' : 'Indexed'}</Label>
            </div>
          </div>
        </div>
      </FormModal>

      <DeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} loading={saving} />
    </AdminLayout>
  );
}
