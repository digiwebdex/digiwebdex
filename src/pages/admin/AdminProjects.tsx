import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column, StatusBadge } from '@/components/admin/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Eye, ListChecks, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';
import { MilestoneFormModal, MilestoneList } from '@/components/admin/milestones';
import { milestoneService, MilestoneStats } from '@/services/milestone';

type Project = Database['public']['Tables']['projects']['Row'];
type Milestone = Database['public']['Tables']['milestones']['Row'];
const PROJECT_STATUSES = [
  { value: 'pending', label_en: 'Pending', label_bn: 'বিবেচনাধীন' },
  { value: 'in_progress', label_en: 'In Progress', label_bn: 'চলমান' },
  { value: 'review', label_en: 'In Review', label_bn: 'রিভিউতে' },
  { value: 'completed', label_en: 'Completed', label_bn: 'সম্পন্ন' },
  { value: 'on_hold', label_en: 'On Hold', label_bn: 'স্থগিত' },
  { value: 'cancelled', label_en: 'Cancelled', label_bn: 'বাতিল' },
];

export default function AdminProjects() {
  const { language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Milestone states
  const [milestoneFormOpen, setMilestoneFormOpen] = useState(false);
  const [milestonesOpen, setMilestonesOpen] = useState(false);
  const [projectMilestones, setProjectMilestones] = useState<Milestone[]>([]);
  const [milestoneStats, setMilestoneStats] = useState<MilestoneStats | null>(null);

  useEffect(() => {
    fetchProjects();
    fetchMilestoneStats();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const fetchMilestoneStats = async () => {
    try {
      const stats = await milestoneService.getMilestoneStats();
      setMilestoneStats(stats);
    } catch (error) {
      console.error('Error fetching milestone stats:', error);
    }
  };

  const fetchProjectMilestones = async (projectId: string) => {
    try {
      const milestones = await milestoneService.getProjectMilestones(projectId);
      setProjectMilestones(milestones);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  const handleViewMilestones = (project: Project) => {
    setSelectedProject(project);
    fetchProjectMilestones(project.id);
    setMilestonesOpen(true);
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setNewStatus(project.status);
    setDetailOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) return;
    setSaving(true);

    const updates: Record<string, unknown> = { 
      status: newStatus as Database['public']['Enums']['project_status']
    };
    if (newStatus === 'completed' && selectedProject.status !== 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase.from('projects').update(updates).eq('id', selectedProject.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Success' });
      setDetailOpen(false);
      fetchProjects();
    }
    setSaving(false);
  };

  const getProgress = (project: Project) => {
    if (!project.total_milestones || project.total_milestones === 0) return 0;
    return Math.round(((project.completed_milestones || 0) / project.total_milestones) * 100);
  };

  const columns: Column<Project>[] = [
    {
      key: 'title',
      header: language === 'bn' ? 'প্রজেক্ট' : 'Project',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium">{row.title}</p>
          <p className="text-sm text-muted-foreground line-clamp-1">{row.description || '-'}</p>
        </div>
      ),
    },
    {
      key: 'service_type',
      header: language === 'bn' ? 'টাইপ' : 'Type',
      render: (row) => row.service_type.replace(/_/g, ' '),
    },
    {
      key: 'deadline',
      header: language === 'bn' ? 'ডেডলাইন' : 'Deadline',
      render: (row) => {
        if (!row.deadline) return '-';
        const deadline = new Date(row.deadline);
        const isOverdue = deadline < new Date() && row.status !== 'completed';
        return (
          <span className={isOverdue ? 'text-destructive font-medium' : ''}>
            {format(deadline, 'dd MMM yyyy')}
          </span>
        );
      },
    },
    {
      key: 'progress',
      header: language === 'bn' ? 'অগ্রগতি' : 'Progress',
      render: (row) => {
        const progress = getProgress(row);
        return (
          <div className="flex items-center gap-2 min-w-[100px]">
            <Progress value={progress} className="h-2" />
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
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
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleViewMilestones(row); }} title={language === 'bn' ? 'মাইলস্টোন' : 'Milestones'}>
            <ListChecks className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleViewProject(row); }}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Calculate stats
  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === 'in_progress').length,
    inReview: projects.filter((p) => p.status === 'review').length,
    completed: projects.filter((p) => p.status === 'completed').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{language === 'bn' ? 'প্রজেক্ট ম্যানেজমেন্ট' : 'Projects Management'}</h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'ক্লায়েন্ট প্রজেক্ট ট্র্যাক করুন' : 'Track client projects'}
          </p>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{language === 'bn' ? 'মোট প্রজেক্ট' : 'Total Projects'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{language === 'bn' ? 'চলমান' : 'In Progress'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{stats.inProgress}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{language === 'bn' ? 'রিভিউতে' : 'In Review'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{stats.inReview}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{language === 'bn' ? 'সম্পন্ন' : 'Completed'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{stats.completed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Milestone Stats */}
        {milestoneStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{language === 'bn' ? 'মাইলস্টোন রেভিনিউ' : 'Milestone Revenue'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">৳{milestoneStats.totalMilestoneRevenue.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-yellow-500/20 bg-yellow-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{language === 'bn' ? 'বাকি পেমেন্ট' : 'Pending Payments'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">৳{milestoneStats.pendingPayments.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{milestoneStats.pendingCount} {language === 'bn' ? 'টি মাইলস্টোন' : 'milestones'}</p>
              </CardContent>
            </Card>
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{language === 'bn' ? 'বকেয়া পেমেন্ট' : 'Overdue Payments'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-destructive">৳{milestoneStats.overduePayments.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{milestoneStats.overdueCount} {language === 'bn' ? 'টি মাইলস্টোন' : 'milestones'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{language === 'bn' ? 'সম্পন্ন হার' : 'Completion Rate'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{milestoneStats.completionRate}%</p>
                <Progress value={milestoneStats.completionRate} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            <DataTable
              data={projects}
              columns={columns}
              loading={loading}
              searchKeys={['title', 'description']}
              searchPlaceholder={language === 'bn' ? 'প্রজেক্ট খুঁজুন...' : 'Search projects...'}
              onRowClick={handleViewProject}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedProject?.title}</DialogTitle>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'টাইপ' : 'Type'}</Label>
                  <p className="font-medium">{selectedProject.service_type.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'ডেডলাইন' : 'Deadline'}</Label>
                  <p className="font-medium">{selectedProject.deadline ? format(new Date(selectedProject.deadline), 'dd MMM yyyy') : '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'শুরু' : 'Start'}</Label>
                  <p className="font-medium">{selectedProject.start_date ? format(new Date(selectedProject.start_date), 'dd MMM yyyy') : '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'মাইলস্টোন' : 'Milestones'}</Label>
                  <p className="font-medium">{selectedProject.completed_milestones || 0} / {selectedProject.total_milestones || 0}</p>
                </div>
              </div>

              {selectedProject.description && (
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'বিবরণ' : 'Description'}</Label>
                  <p className="p-3 bg-muted rounded-md">{selectedProject.description}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {language === 'bn' ? s.label_bn : s.label_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </Button>
            <Button onClick={handleUpdateProject} disabled={saving}>
              {saving ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'আপডেট করুন' : 'Update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Milestones Dialog */}
      <Dialog open={milestonesOpen} onOpenChange={setMilestonesOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{language === 'bn' ? 'মাইলস্টোন' : 'Milestones'}</span>
              <Button size="sm" onClick={() => { setMilestonesOpen(false); setMilestoneFormOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" />
                {language === 'bn' ? 'যোগ করুন' : 'Add'}
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedProject && (
            <MilestoneList
              milestones={projectMilestones}
              projectTitle={selectedProject.title}
              onRefresh={() => {
                fetchProjectMilestones(selectedProject.id);
                fetchMilestoneStats();
                fetchProjects();
              }}
              onClose={() => setMilestonesOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Milestone Form Modal */}
      <MilestoneFormModal
        open={milestoneFormOpen}
        onOpenChange={setMilestoneFormOpen}
        projectId={selectedProject?.id}
        onSuccess={() => {
          if (selectedProject) {
            fetchProjectMilestones(selectedProject.id);
          }
          fetchMilestoneStats();
          fetchProjects();
        }}
      />
    </AdminLayout>
  );
}
