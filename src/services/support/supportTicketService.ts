import { supabase } from '@/integrations/supabase/client';

export type TicketCategory = 'hosting' | 'domain' | 'software' | 'billing' | 'technical' | 'other';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  subject: string;
  description: string | null;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to: string | null;
  related_order_id: string | null;
  related_invoice_id: string | null;
  sla_due_at: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  satisfaction_rating: number | null;
  satisfaction_feedback: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
  assigned_name?: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_internal_note: boolean;
  attachment_urls: string[] | null;
  created_at: string;
  sender_name?: string;
}

export interface CreateTicketData {
  subject: string;
  description?: string;
  category: TicketCategory;
  priority?: TicketPriority;
  related_order_id?: string;
  related_invoice_id?: string;
  tags?: string[];
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  waitingCustomer: number;
  resolved: number;
  closed: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  slaBreach: number;
}

// Helper to get profile names
async function getProfileNames(userIds: string[]): Promise<Record<string, string>> {
  if (userIds.length === 0) return {};
  
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  const { data } = await supabase
    .from('profiles')
    .select('user_id, full_name')
    .in('user_id', uniqueIds);
  
  const map: Record<string, string> = {};
  data?.forEach((p) => {
    map[p.user_id] = p.full_name || 'Unknown';
  });
  return map;
}

