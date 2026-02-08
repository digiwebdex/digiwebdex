import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { milestoneService } from '@/services/milestone';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  MoreVertical, 
  FileText, 
  Send, 
  Trash2,
  DollarSign
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Milestone = Database['public']['Tables']['milestones']['Row'];

interface MilestoneListProps {
  milestones: Milestone[];
  projectTitle: string;
  onRefresh: () => void;
  onClose?: () => void;
}

export function MilestoneList({ milestones, projectTitle, onRefresh }: MilestoneListProps) {
  const { language } = useLanguage();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getMilestoneStatus = (milestone: Milestone) => {
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

  const handleMarkAsPaid = async (milestoneId: string) => {
    setActionLoading(milestoneId);
    try {
      await milestoneService.markAsPaid(milestoneId);
      toast({ title: language === 'bn' ? 'পরিশোধিত হিসেবে চিহ্নিত করা হয়েছে' : 'Marked as paid' });
      onRefresh();
    } catch (error) {
      toast({ title: language === 'bn' ? 'ত্রুটি হয়েছে' : 'Error occurred', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateInvoice = async (milestoneId: string) => {
    setActionLoading(milestoneId);
    try {
      await milestoneService.generateMilestoneInvoice(milestoneId);
      toast({ title: language === 'bn' ? 'ইনভয়েস তৈরি হয়েছে' : 'Invoice generated' });
      onRefresh();
    } catch (error) {
      toast({ title: language === 'bn' ? 'ত্রুটি হয়েছে' : 'Error occurred', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (milestoneId: string) => {
    if (!confirm(language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) return;
    
    setActionLoading(milestoneId);
    try {
      await milestoneService.deleteMilestone(milestoneId);
      toast({ title: language === 'bn' ? 'মাইলস্টোন মুছে ফেলা হয়েছে' : 'Milestone deleted' });
      onRefresh();
    } catch (error) {
      toast({ title: language === 'bn' ? 'ত্রুটি হয়েছে' : 'Error occurred', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const totalAmount = milestones.reduce((sum, m) => sum + Number(m.amount || 0), 0);
  const paidAmount = milestones.filter(m => m.is_paid).reduce((sum, m) => sum + Number(m.amount || 0), 0);
  const progress = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{projectTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {language === 'bn' ? 'অগ্রগতি' : 'Progress'}
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-sm">
            <span>
              {language === 'bn' ? 'পরিশোধিত:' : 'Paid:'}{' '}
              <span className="font-medium text-green-600">৳{paidAmount.toLocaleString()}</span>
            </span>
            <span>
              {language === 'bn' ? 'মোট:' : 'Total:'}{' '}
              <span className="font-medium">৳{totalAmount.toLocaleString()}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <div className="space-y-3">
        {milestones.map((milestone, index) => {
          const status = getMilestoneStatus(milestone);
          const isLoading = actionLoading === milestone.id;

          return (
            <div
              key={milestone.id}
              className={`p-4 rounded-lg border transition-colors ${
                status === 'paid' 
                  ? 'bg-primary/5 border-primary/20' 
                  : status === 'overdue'
                  ? 'bg-destructive/5 border-destructive/20'
                  : 'bg-card border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                    <span className="font-medium truncate">{milestone.title}</span>
                  </div>
                  
                  {milestone.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                      {milestone.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-semibold">৳{Number(milestone.amount || 0).toLocaleString()}</span>
                    
                    {milestone.due_date && (
                      <span className="text-muted-foreground">
                        {language === 'bn' ? 'নির্ধারিত:' : 'Due:'}{' '}
                        {format(new Date(milestone.due_date), 'dd MMM yyyy')}
                      </span>
                    )}

                    {getStatusBadge(status)}

                    {milestone.invoice_id && (
                      <Badge variant="outline" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        {language === 'bn' ? 'ইনভয়েস আছে' : 'Has Invoice'}
                      </Badge>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isLoading}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!milestone.is_paid && (
                      <DropdownMenuItem onClick={() => handleMarkAsPaid(milestone.id)}>
                        <DollarSign className="h-4 w-4 mr-2" />
                        {language === 'bn' ? 'পরিশোধিত করুন' : 'Mark as Paid'}
                      </DropdownMenuItem>
                    )}
                    {!milestone.invoice_id && (
                      <DropdownMenuItem onClick={() => handleGenerateInvoice(milestone.id)}>
                        <FileText className="h-4 w-4 mr-2" />
                        {language === 'bn' ? 'ইনভয়েস তৈরি' : 'Generate Invoice'}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleDelete(milestone.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      {language === 'bn' ? 'মুছুন' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}

        {milestones.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {language === 'bn' ? 'কোনো মাইলস্টোন নেই' : 'No milestones yet'}
          </div>
        )}
      </div>
    </div>
  );
}
