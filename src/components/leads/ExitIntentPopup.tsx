import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Gift, Send, CheckCircle } from 'lucide-react';
import { leadService } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import { systemSettingsService } from '@/services/settings';

const leadSchema = z.object({
  name: z.string().trim().min(2, 'নাম অন্তত ২ অক্ষর হতে হবে').max(100),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, 'সঠিক ফোন নম্বর দিন'),
  service: z.string().min(1, 'সার্ভিস নির্বাচন করুন'),
});

interface ExitPopupSettings {
  enabled: boolean;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  buttonTextBn: string;
  buttonTextEn: string;
  delaySeconds: number;
}

export function ExitIntentPopup() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', service: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [popupSettings, setPopupSettings] = useState<ExitPopupSettings | null>(null);

  const services = [
    { value: 'domain-hosting', label: language === 'bn' ? 'ডোমেইন ও হোস্টিং' : 'Domain & Hosting' },
    { value: 'web-development', label: language === 'bn' ? 'ওয়েব ডেভেলপমেন্ট' : 'Web Development' },
    { value: 'software', label: language === 'bn' ? 'সফটওয়্যার ডেভেলপমেন্ট' : 'Software Development' },
    { value: 'digital-marketing', label: language === 'bn' ? 'ডিজিটাল মার্কেটিং' : 'Digital Marketing' },
  ];

  // Load settings from DB
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [enabled, titleBn, titleEn, subtitleBn, subtitleEn, buttonBn, buttonEn, delay] = await Promise.all([
          systemSettingsService.getSetting<boolean>('exit_popup_enabled'),
          systemSettingsService.getSetting<string>('exit_popup_title_bn'),
          systemSettingsService.getSetting<string>('exit_popup_title_en'),
          systemSettingsService.getSetting<string>('exit_popup_subtitle_bn'),
          systemSettingsService.getSetting<string>('exit_popup_subtitle_en'),
          systemSettingsService.getSetting<string>('exit_popup_button_text_bn'),
          systemSettingsService.getSetting<string>('exit_popup_button_text_en'),
          systemSettingsService.getSetting<number>('exit_popup_delay_seconds'),
        ]);

        setPopupSettings({
          enabled: enabled !== false,
          titleBn: titleBn || 'যাবেন না!',
          titleEn: titleEn || 'Wait!',
          subtitleBn: subtitleBn || 'ফ্রি কনসাল্টেশন নিন এবং ১০% ডিসকাউন্ট পান!',
          subtitleEn: subtitleEn || 'Get free consultation + 10% discount!',
          buttonTextBn: buttonBn || 'ডিসকাউন্ট নিন',
          buttonTextEn: buttonEn || 'Get Discount',
          delaySeconds: delay || 10,
        });
      } catch {
        // Fallback defaults
        setPopupSettings({
          enabled: true,
          titleBn: 'যাবেন না!',
          titleEn: 'Wait!',
          subtitleBn: 'ফ্রি কনসাল্টেশন নিন এবং ১০% ডিসকাউন্ট পান!',
          subtitleEn: 'Get free consultation + 10% discount!',
          buttonTextBn: 'ডিসকাউন্ট নিন',
          buttonTextEn: 'Get Discount',
          delaySeconds: 10,
        });
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (!popupSettings || !popupSettings.enabled) return;

    const wasShown = sessionStorage.getItem('exitPopupShown');
    if (wasShown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
        sessionStorage.setItem('exitPopupShown', 'true');
        // Remove immediately to prevent shaking from repeated triggers
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    const timeout = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, (popupSettings.delaySeconds || 10) * 1000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown, popupSettings]);

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
        source: 'exit_popup',
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setIsSuccess(true);
      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'শীঘ্রই যোগাযোগ করা হবে।' : 'We will contact you soon.',
      });

      setTimeout(() => setIsOpen(false), 3000);
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

  // Don't render if disabled or not loaded yet
  if (!popupSettings || !popupSettings.enabled) return null;

  const title = language === 'bn' ? popupSettings.titleBn : popupSettings.titleEn;
  const subtitle = language === 'bn' ? popupSettings.subtitleBn : popupSettings.subtitleEn;
  const buttonText = language === 'bn' ? popupSettings.buttonTextBn : popupSettings.buttonTextEn;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-0 glass-premium">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
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
                ? 'আমাদের টিম শীঘ্রই যোগাযোগ করবে।'
                : 'Our team will contact you shortly.'}
            </p>
          </div>
        ) : (
          <>
            <DialogHeader className="text-center pb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent/80 flex items-center justify-center mx-auto mb-3">
                <Gift className="w-7 h-7 text-white" />
              </div>
              <DialogTitle className="text-xl">{title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <Label htmlFor="exit-name" className="text-sm">
                  {language === 'bn' ? 'নাম' : 'Name'}
                </Label>
                <Input
                  id="exit-name"
                  placeholder={language === 'bn' ? 'আপনার নাম' : 'Your name'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="exit-phone" className="text-sm">
                  {language === 'bn' ? 'ফোন' : 'Phone'}
                </Label>
                <Input
                  id="exit-phone"
                  placeholder="01XXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </div>

              <div>
                <Label htmlFor="exit-service" className="text-sm">
                  {language === 'bn' ? 'সার্ভিস' : 'Service'}
                </Label>
                <Select
                  value={formData.service}
                  onValueChange={(value) => setFormData({ ...formData, service: value })}
                >
                  <SelectTrigger className={errors.service ? 'border-destructive' : ''}>
                    <SelectValue placeholder={language === 'bn' ? 'বাছুন' : 'Select'} />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.service && <p className="text-xs text-destructive mt-1">{errors.service}</p>}
              </div>

              <Button type="submit" className="w-full gradient-button" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...'}
                  </span>
                ) : (
                  <>
                    {buttonText}
                    <Send className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