export const supportTicketService = {
  // Create a new ticket
  async createTicket(data: CreateTicketData): Promise<SupportTicket> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.user.id,
        subject: data.subject,
        description: data.description,
        category: data.category,
        priority: data.priority || 'medium',
        related_order_id: data.related_order_id,
        related_invoice_id: data.related_invoice_id,
        tags: data.tags,
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger notification
    await this.triggerNotification(ticket.id, 'ticket_created');

    return ticket as SupportTicket;
  },

  // Get tickets for current user (client view)
  async getUserTickets(): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as SupportTicket[];
  },

  // Get all tickets (admin view)
  async getAllTickets(filters?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    assignedTo?: string;
  }): Promise<SupportTicket[]> {
    let query = supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }

    const { data, error } = await query;
    if (error) throw error;

    const tickets = (data || []) as SupportTicket[];
    
    // Fetch profile names
    const userIds = tickets.flatMap((t) => [t.user_id, t.assigned_to].filter(Boolean) as string[]);
    const names = await getProfileNames(userIds);
    
    return tickets.map((t) => ({
      ...t,
      user_name: names[t.user_id] || 'Unknown',
      assigned_name: t.assigned_to ? names[t.assigned_to] : undefined,
    }));
  },

  // Get single ticket with messages
  async getTicket(ticketId: string): Promise<SupportTicket | null> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const ticket = data as SupportTicket;
    const names = await getProfileNames([ticket.user_id, ticket.assigned_to].filter(Boolean) as string[]);
    
    return {
      ...ticket,
      user_name: names[ticket.user_id] || 'Unknown',
      assigned_name: ticket.assigned_to ? names[ticket.assigned_to] : undefined,
    };
  },

  // Get ticket messages
  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    const { data, error } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    const messages = (data || []) as TicketMessage[];
    const senderIds = messages.map((m) => m.sender_id);
    const names = await getProfileNames(senderIds);
    
    return messages.map((m) => ({
      ...m,
      sender_name: names[m.sender_id] || 'Unknown',
    }));
  },

  // Add message to ticket
  async addMessage(
    ticketId: string,
    message: string,
    isInternalNote: boolean = false,
    attachmentUrls?: string[]
  ): Promise<TicketMessage> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: user.user.id,
        message,
        is_internal_note: isInternalNote,
        attachment_urls: attachmentUrls,
      })
      .select()
      .single();

    if (error) throw error;

    // Update first response time if this is staff reply
    const ticket = await this.getTicket(ticketId);
    if (ticket && !ticket.first_response_at && ticket.user_id !== user.user.id) {
      await supabase
        .from('support_tickets')
        .update({ first_response_at: new Date().toISOString() })
        .eq('id', ticketId);
    }

    // Trigger notification if not internal note
    if (!isInternalNote) {
      await this.triggerNotification(ticketId, 'ticket_reply');
    }

    return data as TicketMessage;
  },

  // Update ticket status
  async updateStatus(ticketId: string, status: TicketStatus): Promise<void> {
    const updateData: Record<string, unknown> = { status };

    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    } else if (status === 'closed') {
      updateData.closed_at = new Date().toISOString();
      await this.triggerNotification(ticketId, 'ticket_closed');
    }

    const { error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', ticketId);

    if (error) throw error;

    // Log the action
    await this.logAction(ticketId, 'status_changed', null, status);
  },

  // Assign ticket to staff
  async assignTicket(ticketId: string, staffId: string | null): Promise<void> {
    const { error } = await supabase
      .from('support_tickets')
      .update({ assigned_to: staffId })
      .eq('id', ticketId);

    if (error) throw error;
    await this.logAction(ticketId, 'assigned', null, staffId);
  },

  // Update ticket priority
  async updatePriority(ticketId: string, priority: TicketPriority): Promise<void> {
    const { error } = await supabase
      .from('support_tickets')
      .update({ priority })
      .eq('id', ticketId);

    if (error) throw error;
    await this.logAction(ticketId, 'priority_changed', null, priority);
  },

  // Rate ticket satisfaction
  async rateTicket(ticketId: string, rating: number, feedback?: string): Promise<void> {
    const { error } = await supabase
      .from('support_tickets')
      .update({
        satisfaction_rating: rating,
        satisfaction_feedback: feedback,
      })
      .eq('id', ticketId);

    if (error) throw error;
  },

  // Upload attachment
  async uploadAttachment(file: File, ticketId: string): Promise<string> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${ticketId}/${user.user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('ticket-attachments')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('ticket-attachments')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },

  // Get ticket statistics (admin)
  async getTicketStats(): Promise<TicketStats> {
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('status, sla_due_at, first_response_at, resolved_at, created_at');

    if (error) throw error;

    const now = new Date();
    const stats: TicketStats = {
      total: tickets?.length || 0,
      open: 0,
      inProgress: 0,
      waitingCustomer: 0,
      resolved: 0,
      closed: 0,
      avgResponseTime: 0,
      avgResolutionTime: 0,
      slaBreach: 0,
    };

    let totalResponseTime = 0;
    let responseCount = 0;
    let totalResolutionTime = 0;
    let resolutionCount = 0;

    tickets?.forEach((ticket) => {
      switch (ticket.status) {
        case 'open':
          stats.open++;
          break;
        case 'in_progress':
          stats.inProgress++;
          break;
        case 'waiting_customer':
          stats.waitingCustomer++;
          break;
        case 'resolved':
          stats.resolved++;
          break;
        case 'closed':
          stats.closed++;
          break;
      }

      // Check SLA breach
      if (ticket.sla_due_at && ticket.status !== 'closed' && ticket.status !== 'resolved') {
        if (new Date(ticket.sla_due_at) < now) {
          stats.slaBreach++;
        }
      }

      // Calculate response time
      if (ticket.first_response_at && ticket.created_at) {
        const responseTime =
          new Date(ticket.first_response_at).getTime() - new Date(ticket.created_at).getTime();
        totalResponseTime += responseTime;
        responseCount++;
      }

      // Calculate resolution time
      if (ticket.resolved_at && ticket.created_at) {
        const resolutionTime =
          new Date(ticket.resolved_at).getTime() - new Date(ticket.created_at).getTime();
        totalResolutionTime += resolutionTime;
        resolutionCount++;
      }
    });

    // Convert to hours
    stats.avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount / (1000 * 60 * 60) : 0;
    stats.avgResolutionTime = resolutionCount > 0 ? totalResolutionTime / resolutionCount / (1000 * 60 * 60) : 0;

    return stats;
  },

  // Log ticket action
  async logAction(
    ticketId: string,
    action: string,
    oldValue: string | null,
    newValue: string | null
  ): Promise<void> {
    const { data: user } = await supabase.auth.getUser();

    await supabase.from('ticket_logs').insert({
      ticket_id: ticketId,
      action,
      performed_by: user.user?.id,
      old_value: oldValue,
      new_value: newValue,
    });
  },

  // Trigger notification
  async triggerNotification(ticketId: string, type: string): Promise<void> {
    try {
      await supabase.functions.invoke('ticket-notification', {
        body: { ticketId, type },
      });
    } catch (err) {
      console.error('Failed to send ticket notification:', err);
    }
  },

  // Get staff members for assignment
  async getStaffMembers(): Promise<{ id: string; full_name: string }[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'staff']);

    if (error) throw error;

    const userIds = (data || []).map((r) => r.user_id);
    const names = await getProfileNames(userIds);

    return userIds.map((id) => ({
      id,
      full_name: names[id] || 'Unknown',
    }));
  },
};
