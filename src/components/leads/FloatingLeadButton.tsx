import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhoneCall, Send, CheckCircle, X } from 'lucide-react';
import { leadService } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import { systemSettingsService } from '@/services/settings';

const leadSchema = z.object({
  name: z.string().trim().min(2, 'নাম অন্তত ২ অক্ষর হতে হবে').max(100),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, 'সঠিক ফোন নম্বর দিন'),
  service: z.string().min(1, 'সার্ভিস নির্বাচন করুন'),
});

export function FloatingLeadButton() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', service: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    const checkEnabled = async () => {
      try {
        const enabled = await systemSettingsService.getSetting<boolean | string>('callback_button_enabled');
        setIsEnabled(enabled === true || enabled === 'true');
      } catch {
        setIsEnabled(true); // Default to enabled on error
      }
    };
    checkEnabled();
  }, []);
  const services = [
    { value: 'domain-hosting', label: language === 'bn' ? 'ডোমেইন ও হোস্টিং' : 'Domain & Hosting' },
    { value: 'web-development', label: language === 'bn' ? 'ওয়েব ডেভেলপমেন্ট' : 'Web Development' },
    { value: 'software', label: language === 'bn' ? 'সফটওয়্যার ডেভেলপমেন্ট' : 'Software Development' },
    { value: 'digital-marketing', label: language === 'bn' ? 'ডিজিটাল মার্কেটিং' : 'Digital Marketing' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = leadSchema.parse(formData);
      setIsSubmitting(true);

      const result = await leadService.createLead({
        name: validated.name,
        phone: validated.phone,
        service_interest: validated.service,
        source: 'floating_button',
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setIsSuccess(true);
      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'শীঘ্রই যোগাযোগ করা হবে।' : 'We will contact you soon.',
      });

      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setFormData({ name: '', phone: '', service: '' });
      }, 3000);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: language === 'bn' ? 'ত্রুটি!' : 'Error!',
          description: err instanceof Error ? err.message : 'Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsSuccess(false);
    setFormData({ name: '', phone: '', service: '' });
    setErrors({});
  };

  // Don't render if disabled from admin panel
  if (!isEnabled) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed left-4 bottom-24 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group animate-bounce-subtle"
          aria-label={language === 'bn' ? 'কল ব্যাক রিকোয়েস্ট' : 'Request Callback'}
        >
          <PhoneCall className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full" />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md border-0 bg-background shadow-xl z-[100]">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {language === 'bn' ? 'ধন্যবাদ!' : 'Thank You!'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {language === 'bn' 
                ? 'আমাদের টিম শীঘ্রই আপনাকে কল করবে।'
                : 'Our team will call you shortly.'}
            </p>
          </div>
        ) : (
          <>
            <DialogHeader className="text-center pb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent/80 flex items-center justify-center mx-auto mb-3">
                <PhoneCall className="w-7 h-7 text-white" />
              </div>
              <DialogTitle className="text-xl">
                {language === 'bn' ? 'কল ব্যাক রিকোয়েস্ট করুন' : 'Request a Callback'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'bn' 
                  ? 'আপনার নম্বর দিন, আমরা কল করব!'
                  : 'Leave your number, we will call you!'}
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <Label htmlFor="float-name" className="text-sm">
                  {language === 'bn' ? 'আপনার নাম' : 'Your Name'}
                </Label>
                <Input
                  id="float-name"
                  placeholder={language === 'bn' ? 'নাম লিখুন' : 'Enter name'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="float-phone" className="text-sm">
                  {language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}
                </Label>
                <Input
                  id="float-phone"
                  placeholder="01XXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </div>

              <div>
                <Label htmlFor="float-service" className="text-sm">
                  {language === 'bn' ? 'সার্ভিস নির্বাচন' : 'Select Service'}
                </Label>
                <Select
                  value={formData.service}
                  onValueChange={(value) => setFormData({ ...formData, service: value })}
                >
                  <SelectTrigger className={errors.service ? 'border-destructive' : ''}>
                    <SelectValue placeholder={language === 'bn' ? 'সার্ভিস বাছুন' : 'Choose service'} />
                  </SelectTrigger>
                  <SelectContent 
                    position="popper" 
                    sideOffset={4}
                    className="z-[200] bg-popover border border-border shadow-lg"
                  >
                    {services.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.service && <p className="text-xs text-destructive mt-1">{errors.service}</p>}
              </div>

              <Button type="submit" className="w-full gradient-button h-11" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...'}
                  </span>
                ) : (
                  <>
                    {language === 'bn' ? 'কল রিকোয়েস্ট করুন' : 'Request Call'}
                    <Send className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {language === 'bn' ? '🕐 ৩০ মিনিটের মধ্যে কল করা হবে' : '🕐 We call within 30 minutes'}
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
