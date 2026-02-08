import { supabase } from '@/integrations/supabase/client';

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'lost';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  service_interest?: string | null;
  source: string;
  status: LeadStatus;
  notes?: string | null;
  assigned_to?: string | null;
  converted_order_id?: string | null;
  first_contact_at?: string | null;
  last_follow_up_at?: string | null;
  follow_up_count: number;
  created_at: string;
  updated_at: string;
}

export interface LeadFormData {
  name: string;
  phone: string;
  email?: string;
  service_interest: string;
  source?: string;
}

export interface LeadLog {
  id: string;
  lead_id: string;
  action: string;
  details: Record<string, unknown>;
  performed_by?: string | null;
  created_at: string;
}

// Rate limiting - 5 submissions per IP per hour
const submissionCache = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = submissionCache.get(identifier);
  
  if (!record || now > record.resetTime) {
    submissionCache.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

// Phone number validation
function validateBangladeshPhone(phone: string): { valid: boolean; normalized: string } {
  // Remove all non-digits
  let normalized = phone.replace(/[^0-9]/g, '');
  
  // Handle different formats
  if (normalized.startsWith('880')) {
    normalized = '0' + normalized.substring(3);
  } else if (normalized.startsWith('+880')) {
    normalized = '0' + normalized.substring(4);
  }
  
  // Validate Bangladesh mobile format: 01[3-9]XXXXXXXX
  const isValid = /^01[3-9]\d{8}$/.test(normalized);
  
  return { valid: isValid, normalized };
}

class LeadService {
  async createLead(data: LeadFormData): Promise<{ success: boolean; data?: Lead; error?: string }> {
    try {
      // Validate phone number
      const { valid, normalized } = validateBangladeshPhone(data.phone);
      if (!valid) {
        return { success: false, error: 'অবৈধ ফোন নম্বর। সঠিক বাংলাদেশি মোবাইল নম্বর দিন।' };
      }

      // Rate limit check (using phone as identifier)
      if (!checkRateLimit(normalized)) {
        return { success: false, error: 'অনেক বেশি রিকোয়েস্ট। কিছুক্ষণ পর আবার চেষ্টা করুন।' };
      }

      // Insert lead
      const { data: lead, error } = await supabase
        .from('leads')
        .insert({
          name: data.name.trim(),
          phone: normalized,
          email: data.email?.trim() || null,
          service_interest: data.service_interest,
          source: data.source || 'website',
          status: 'new',
        })
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await this.logAction(lead.id, 'lead_created', {
        source: data.source || 'website',
        service_interest: data.service_interest,
      });

      // Trigger notifications via edge function
      try {
        await supabase.functions.invoke('lead-notification', {
          body: {
            lead_id: lead.id,
            name: data.name,
            phone: normalized,
            email: data.email,
            service_interest: data.service_interest,
          },
        });
      } catch (notifyError) {
        console.error('Notification error:', notifyError);
        // Don't fail the submission if notification fails
      }

      return { success: true, data: lead as Lead };
    } catch (error) {
      console.error('Lead creation error:', error);
      return { success: false, error: 'লিড তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' };
    }
  }

  async getLeads(filters?: { 
    status?: LeadStatus; 
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Lead[]; count: number; error?: string }> {
    try {
      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      return { data: (data || []) as Lead[], count: count || 0 };
    } catch (error) {
      console.error('Get leads error:', error);
      return { data: [], count: 0, error: 'লিড লোড করতে সমস্যা হয়েছে।' };
    }
  }

  async updateLeadStatus(leadId: string, status: LeadStatus, notes?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: Partial<Lead> = { status };
      
      if (status === 'contacted' && !notes) {
        updateData.first_contact_at = new Date().toISOString();
      }

      if (notes) {
        updateData.notes = notes;
      }

      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId);

      if (error) throw error;

      await this.logAction(leadId, 'status_updated', { status, notes });

      return { success: true };
    } catch (error) {
      console.error('Update status error:', error);
      return { success: false, error: 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।' };
    }
  }

  async convertToOrder(leadId: string, orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          status: 'converted',
          converted_order_id: orderId,
        })
        .eq('id', leadId);

      if (error) throw error;

      await this.logAction(leadId, 'converted_to_order', { order_id: orderId });

      return { success: true };
    } catch (error) {
      console.error('Convert to order error:', error);
      return { success: false, error: 'অর্ডারে কনভার্ট করতে সমস্যা হয়েছে।' };
    }
  }

  async updateFollowUp(leadId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: lead, error: fetchError } = await supabase
        .from('leads')
        .select('follow_up_count')
        .eq('id', leadId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('leads')
        .update({
          last_follow_up_at: new Date().toISOString(),
          follow_up_count: (lead?.follow_up_count || 0) + 1,
        })
        .eq('id', leadId);

      if (error) throw error;

      await this.logAction(leadId, 'follow_up_sent', {});

      return { success: true };
    } catch (error) {
      console.error('Update follow-up error:', error);
      return { success: false, error: 'ফলো-আপ আপডেট করতে সমস্যা হয়েছে।' };
    }
  }

  async getLeadLogs(leadId: string): Promise<LeadLog[]> {
    try {
      const { data, error } = await supabase
        .from('lead_logs')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []) as LeadLog[];
    } catch (error) {
      console.error('Get lead logs error:', error);
      return [];
    }
  }

  async getLeadStats(): Promise<{
    total: number;
    new: number;
    contacted: number;
    converted: number;
    lost: number;
    conversionRate: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('status');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        new: 0,
        contacted: 0,
        converted: 0,
        lost: 0,
        conversionRate: 0,
      };

      data?.forEach((lead) => {
        if (lead.status in stats) {
          stats[lead.status as keyof typeof stats]++;
        }
      });

      stats.conversionRate = stats.total > 0 
        ? Math.round((stats.converted / stats.total) * 100) 
        : 0;

      return stats;
    } catch (error) {
      console.error('Get lead stats error:', error);
      return { total: 0, new: 0, contacted: 0, converted: 0, lost: 0, conversionRate: 0 };
    }
  }

  private async logAction(leadId: string, action: string, details: Record<string, unknown>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('lead_logs').insert([{
        lead_id: leadId,
        action,
        details: details as unknown as Record<string, never>,
        performed_by: user?.id || null,
      }]);
    } catch (error) {
      console.error('Log action error:', error);
    }
  }
}

export const leadService = new LeadService();
