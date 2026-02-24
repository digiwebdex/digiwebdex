import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const bookingSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(20),
  email: z.string().trim().email().max(255).optional().or(z.literal('')),
  service_interest: z.string().optional(),
  preferred_date: z.string().optional(),
  preferred_time: z.string().optional(),
  message: z.string().trim().max(500).optional(),
});

interface Props {
  trigger?: React.ReactNode;
}

export function ConsultationBookingModal({ trigger }: Props) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', service_interest: '', preferred_date: '', preferred_time: '', message: '',
  });

  const services = language === 'bn'
    ? ['ওয়েব ডেভেলপমেন্ট', 'সফটওয়্যার ডেভেলপমেন্ট', 'ডিজিটাল মার্কেটিং', 'ডোমেইন ও হোস্টিং', 'অন্যান্য']
    : ['Web Development', 'Software Development', 'Digital Marketing', 'Domain & Hosting', 'Other'];

  const timeSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '7:00 PM'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validated = bookingSchema.parse(form);
      const { error } = await supabase.from('consultation_bookings' as any).insert({
        name: validated.name,
        phone: validated.phone,
        email: validated.email || null,
        service_interest: validated.service_interest || null,
        preferred_date: validated.preferred_date || null,
        preferred_time: validated.preferred_time || null,
        message: validated.message || null,
      });
      if (error) throw error;
      toast.success(language === 'bn' ? 'বুকিং সফল!' : 'Booking Submitted!', {
        description: language === 'bn' ? 'আমরা শীঘ্রই যোগাযোগ করব।' : 'We will contact you shortly.',
      });
      setForm({ name: '', phone: '', email: '', service_interest: '', preferred_date: '', preferred_time: '', message: '' });
      setOpen(false);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error(language === 'bn' ? 'বুকিং ব্যর্থ হয়েছে' : 'Booking failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gradient-button gap-2">
            <CalendarDays className="w-4 h-4" />
            {language === 'bn' ? 'ফ্রি কনসাল্টেশন বুক করুন' : 'Book Free Consultation'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {language === 'bn' ? '🗓️ ফ্রি কনসাল্টেশন বুক করুন' : '🗓️ Book Free Consultation'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{language === 'bn' ? 'নাম' : 'Name'} *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>{language === 'bn' ? 'ফোন' : 'Phone'} *</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="+880" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{language === 'bn' ? 'ইমেইল' : 'Email'}</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>{language === 'bn' ? 'সার্ভিস' : 'Service Interest'}</Label>
            <Select value={form.service_interest} onValueChange={(v) => setForm({ ...form, service_interest: v })}>
              <SelectTrigger><SelectValue placeholder={language === 'bn' ? 'সার্ভিস বাছাই করুন' : 'Select service'} /></SelectTrigger>
              <SelectContent>
                {services.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{language === 'bn' ? 'পছন্দের তারিখ' : 'Preferred Date'}</Label>
              <Input type="date" min={minDateStr} value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>{language === 'bn' ? 'পছন্দের সময়' : 'Preferred Time'}</Label>
              <Select value={form.preferred_time} onValueChange={(v) => setForm({ ...form, preferred_time: v })}>
                <SelectTrigger><SelectValue placeholder={language === 'bn' ? 'সময় বাছাই' : 'Select time'} /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{language === 'bn' ? 'বার্তা' : 'Message'}</Label>
            <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} />
          </div>
          <Button type="submit" className="w-full gradient-button" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {language === 'bn' ? 'বুকিং কনফার্ম করুন' : 'Confirm Booking'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {language === 'bn' ? '✅ ১০০% ফ্রি • কোনো চার্জ নেই' : '✅ 100% Free • No charges'}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
