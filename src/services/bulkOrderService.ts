import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

type BulkAction = 'pending' | 'processing' | 'completed' | 'cancelled' | 'delete';

export async function bulkUpdateOrders(orderIds: string[], action: BulkAction): Promise<{ success: number; failed: number }> {
  if (!orderIds.length) {
    throw new Error('No orders selected');
  }

  let success = 0;
  let failed = 0;

  if (action === 'delete') {
    // Delete orders (will fail for orders with paid invoices due to DB trigger)
    for (const id of orderIds) {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) {
        console.error(`Failed to delete order ${id}:`, error.message);
        failed++;
      } else {
        success++;
      }
    }
  } else {
    // Bulk status update
    const status = action as OrderStatus;
    const now = new Date().toISOString();

    for (const id of orderIds) {
      const updateData: Record<string, unknown> = { status };

      if (action === 'completed') updateData.completed_at = now;
      if (action === 'cancelled') updateData.cancelled_at = now;

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error(`Failed to update order ${id}:`, error.message);
        failed++;
      } else {
        success++;
      }
    }
  }

  return { success, failed };
}
