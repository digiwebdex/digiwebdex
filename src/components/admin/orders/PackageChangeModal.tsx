import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/lib/i18n';
import { logAudit } from '@/lib/auditLog';

interface OrderItemRow {
  id: string;
  order_id: string;
  service_type: string | null;
  package_name: string | null;
  price: number;
  qty: number;
  total: number;
  domain: string | null;
  billing_type: string | null;
  renewal_date: string | null;
}

interface PackageOption {
  id: string;
  name_en: string;
  name_bn: string;
  price: number;
  service_id: string;
}

interface PackageChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderItem: OrderItemRow | null;
  orderId: string;
  orderNumber: string;
  onSuccess: () => void;
}

export default function PackageChangeModal({
  open, onOpenChange, orderItem, orderId, orderNumber, onSuccess
}: PackageChangeModalProps) {
  const { language } = useLanguage();
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingPkgs, setFetchingPkgs] = useState(false);

  const selectedPkg = packages.find(p => p.id === selectedPackageId);
  const newPrice = selectedPackageId === 'custom' ? (customPrice || 0) : (selectedPkg?.price || 0);
  const priceDiff = orderItem ? newPrice - orderItem.price : 0;
  const isUpgrade = priceDiff > 0;
  const isDowngrade = priceDiff < 0;

  useEffect(() => {
    if (open && orderItem?.service_type) {
      fetchPackages(orderItem.service_type);
    }
  }, [open, orderItem?.service_type]);

  const fetchPackages = async (serviceType: string) => {
    setFetchingPkgs(true);
    const { data: services } = await supabase
      .from('services')
      .select('id')
      .eq('service_type', serviceType as any)
      .eq('is_active', true);

    if (services && services.length > 0) {
      const serviceIds = services.map(s => s.id);
      const { data: pkgs } = await supabase
        .from('service_packages')
        .select('id, name_en, name_bn, price, service_id')
        .in('service_id', serviceIds)
        .eq('is_active', true)
        .order('price', { ascending: true });
      setPackages(pkgs || []);
    } else {
      setPackages([]);
    }
    setFetchingPkgs(false);
  };

  const handleConfirm = async () => {
    if (!orderItem || !selectedPackageId) return;
    if (selectedPackageId === 'custom' && (!customPrice || customPrice <= 0)) {
      toast({ title: language === 'bn' ? 'কাস্টম মূল্য দিন' : 'Enter custom price', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const newPkgName = selectedPackageId === 'custom'
        ? (language === 'bn' ? 'কাস্টম প্যাকেজ' : 'Custom Package')
        : (language === 'bn' ? selectedPkg!.name_bn : selectedPkg!.name_en);

      const oldValues = {
        package_name: orderItem.package_name,
        price: orderItem.price,
        total: orderItem.total,
      };

      // 1. Update order_item
      const { error: itemErr } = await supabase.from('order_items').update({
        package_name: newPkgName,
        price: newPrice,
        total: newPrice * orderItem.qty,
      }).eq('id', orderItem.id);
      if (itemErr) throw itemErr;

      // 2. Recalculate order totals from all items
      const { data: allItems } = await supabase.from('order_items').select('total').eq('order_id', orderId);
      const newSubtotal = (allItems || []).reduce((sum, i) => sum + Number(i.total), 0);

      const { data: orderData } = await supabase.from('orders').select('discount, tax, advance_payment').eq('id', orderId).single();
      const discount = Number(orderData?.discount || 0);
      const tax = Number(orderData?.tax || 0);
      const newTotal = newSubtotal - discount + tax;

      const { error: orderErr } = await supabase.from('orders').update({
        subtotal: newSubtotal,
        total: newTotal,
      }).eq('id', orderId);
      if (orderErr) throw orderErr;

      // 3. Update invoice totals
      const { data: invoice } = await supabase.from('invoices').select('id, advance_paid').eq('order_id', orderId).limit(1).single();
      if (invoice) {
        const advPaid = Number(invoice.advance_paid || 0);
        const due = Math.max(0, newTotal - advPaid);
        await supabase.from('invoices').update({
          subtotal: newSubtotal,
          total: newTotal,
          due_amount: due,
          status: due <= 0 ? 'paid' : (advPaid > 0 ? 'partial' : 'unpaid'),
        }).eq('id', invoice.id);

        // 4. Update invoice_item
        await supabase.from('invoice_items').update({
          package_name: newPkgName,
          price: newPrice,
          total: newPrice * orderItem.qty,
        }).eq('invoice_id', invoice.id).eq('service_type', orderItem.service_type!);
      }

      // 5. Audit log
      await logAudit('package_change', 'order_item', orderItem.id, oldValues as any, {
        package_name: newPkgName, price: newPrice, total: newPrice * orderItem.qty,
        change_type: isUpgrade ? 'upgrade' : isDowngrade ? 'downgrade' : 'change',
        reason, order_number: orderNumber,
      } as any);

      toast({
        title: language === 'bn'
          ? `✅ প্যাকেজ ${isUpgrade ? 'আপগ্রেড' : isDowngrade ? 'ডাউনগ্রেড' : 'পরিবর্তন'} সফল`
          : `✅ Package ${isUpgrade ? 'upgraded' : isDowngrade ? 'downgraded' : 'changed'} successfully`,
      });

      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const reset = () => {
    setSelectedPackageId('');
    setCustomPrice(null);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            {language === 'bn' ? 'প্যাকেজ আপগ্রেড / ডাউনগ্রেড' : 'Package Upgrade / Downgrade'}
          </DialogTitle>
        </DialogHeader>

        {orderItem && (
          <div className="space-y-4">
            {/* Current Package Info */}
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <p className="text-sm text-muted-foreground">{language === 'bn' ? 'বর্তমান প্যাকেজ' : 'Current Package'}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{orderItem.package_name || '-'}</p>
                  <p className="text-xs text-muted-foreground capitalize">{orderItem.service_type?.replace('_', ' ')}</p>
                  {orderItem.domain && <p className="text-xs text-muted-foreground">{orderItem.domain}</p>}
                </div>
                <p className="text-lg font-bold">৳{orderItem.price.toLocaleString()}</p>
              </div>
            </div>

            {/* New Package Selection */}
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'নতুন প্যাকেজ নির্বাচন করুন' : 'Select New Package'}</Label>
              {fetchingPkgs ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </div>
              ) : (
                <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                  <SelectTrigger><SelectValue placeholder={language === 'bn' ? 'প্যাকেজ নির্বাচন করুন' : 'Select package'} /></SelectTrigger>
                  <SelectContent>
                    {packages.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {language === 'bn' ? p.name_bn : p.name_en} — ৳{p.price.toLocaleString()}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom" className="border-t font-semibold">
                      ✏️ {language === 'bn' ? 'কাস্টম মূল্য' : 'Custom Price'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedPackageId === 'custom' && (
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'কাস্টম মূল্য (৳)' : 'Custom Price (৳)'}</Label>
                <Input type="number" min={0} value={customPrice ?? ''} onChange={e => setCustomPrice(Number(e.target.value))} />
              </div>
            )}

            {/* Price Difference */}
            {selectedPackageId && (
              <div className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{language === 'bn' ? 'নতুন মূল্য' : 'New Price'}</span>
                  <span className="font-bold">৳{newPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{language === 'bn' ? 'পার্থক্য' : 'Difference'}</span>
                  <div className="flex items-center gap-2">
                    {isUpgrade && <Badge className="bg-green-100 text-green-700 flex items-center gap-1"><ArrowUp className="h-3 w-3" />{language === 'bn' ? 'আপগ্রেড' : 'Upgrade'}</Badge>}
                    {isDowngrade && <Badge className="bg-orange-100 text-orange-700 flex items-center gap-1"><ArrowDown className="h-3 w-3" />{language === 'bn' ? 'ডাউনগ্রেড' : 'Downgrade'}</Badge>}
                    <span className={`font-bold ${isUpgrade ? 'text-green-600' : isDowngrade ? 'text-orange-600' : ''}`}>
                      {priceDiff > 0 ? '+' : ''}{priceDiff !== 0 ? `৳${priceDiff.toLocaleString()}` : '—'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'পরিবর্তনের কারণ' : 'Reason for Change'}</Label>
              <Textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
                placeholder={language === 'bn' ? 'ঐচ্ছিক...' : 'Optional...'} />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {language === 'bn' ? 'বাতিল' : 'Cancel'}
          </Button>
          <Button onClick={handleConfirm} disabled={loading || !selectedPackageId}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {loading
              ? (language === 'bn' ? 'আপডেট হচ্ছে...' : 'Updating...')
              : (language === 'bn' ? 'প্যাকেজ পরিবর্তন করুন' : 'Change Package')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
