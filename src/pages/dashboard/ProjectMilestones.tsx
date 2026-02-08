import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { milestoneService, MilestoneWithProject } from '@/services/milestone';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  CreditCard,
  FileText,
  Download,
  FolderKanban
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function ProjectMilestones() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<MilestoneWithProject[]>([]);
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    completionRate: 0,
  });

  useEffect(() => {
    if (user) {
      fetchMilestones();
    }
  }, [user]);

  const fetchMilestones = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await milestoneService.getUserMilestones(user.id);
      setMilestones(data);
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const paid = data.filter(m => m.is_paid);
      const pending = data.filter(m => !m.is_paid && (!m.due_date || m.due_date >= today));
      const overdue = data.filter(m => !m.is_paid && m.due_date && m.due_date < today);
      
      setStats({
        totalPaid: paid.reduce((sum, m) => sum + Number(m.amount || 0), 0),
        totalPending: pending.reduce((sum, m) => sum + Number(m.amount || 0), 0),
        totalOverdue: overdue.reduce((sum, m) => sum + Number(m.amount || 0), 0),
        completionRate: data.length > 0 ? Math.round((paid.length / data.length) * 100) : 0,
      });
    } catch (error) {
      console.error('Error fetching milestones:', error);
      toast({ title: language === 'bn' ? 'ত্রুটি হয়েছে' : 'Error occurred', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getMilestoneStatus = (milestone: MilestoneWithProject) => {
    if (milestone.is_paid) return 'paid';
    if (milestone.due_date && new Date(milestone.due_date) < new Date()) return 'overdue';
    return 'pending';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            {language === 'bn' ? 'পরিশোধিত' : 'Paid'}
          </Badge>
        );
      case 'overdue':
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {language === 'bn' ? 'বকেয়া' : 'Overdue'}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground border-muted">
            <Clock className="h-3 w-3 mr-1" />
            {language === 'bn' ? 'বাকি' : 'Pending'}
          </Badge>
        );
    }
  };

  // Group milestones by project
  const groupedMilestones = milestones.reduce((acc, milestone) => {
    const projectId = milestone.project?.id || 'unknown';
    if (!acc[projectId]) {
      acc[projectId] = {
        project: milestone.project,
        milestones: [],
      };
    }
    acc[projectId].milestones.push(milestone);
    return acc;
  }, {} as Record<string, { project: MilestoneWithProject['project']; milestones: MilestoneWithProject[] }>);

  const statCards = [
    {
      title: language === 'bn' ? 'পরিশোধিত' : 'Paid',
      value: `৳${stats.totalPaid.toLocaleString()}`,
      icon: CheckCircle,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: language === 'bn' ? 'বাকি আছে' : 'Pending',
      value: `৳${stats.totalPending.toLocaleString()}`,
      icon: Clock,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
    {
      title: language === 'bn' ? 'বকেয়া' : 'Overdue',
      value: `৳${stats.totalOverdue.toLocaleString()}`,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: language === 'bn' ? 'সম্পন্ন হার' : 'Completion',
      value: `${stats.completionRate}%`,
      icon: FolderKanban,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'bn' ? 'প্রজেক্ট মাইলস্টোন' : 'Project Milestones'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn' 
              ? 'আপনার প্রজেক্টের পেমেন্ট ট্র্যাক করুন'
              : 'Track your project payments'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Milestones by Project */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : Object.keys(groupedMilestones).length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {language === 'bn' ? 'কোনো মাইলস্টোন নেই' : 'No Milestones Yet'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'bn' 
                  ? 'আপনার প্রজেক্টে মাইলস্টোন যোগ হলে এখানে দেখাবে'
                  : 'Milestones will appear here once added to your projects'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.values(groupedMilestones).map(({ project, milestones: projectMilestones }) => {
              const totalAmount = projectMilestones.reduce((sum, m) => sum + Number(m.amount || 0), 0);
              const paidAmount = projectMilestones.filter(m => m.is_paid).reduce((sum, m) => sum + Number(m.amount || 0), 0);
              const progress = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

              return (
                <Card key={project?.id || 'unknown'} className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {project?.title || 'Unknown Project'}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {language === 'bn' ? 'পরিশোধিত:' : 'Paid:'} ৳{paidAmount.toLocaleString()} / ৳{totalAmount.toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{progress}%</div>
                        <div className="text-sm text-muted-foreground">
                          {language === 'bn' ? 'সম্পন্ন' : 'Complete'}
                        </div>
                      </div>
                    </div>
                    <Progress value={progress} className="h-2 mt-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {projectMilestones.map((milestone, index) => {
                        const status = getMilestoneStatus(milestone);
                        
                        return (
                          <div
                            key={milestone.id}
                            className={`p-4 rounded-lg border transition-colors ${
                              status === 'paid' 
                                ? 'bg-primary/5 border-primary/20' 
                                : status === 'overdue'
                                ? 'bg-destructive/5 border-destructive/20'
                                : 'bg-muted/30 border-border'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs text-muted-foreground">#{index + 1}</span>
                                  <span className="font-medium">{milestone.title}</span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                  <span className="font-semibold">
                                    ৳{Number(milestone.amount || 0).toLocaleString()}
                                  </span>
                                  
                                  {milestone.due_date && (
                                    <span className="text-muted-foreground">
                                      {language === 'bn' ? 'নির্ধারিত:' : 'Due:'}{' '}
                                      {format(new Date(milestone.due_date), 'dd MMM yyyy')}
                                    </span>
                                  )}

                                  {getStatusBadge(status)}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {!milestone.is_paid && (
                                  <Link to={`/${language}/dashboard/invoices`}>
                                    <Button size="sm" className="gap-2">
                                      <CreditCard className="h-4 w-4" />
                                      {language === 'bn' ? 'পে করুন' : 'Pay Now'}
                                    </Button>
                                  </Link>
                                )}
                                {milestone.invoice_id && (
                                  <Link to={`/${language}/dashboard/invoices`}>
                                    <Button size="sm" variant="outline" className="gap-2">
                                      <FileText className="h-4 w-4" />
                                      {language === 'bn' ? 'ইনভয়েস' : 'Invoice'}
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
