import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { FormModal } from '@/components/admin/common/FormModal';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { milestoneService, AutoSplitConfig } from '@/services/milestone';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface MilestoneFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  onSuccess: () => void;
}

interface MilestoneEntry {
  title: string;
  amount: number;
  dueDate: string;
  description: string;
}

const DEFAULT_SPLIT_TEMPLATES = [
  { label: '50-50', percentages: [50, 50], titles: ['Advance Payment', 'Final Delivery'] },
  { label: '40-30-30', percentages: [40, 30, 30], titles: ['Advance Payment', 'Development', 'Final Delivery'] },
  { label: '30-30-20-20', percentages: [30, 30, 20, 20], titles: ['Advance', 'Development', 'Testing', 'Delivery'] },
  { label: 'Equal Split', percentages: [], titles: [] },
];

export function MilestoneFormModal({ open, onOpenChange, projectId, onSuccess }: MilestoneFormModalProps) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [mode, setMode] = useState<'manual' | 'auto'>('auto');
  const [splitTemplate, setSplitTemplate] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [milestoneCount, setMilestoneCount] = useState(3);
  const [milestones, setMilestones] = useState<MilestoneEntry[]>([
    { title: '', amount: 0, dueDate: '', description: '' }
  ]);

  useEffect(() => {
    if (open) {
      fetchProjects();
      if (projectId) {
        setSelectedProject(projectId);
      }
    }
  }, [open, projectId]);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false });
    setProjects(data || []);
  };

  const handleSplitTemplateChange = (template: string) => {
    setSplitTemplate(template);
    const selected = DEFAULT_SPLIT_TEMPLATES.find(t => t.label === template);
    if (selected) {
      if (selected.percentages.length > 0) {
        const newMilestones = selected.percentages.map((p, i) => ({
          title: selected.titles[i] || `Milestone ${i + 1}`,
          amount: Math.round((p / 100) * totalAmount),
          dueDate: '',
          description: '',
        }));
        setMilestones(newMilestones);
        setMilestoneCount(newMilestones.length);
      } else {
        // Equal split
        const equalAmount = Math.floor(totalAmount / milestoneCount);
        const newMilestones = Array(milestoneCount).fill(null).map((_, i) => ({
          title: `Milestone ${i + 1}`,
          amount: equalAmount,
          dueDate: '',
          description: '',
        }));
        setMilestones(newMilestones);
      }
    }
  };

  const handleTotalAmountChange = (value: number) => {
    setTotalAmount(value);
    if (splitTemplate) {
      handleSplitTemplateChange(splitTemplate);
    }
  };

  const handleMilestoneCountChange = (count: number) => {
    setMilestoneCount(count);
    if (splitTemplate === 'Equal Split') {
      const equalAmount = Math.floor(totalAmount / count);
      const newMilestones = Array(count).fill(null).map((_, i) => ({
        title: `Milestone ${i + 1}`,
        amount: equalAmount,
        dueDate: '',
        description: '',
      }));
      setMilestones(newMilestones);
    }
  };

  const addMilestone = () => {
    setMilestones([...milestones, { title: '', amount: 0, dueDate: '', description: '' }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof MilestoneEntry, value: string | number) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleSubmit = async () => {
    if (!selectedProject) {
      toast({ title: language === 'bn' ? 'প্রজেক্ট সিলেক্ট করুন' : 'Select a project', variant: 'destructive' });
      return;
    }

    if (milestones.length === 0 || milestones.every(m => !m.title)) {
      toast({ title: language === 'bn' ? 'অন্তত একটি মাইলস্টোন যোগ করুন' : 'Add at least one milestone', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'auto' && splitTemplate) {
        const config: AutoSplitConfig = {
          projectId: selectedProject,
          totalAmount,
          splitType: splitTemplate === 'Equal Split' ? 'equal' : 'percentage',
          milestoneCount,
          percentages: milestones.map(m => m.amount),
          titles: milestones.map(m => m.title),
          dueDates: milestones.map(m => m.dueDate || null).filter(Boolean) as string[],
        };
        await milestoneService.autoSplitMilestones(config);
      } else {
        // Manual mode - create each milestone
        for (let i = 0; i < milestones.length; i++) {
          const m = milestones[i];
          if (m.title) {
            await milestoneService.createMilestone({
              project_id: selectedProject,
              title: m.title,
              amount: m.amount,
              due_date: m.dueDate || null,
              description: m.description || null,
              sort_order: i,
              is_paid: false,
            });
          }
        }
      }

      toast({ title: language === 'bn' ? 'সফল!' : 'Success!' });
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating milestones:', error);
      toast({ 
        title: language === 'bn' ? 'ত্রুটি হয়েছে' : 'An error occurred', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProject(projectId || '');
    setMode('auto');
    setSplitTemplate('');
    setTotalAmount(0);
    setMilestoneCount(3);
    setMilestones([{ title: '', amount: 0, dueDate: '', description: '' }]);
  };

  const calculatedTotal = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={language === 'bn' ? 'মাইলস্টোন তৈরি করুন' : 'Create Milestones'}
      onSubmit={handleSubmit}
      loading={loading}
      size="lg"
    >
      <div className="space-y-6">
        {/* Project Selection */}
        <div className="space-y-2">
          <Label>{language === 'bn' ? 'প্রজেক্ট সিলেক্ট করুন' : 'Select Project'}</Label>
          <Select value={selectedProject} onValueChange={setSelectedProject} disabled={!!projectId}>
            <SelectTrigger>
              <SelectValue placeholder={language === 'bn' ? 'প্রজেক্ট বাছুন...' : 'Choose project...'} />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mode Selection */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant={mode === 'auto' ? 'default' : 'outline'}
            onClick={() => setMode('auto')}
            className="flex-1"
          >
            {language === 'bn' ? 'অটো স্প্লিট' : 'Auto Split'}
          </Button>
          <Button
            type="button"
            variant={mode === 'manual' ? 'default' : 'outline'}
            onClick={() => setMode('manual')}
            className="flex-1"
          >
            {language === 'bn' ? 'ম্যানুয়াল' : 'Manual'}
          </Button>
        </div>

        {mode === 'auto' && (
          <>
            {/* Total Amount */}
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'মোট পরিমাণ (৳)' : 'Total Amount (৳)'}</Label>
              <Input
                type="number"
                value={totalAmount}
                onChange={(e) => handleTotalAmountChange(Number(e.target.value))}
                placeholder="0"
              />
            </div>

            {/* Split Template */}
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'স্প্লিট টেমপ্লেট' : 'Split Template'}</Label>
              <Select value={splitTemplate} onValueChange={handleSplitTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'bn' ? 'টেমপ্লেট বাছুন...' : 'Choose template...'} />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_SPLIT_TEMPLATES.map((t) => (
                    <SelectItem key={t.label} value={t.label}>
                      {t.label} {t.percentages.length > 0 && `(${t.percentages.join('%-')}%)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {splitTemplate === 'Equal Split' && (
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'মাইলস্টোন সংখ্যা' : 'Number of Milestones'}</Label>
                <Input
                  type="number"
                  min={2}
                  max={10}
                  value={milestoneCount}
                  onChange={(e) => handleMilestoneCountChange(Number(e.target.value))}
                />
              </div>
            )}
          </>
        )}

        {/* Milestones List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">
              {language === 'bn' ? 'মাইলস্টোন তালিকা' : 'Milestones List'}
            </Label>
            {mode === 'manual' && (
              <Button type="button" size="sm" variant="outline" onClick={addMilestone}>
                <Plus className="h-4 w-4 mr-1" />
                {language === 'bn' ? 'যোগ করুন' : 'Add'}
              </Button>
            )}
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {milestones.map((milestone, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {language === 'bn' ? `মাইলস্টোন ${index + 1}` : `Milestone ${index + 1}`}
                  </span>
                  {milestones.length > 1 && mode === 'manual' && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive"
                      onClick={() => removeMilestone(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Input
                      placeholder={language === 'bn' ? 'শিরোনাম' : 'Title'}
                      value={milestone.title}
                      onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                    />
                  </div>
                  <Input
                    type="number"
                    placeholder={language === 'bn' ? 'পরিমাণ (৳)' : 'Amount (৳)'}
                    value={milestone.amount || ''}
                    onChange={(e) => updateMilestone(index, 'amount', Number(e.target.value))}
                  />
                  <Input
                    type="date"
                    value={milestone.dueDate}
                    onChange={(e) => updateMilestone(index, 'dueDate', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
            <span className="font-medium">{language === 'bn' ? 'মোট:' : 'Total:'}</span>
            <span className="text-lg font-bold">৳{calculatedTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </FormModal>
  );
}
