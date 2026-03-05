import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/lib/i18n';
import { logAudit } from '@/lib/auditLog';
import { Pencil, Check, X, Trash2, Plus, ArrowUpDown, Loader2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type DbOrderItem = Database['public']['Tables']['order_items']['Row'];

interface OrderItemEditorProps {
  items: DbOrderItem[];
  orderId: string;
  orderNumber: string;
  formatCurrency: (amount: number) => string;
  onRefresh: () => void;
  onPackageChange: (item: DbOrderItem) => void;
}

export default function OrderItemEditor({
  items, orderId, orderNumber, formatCurrency, onRefresh, onPackageChange,
}: OrderItemEditorProps) {
  const { language } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<DbOrderItem>>({});
  const [saving, setSaving] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newItem, setNewItem] = useState({ service_type: '', package_name: '', domain: '', price: 0, qty: 1 });

  const startEdit = (item: DbOrderItem) => {
    setEditingId(item.id);
    setEditData({
      service_type: item.service_type,
      package_name: item.package_name,
      domain: item.domain,
      price: item.price,
      qty: item.qty,
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditData({}); };

  const saveEdit = async (item: DbOrderItem) => {
    setSaving(true);
    try {
      const newPrice = Number(editData.price) || 0;
      const newQty = Number(editData.qty) || 1;
      const newTotal = newPrice * newQty;

      const oldValues = { service_type: item.service_type, package_name: item.package_name, domain: item.domain, price: item.price, qty: item.qty, total: item.total };

      const { error } = await supabase.from('order_items').update({
        service_type: editData.service_type || null,
        package_name: editData.package_name || null,
        domain: editData.domain || null,
        price: newPrice,
        qty: newQty,
        total: newTotal,
      }).eq('id', item.id);
      if (error) throw error;

      // Sync invoice_items
      const { data: invoice } = await supabase.from('invoices').select('id').eq('order_id', orderId).limit(1).single();
      if (invoice) {
        await supabase.from('invoice_items').update({
          service_type: editData.service_type || null,
          package_name: editData.package_name || null,
          domain: editData.domain || null,
          price: newPrice,
          qty: newQty,
          total: newTotal,
        }).eq('invoice_id', invoice.id).eq('id', item.id);
        // Fallback: match by old service_type
        await supabase.from('invoice_items').update({
          service_type: editData.service_type || null,
          package_name: editData.package_name || null,
          domain: editData.domain || null,
          price: newPrice,
          qty: newQty,
          total: newTotal,
        }).eq('invoice_id', invoice.id).eq('service_type', item.service_type!);
      }

      await recalcOrderTotals();
      await logAudit('edit_order_item', 'order_item', item.id, oldValues as any, { ...editData, total: newTotal, order_number: orderNumber } as any);

      toast({ title: language === 'bn' ? '✅ আইটেম আপডেট হয়েছে' : '✅ Item updated' });
      setEditingId(null);
      setEditData({});
      onRefresh();
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const deleteItem = async (item: DbOrderItem) => {
    if (items.length <= 1) {
      toast({ title: language === 'bn' ? 'শেষ আইটেম মুছা যাবে না' : 'Cannot delete the last item', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('order_items').delete().eq('id', item.id);
      if (error) throw error;

      // Delete matching invoice item
      const { data: invoice } = await supabase.from('invoices').select('id').eq('order_id', orderId).limit(1).single();
      if (invoice) {
        await supabase.from('invoice_items').delete().eq('invoice_id', invoice.id).eq('service_type', item.service_type!);
      }

      await recalcOrderTotals();
      await logAudit('delete_order_item', 'order_item', item.id, { service_type: item.service_type, package_name: item.package_name, price: item.price } as any, null);

      toast({ title: language === 'bn' ? '🗑️ আইটেম মুছে ফেলা হয়েছে' : '🗑️ Item deleted' });
      onRefresh();
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const addItem = async () => {
    if (!newItem.service_type || !newItem.package_name || newItem.price <= 0) {
      toast({ title: language === 'bn' ? 'সব তথ্য পূরণ করুন' : 'Fill all fields', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const total = newItem.price * newItem.qty;
      const { error } = await supabase.from('order_items').insert({
        order_id: orderId,
        service_type: newItem.service_type,
        package_name: newItem.package_name,
        domain: newItem.domain || null,
        price: newItem.price,
        qty: newItem.qty,
        total,
      });
      if (error) throw error;

      // Add to invoice
      const { data: invoice } = await supabase.from('invoices').select('id').eq('order_id', orderId).limit(1).single();
      if (invoice) {
        await supabase.from('invoice_items').insert({
          invoice_id: invoice.id,
          service_type: newItem.service_type,
          package_name: newItem.package_name,
          domain: newItem.domain || null,
          price: newItem.price,
          qty: newItem.qty,
          total,
        });
      }

      await recalcOrderTotals();
      await logAudit('add_order_item', 'order_item', orderId, null, { ...newItem, total, order_number: orderNumber } as any);

      toast({ title: language === 'bn' ? '✅ নতুন আইটেম যোগ হয়েছে' : '✅ Item added' });
      setAddingNew(false);
      setNewItem({ service_type: '', package_name: '', domain: '', price: 0, qty: 1 });
      onRefresh();
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const recalcOrderTotals = async () => {
    const { data: allItems } = await supabase.from('order_items').select('total').eq('order_id', orderId);
    const newSubtotal = (allItems || []).reduce((sum, i) => sum + Number(i.total), 0);
    const { data: orderData } = await supabase.from('orders').select('discount, tax').eq('id', orderId).single();
    const discount = Number(orderData?.discount || 0);
    const tax = Number(orderData?.tax || 0);
    const newTotal = newSubtotal - discount + tax;

    await supabase.from('orders').update({ subtotal: newSubtotal, total: newTotal }).eq('id', orderId);

    const { data: invoice } = await supabase.from('invoices').select('id, advance_paid').eq('order_id', orderId).limit(1).single();
    if (invoice) {
      const advPaid = Number(invoice.advance_paid || 0);
      const due = Math.max(0, newTotal - advPaid);
      await supabase.from('invoices').update({
        subtotal: newSubtotal, total: newTotal, due_amount: due,
        status: due <= 0 ? 'paid' : (advPaid > 0 ? 'partial' : 'unpaid'),
      }).eq('id', invoice.id);
    }
  };

  const SERVICE_TYPES = ['domain', 'hosting', 'web_development', 'software_development', 'digital_marketing'];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{language === 'bn' ? 'অর্ডার আইটেম' : 'Order Items'}</span>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setAddingNew(true)} disabled={addingNew}>
          <Plus className="h-3 w-3 mr-1" /> {language === 'bn' ? 'আইটেম যোগ' : 'Add Item'}
        </Button>
      </div>
      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-2">#</th>
              <th className="text-left p-2">{language === 'bn' ? 'সার্ভিস' : 'Service'}</th>
              <th className="text-left p-2">{language === 'bn' ? 'প্যাকেজ' : 'Package'}</th>
              <th className="text-right p-2">{language === 'bn' ? 'মূল্য' : 'Price'}</th>
              <th className="text-center p-2">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} className="border-t">
                {editingId === item.id ? (
                  <>
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">
                      <Select value={editData.service_type || ''} onValueChange={(v) => setEditData(d => ({ ...d, service_type: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {SERVICE_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input className="h-7 text-xs mt-1" placeholder="domain" value={editData.domain || ''} onChange={e => setEditData(d => ({ ...d, domain: e.target.value }))} />
                    </td>
                    <td className="p-2">
                      <Input className="h-8 text-xs" value={editData.package_name || ''} onChange={e => setEditData(d => ({ ...d, package_name: e.target.value }))} />
                    </td>
                    <td className="p-2">
                      <Input className="h-8 text-xs text-right" type="number" value={editData.price || 0} onChange={e => setEditData(d => ({ ...d, price: Number(e.target.value) }))} />
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex gap-1 justify-center">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => saveEdit(item)} disabled={saving}>
                          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit} disabled={saving}><X className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">
                      <span className="capitalize">{item.service_type?.replace('_', ' ')}</span>
                      {item.domain && <div className="text-xs text-muted-foreground">{item.domain}</div>}
                    </td>
                    <td className="p-2">{item.package_name}</td>
                    <td className="p-2 text-right font-medium">{formatCurrency(item.total)}</td>
                    <td className="p-2 text-center">
                      <div className="flex gap-0.5 justify-center">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(item)} title={language === 'bn' ? 'এডিট' : 'Edit'}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onPackageChange(item)} title={language === 'bn' ? 'প্যাকেজ পরিবর্তন' : 'Change Package'}>
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteItem(item)} disabled={saving || items.length <= 1} title={language === 'bn' ? 'মুছুন' : 'Delete'}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}

            {/* Add New Row */}
            {addingNew && (
              <tr className="border-t bg-muted/30">
                <td className="p-2">+</td>
                <td className="p-2">
                  <Select value={newItem.service_type} onValueChange={(v) => setNewItem(n => ({ ...n, service_type: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={language === 'bn' ? 'সার্ভিস' : 'Service'} /></SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input className="h-7 text-xs mt-1" placeholder="domain" value={newItem.domain} onChange={e => setNewItem(n => ({ ...n, domain: e.target.value }))} />
                </td>
                <td className="p-2">
                  <Input className="h-8 text-xs" placeholder={language === 'bn' ? 'প্যাকেজ নাম' : 'Package name'} value={newItem.package_name} onChange={e => setNewItem(n => ({ ...n, package_name: e.target.value }))} />
                </td>
                <td className="p-2">
                  <Input className="h-8 text-xs text-right" type="number" placeholder="0" value={newItem.price || ''} onChange={e => setNewItem(n => ({ ...n, price: Number(e.target.value) }))} />
                </td>
                <td className="p-2 text-center">
                  <div className="flex gap-1 justify-center">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={addItem} disabled={saving}>
                      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setAddingNew(false)}><X className="h-3 w-3" /></Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
