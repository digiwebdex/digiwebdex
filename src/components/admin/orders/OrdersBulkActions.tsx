import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { bulkUpdateOrders } from '@/services/bulkOrderService';
import { mergeOrdersIntoInvoice } from '@/services/mergeOrdersService';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Merge } from 'lucide-react';
import MergePreviewModal from './MergePreviewModal';

interface OrdersBulkActionsProps {
  selectedOrderIds: string[];
  onComplete: () => void;
}

export default function OrdersBulkActions({ selectedOrderIds, onComplete }: OrdersBulkActionsProps) {
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeLoading, setMergeLoading] = useState(false);

  const applyAction = async () => {
    if (!action) {
      toast.error('অ্যাকশন সিলেক্ট করুন');
      return;
    }
    if (!selectedOrderIds.length) {
      toast.error('কোনো অর্ডার সিলেক্ট করা হয়নি');
      return;
    }

    setLoading(true);
    try {
      const result = await bulkUpdateOrders(selectedOrderIds, action as any);
      toast.success(`${result.success} টি অর্ডার আপডেট হয়েছে`, {
        description: result.failed > 0 ? `${result.failed} টি ব্যর্থ হয়েছে` : undefined,
      });
      setAction('');
      onComplete();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleMergeClick = () => {
    if (selectedOrderIds.length < 2) {
      toast.error('মার্জ করতে কমপক্ষে ২টি অর্ডার সিলেক্ট করুন');
      return;
    }
    setMergeOpen(true);
  };

  const handleMergeConfirm = async () => {
    setMergeLoading(true);
    try {
      const result = await mergeOrdersIntoInvoice(selectedOrderIds);
      toast.success(`অর্ডার মার্জ সফল হয়েছে`, {
        description: `Invoice: ${result.invoiceNumber}`,
      });
      setMergeOpen(false);
      onComplete();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setMergeLoading(false);
    }
  };

  if (!selectedOrderIds.length) return null;

  const mergeOrders = selectedOrderIds.map(id => ({
    id,
    order_number: id.slice(0, 8),
  }));

  return (
    <>
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
        <Badge variant="secondary">
          <CheckCircle className="h-3 w-3 mr-1" />
          {selectedOrderIds.length} সিলেক্টেড
        </Badge>

        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Bulk Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
          </SelectContent>
        </Select>

        <Button size="sm" onClick={applyAction} disabled={loading || !action}>
          {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
          Apply
        </Button>

        <Button size="sm" variant="secondary" onClick={handleMergeClick} disabled={selectedOrderIds.length < 2}>
          <Merge className="h-4 w-4 mr-1" />
          Merge Orders
        </Button>
      </div>

      <MergePreviewModal
        open={mergeOpen}
        orders={mergeOrders}
        onClose={() => setMergeOpen(false)}
        onConfirm={handleMergeConfirm}
        loading={mergeLoading}
      />
    </>
  );
}
