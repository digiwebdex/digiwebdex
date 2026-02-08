import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Milestone = Database['public']['Tables']['milestones']['Row'];
type MilestoneInsert = Database['public']['Tables']['milestones']['Insert'];
type Project = Database['public']['Tables']['projects']['Row'];

export interface MilestoneWithProject extends Milestone {
  project?: {
    id: string;
    title: string;
    user_id: string;
    status: string;
    order_id?: string | null;
  };
}

export interface MilestoneStats {
  totalMilestoneRevenue: number;
  pendingPayments: number;
  overduePayments: number;
  completionRate: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}

export interface AutoSplitConfig {
  projectId: string;
  totalAmount: number;
  splitType: 'equal' | 'percentage' | 'custom';
  milestoneCount?: number;
  percentages?: number[];
  titles?: string[];
  dueDates?: string[];
}

class MilestoneService {
  // Fetch milestones for a project
  async getProjectMilestones(projectId: string): Promise<Milestone[]> {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Fetch all milestones (admin)
  async getAllMilestones(): Promise<MilestoneWithProject[]> {
    const { data, error } = await supabase
      .from('milestones')
      .select(`
        *,
        project:projects(id, title, user_id, status)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as MilestoneWithProject[];
  }

  // Fetch user's milestones (client dashboard)
  async getUserMilestones(userId: string): Promise<MilestoneWithProject[]> {
    const { data, error } = await supabase
      .from('milestones')
      .select(`
        *,
        project:projects!inner(id, title, user_id, status)
      `)
      .order('due_date', { ascending: true });

    if (error) throw error;
    
    // Filter by user_id from project
    return (data as MilestoneWithProject[]).filter(
      m => m.project?.user_id === userId
    );
  }

  // Create a single milestone
  async createMilestone(milestone: MilestoneInsert): Promise<Milestone> {
    const { data, error } = await supabase
      .from('milestones')
      .insert(milestone)
      .select()
      .single();

    if (error) throw error;
    
    // Update project milestone count
    await this.updateProjectMilestoneCount(milestone.project_id);
    
    return data;
  }

  // Auto-split milestones based on configuration
  async autoSplitMilestones(config: AutoSplitConfig): Promise<Milestone[]> {
    const { projectId, totalAmount, splitType, milestoneCount = 3, percentages, titles, dueDates } = config;

    let amounts: number[] = [];
    const defaultTitles = [
      'Advance Payment',
      'Development Phase',
      'Testing & Review',
      'Final Delivery',
      'Post-Launch Support'
    ];

    if (splitType === 'equal') {
      const equalAmount = Math.floor(totalAmount / milestoneCount);
      const remainder = totalAmount - (equalAmount * milestoneCount);
      amounts = Array(milestoneCount).fill(equalAmount);
      amounts[amounts.length - 1] += remainder; // Add remainder to last milestone
    } else if (splitType === 'percentage' && percentages) {
      amounts = percentages.map(p => Math.round((p / 100) * totalAmount));
    } else if (splitType === 'custom') {
      // Use provided amounts from percentages field as raw amounts
      amounts = percentages || [];
    }

    const milestones: MilestoneInsert[] = amounts.map((amount, index) => ({
      project_id: projectId,
      title: titles?.[index] || defaultTitles[index] || `Milestone ${index + 1}`,
      amount,
      due_date: dueDates?.[index] || null,
      sort_order: index,
      is_paid: false,
    }));

    const { data, error } = await supabase
      .from('milestones')
      .insert(milestones)
      .select();

    if (error) throw error;

    // Update project milestone count
    await this.updateProjectMilestoneCount(projectId);

    return data || [];
  }

  // Update milestone
  async updateMilestone(id: string, updates: Partial<Milestone>): Promise<Milestone> {
    const { data, error } = await supabase
      .from('milestones')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // If marked as paid/completed, update project progress
    if (updates.is_paid !== undefined || updates.completed_at !== undefined) {
      const milestone = data as Milestone;
      await this.updateProjectProgress(milestone.project_id);
    }

    return data;
  }

  // Mark milestone as paid
  async markAsPaid(milestoneId: string): Promise<Milestone> {
    return this.updateMilestone(milestoneId, {
      is_paid: true,
      completed_at: new Date().toISOString(),
    });
  }

  // Generate invoice for milestone
  async generateMilestoneInvoice(milestoneId: string): Promise<string> {
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select(`
        *,
        project:projects(id, title, user_id, status, order_id)
      `)
      .eq('id', milestoneId)
      .single();

    if (milestoneError) throw milestoneError;

    const milestoneData = milestone as MilestoneWithProject;
    
    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${Date.now().toString().slice(-6)}`;

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        user_id: milestoneData.project?.user_id,
        order_id: milestoneData.project?.order_id,
        subtotal: milestoneData.amount || 0,
        total: milestoneData.amount || 0,
        status: 'unpaid',
        due_date: milestoneData.due_date,
        notes: `Milestone payment for: ${milestoneData.title} (${milestoneData.project?.title || 'Project'})`,
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Link invoice to milestone
    await supabase
      .from('milestones')
      .update({ invoice_id: invoice.id })
      .eq('id', milestoneId);

    return invoice.id;
  }

  // Delete milestone
  async deleteMilestone(id: string): Promise<void> {
    const { data: milestone } = await supabase
      .from('milestones')
      .select('project_id')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', id);

    if (error) throw error;

    if (milestone) {
      await this.updateProjectMilestoneCount(milestone.project_id);
      await this.updateProjectProgress(milestone.project_id);
    }
  }

  // Update project milestone count
  private async updateProjectMilestoneCount(projectId: string): Promise<void> {
    const { count } = await supabase
      .from('milestones')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    await supabase
      .from('projects')
      .update({ total_milestones: count || 0 })
      .eq('id', projectId);
  }

  // Update project progress based on completed milestones
  private async updateProjectProgress(projectId: string): Promise<void> {
    const { count: completedCount } = await supabase
      .from('milestones')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('is_paid', true);

    await supabase
      .from('projects')
      .update({ completed_milestones: completedCount || 0 })
      .eq('id', projectId);
  }

  // Get milestone statistics
  async getMilestoneStats(): Promise<MilestoneStats> {
    const { data: milestones } = await supabase
      .from('milestones')
      .select('amount, is_paid, due_date');

    if (!milestones) {
      return {
        totalMilestoneRevenue: 0,
        pendingPayments: 0,
        overduePayments: 0,
        completionRate: 0,
        paidCount: 0,
        pendingCount: 0,
        overdueCount: 0,
      };
    }

    const today = new Date().toISOString().split('T')[0];
    
    const paid = milestones.filter(m => m.is_paid);
    const pending = milestones.filter(m => !m.is_paid && (!m.due_date || m.due_date >= today));
    const overdue = milestones.filter(m => !m.is_paid && m.due_date && m.due_date < today);

    return {
      totalMilestoneRevenue: paid.reduce((sum, m) => sum + Number(m.amount || 0), 0),
      pendingPayments: pending.reduce((sum, m) => sum + Number(m.amount || 0), 0),
      overduePayments: overdue.reduce((sum, m) => sum + Number(m.amount || 0), 0),
      completionRate: milestones.length > 0 ? Math.round((paid.length / milestones.length) * 100) : 0,
      paidCount: paid.length,
      pendingCount: pending.length,
      overdueCount: overdue.length,
    };
  }

  // Check for overdue milestones and update status
  async checkOverdueMilestones(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('milestones')
      .select('id')
      .eq('is_paid', false)
      .lt('due_date', today);

    return data?.length || 0;
  }

  // Get overdue milestones for notification
  async getOverdueMilestones(): Promise<MilestoneWithProject[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('milestones')
      .select(`
        *,
        project:projects(id, title, user_id, status, order_id)
      `)
      .eq('is_paid', false)
      .lt('due_date', today);

    if (error) throw error;
    return data as MilestoneWithProject[];
  }

  // Get milestones due soon (for reminders)
  async getMilestonesDueSoon(daysAhead: number = 3): Promise<MilestoneWithProject[]> {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const { data, error } = await supabase
      .from('milestones')
      .select(`
        *,
        project:projects(id, title, user_id, status)
      `)
      .eq('is_paid', false)
      .gte('due_date', today.toISOString().split('T')[0])
      .lte('due_date', futureDate.toISOString().split('T')[0]);

    if (error) throw error;
    return data as MilestoneWithProject[];
  }
}

export const milestoneService = new MilestoneService();
