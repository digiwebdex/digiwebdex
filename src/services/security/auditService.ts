/**
 * Audit Logging Service
 * Comprehensive audit trail for security-sensitive operations
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export type AuditAction =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_change'
  | 'password_reset_request'
  | 'password_reset_complete'
  | 'profile_update'
  | 'role_change'
  | 'order_create'
  | 'order_update'
  | 'order_cancel'
  | 'payment_submit'
  | 'payment_verify'
  | 'payment_reject'
  | 'invoice_create'
  | 'invoice_paid'
  | 'hosting_provision'
  | 'hosting_suspend'
  | 'hosting_unsuspend'
  | 'domain_register'
  | 'domain_transfer'
  | 'domain_renew'
  | 'affiliate_register'
  | 'affiliate_approve'
  | 'affiliate_suspend'
  | 'withdrawal_request'
  | 'withdrawal_approve'
  | 'withdrawal_reject'
  | 'admin_action'
  | 'security_event'
  | 'rate_limit_exceeded'
  | 'suspicious_activity'
  | 'data_export'
  | 'data_delete';

export interface AuditLogEntry {
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Get client information for audit logging
 */
function getClientInfo(): { ipAddress: string | null; userAgent: string | null } {
  return {
    ipAddress: null, // IP is captured server-side
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
  };
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const clientInfo = getClientInfo();

    const { error } = await supabase.from('audit_logs').insert([{
      user_id: user?.id || null,
      action: entry.action as string,
      entity_type: entry.entityType || null,
      entity_id: entry.entityId || null,
      old_values: (entry.oldValues as Json) || null,
      new_values: (entry.newValues as Json) || null,
      ip_address: clientInfo.ipAddress,
      user_agent: clientInfo.userAgent,
    }]);

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (err) {
    console.error('Audit logging error:', err);
  }
}

/**
 * Log a security event (high priority)
 */
export async function logSecurityEvent(
  event: string,
  details: Record<string, unknown>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): Promise<void> {
  await logAuditEvent({
    action: 'security_event',
    entityType: 'security',
    newValues: {
      event,
      severity,
      ...details,
      timestamp: new Date().toISOString(),
    },
  });

  // For critical events, could trigger additional alerts
  if (severity === 'critical') {
    console.error(`[CRITICAL SECURITY EVENT] ${event}:`, details);
  }
}

/**
 * Log rate limit exceeded
 */
export async function logRateLimitExceeded(
  endpoint: string,
  identifier: string
): Promise<void> {
  await logAuditEvent({
    action: 'rate_limit_exceeded',
    entityType: 'rate_limit',
    newValues: {
      endpoint,
      identifier: identifier.substring(0, 16), // Truncate for privacy
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
  activityType: string,
  details: Record<string, unknown>
): Promise<void> {
  await logSecurityEvent(activityType, details, 'high');
}

/**
 * Log admin action
 */
export async function logAdminAction(
  action: string,
  targetEntity: { type: string; id: string },
  changes?: { old?: Record<string, unknown>; new?: Record<string, unknown> }
): Promise<void> {
  await logAuditEvent({
    action: 'admin_action',
    entityType: targetEntity.type,
    entityId: targetEntity.id,
    oldValues: changes?.old,
    newValues: {
      action,
      ...changes?.new,
    },
  });
}

/**
 * Query audit logs (admin only)
 */
export async function queryAuditLogs(params: {
  userId?: string;
  action?: AuditAction;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<{ data: unknown[] | null; error: Error | null; count: number }> {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (params.userId) {
      query = query.eq('user_id', params.userId);
    }
    if (params.action) {
      query = query.eq('action', params.action);
    }
    if (params.entityType) {
      query = query.eq('entity_type', params.entityType);
    }
    if (params.entityId) {
      query = query.eq('entity_id', params.entityId);
    }
    if (params.startDate) {
      query = query.gte('created_at', params.startDate.toISOString());
    }
    if (params.endDate) {
      query = query.lte('created_at', params.endDate.toISOString());
    }
    if (params.limit) {
      query = query.limit(params.limit);
    }
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
    }

    const { data, error, count } = await query;

    return {
      data,
      error: error ? new Error(error.message) : null,
      count: count || 0,
    };
  } catch (err) {
    return {
      data: null,
      error: err as Error,
      count: 0,
    };
  }
}

/**
 * Get recent activity for a user
 */
export async function getUserRecentActivity(
  userId: string,
  limit: number = 20
): Promise<unknown[]> {
  const { data } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}

/**
 * Get security events summary
 */
export async function getSecurityEventsSummary(days: number = 7): Promise<{
  totalEvents: number;
  byAction: Record<string, number>;
  bySeverity: Record<string, number>;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data } = await supabase
    .from('audit_logs')
    .select('action, new_values')
    .eq('action', 'security_event')
    .gte('created_at', startDate.toISOString());

  const byAction: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};

  (data || []).forEach((log) => {
    byAction[log.action] = (byAction[log.action] || 0) + 1;
    
    const severity = (log.new_values as Record<string, unknown>)?.severity as string || 'unknown';
    bySeverity[severity] = (bySeverity[severity] || 0) + 1;
  });

  return {
    totalEvents: data?.length || 0,
    byAction,
    bySeverity,
  };
}
