import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

/**
 * Log an admin action to the audit_logs table
 */
export async function logAudit(
  action: string,
  entityType: string,
  entityId: string | null,
  oldValues?: Json | null,
  newValues?: Json | null
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('audit_logs').insert([{
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues ?? null,
      new_values: newValues ?? null,
      user_id: user?.id ?? null,
      user_agent: navigator.userAgent,
    }]);
  } catch (error) {
    console.error('Audit log error:', error);
  }
}
