import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, CheckCircle, PhoneCall } from 'lucide-react';
import { leadService } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const leadSchema = z.object({
  name: z.string().trim().min(2, 'নাম অন্তত ২ অক্ষর হতে হবে').max(100),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, 'সঠিক ফোন নম্বর দিন'),
  email: z.string().email('সঠিক ইমেইল দিন').optional().or(z.literal('')),
  message: z.string().optional(),
});

interface ServicePageLeadFormProps {
  serviceType: string;
  serviceName?: string;
  className?: string;
}

export function ServicePageLeadForm({ serviceType, serviceName, className = '' }: ServicePageLeadFormProps) {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = leadSchema.parse(formData);
      setIsSubmitting(true);

      const result = await leadService.createLead({
        name: validated.name,
        phone: validated.phone,
        email: validated.email || undefined,
        service_interest: serviceType,
        source: `service_page_${serviceType}`,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setIsSuccess(true);
      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'শীঘ্রই যোগাযোগ করা হবে।' : 'We will contact you soon.',
      });
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

  if (isSuccess) {
    return (
      <div className={`glass-premium p-8 rounded-2xl text-center ${className}`}>
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">
          {language === 'bn' ? 'ধন্যবাদ!' : 'Thank You!'}
        </h3>
        <p className="text-muted-foreground">
          {language === 'bn' 
            ? 'আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।'
            : 'Our team will contact you shortly.'}
        </p>
      </div>
    );
  }

  return (
    <div className={`glass-premium p-6 md:p-8 rounded-2xl ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <PhoneCall className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg">
            {language === 'bn' ? 'ফ্রি কনসাল্টেশন নিন' : 'Get Free Consultation'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {serviceName || (language === 'bn' ? 'আমাদের সাথে যোগাযোগ করুন' : 'Contact us today')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor={`service-name-${serviceType}`} className="text-sm font-medium">
            {language === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
          </Label>
          <Input
            id={`service-name-${serviceType}`}
            placeholder={language === 'bn' ? 'নাম লিখুন' : 'Enter your name'}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`mt-1 ${errors.name ? 'border-destructive' : ''}`}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor={`service-phone-${serviceType}`} className="text-sm font-medium">
            {language === 'bn' ? 'ফোন নম্বর *' : 'Phone Number *'}
          </Label>
          <Input
            id={`service-phone-${serviceType}`}
            placeholder="01XXXXXXXXX"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`mt-1 ${errors.phone ? 'border-destructive' : ''}`}
          />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
        </div>

        <div>
          <Label htmlFor={`service-email-${serviceType}`} className="text-sm font-medium">
            {language === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
          </Label>
          <Input
            id={`service-email-${serviceType}`}
            type="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`mt-1 ${errors.email ? 'border-destructive' : ''}`}
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor={`service-message-${serviceType}`} className="text-sm font-medium">
            {language === 'bn' ? 'আপনার প্রয়োজন (ঐচ্ছিক)' : 'Your Requirements (Optional)'}
          </Label>
          <Textarea
            id={`service-message-${serviceType}`}
            placeholder={language === 'bn' ? 'আপনার প্রজেক্ট সম্পর্কে বলুন...' : 'Tell us about your project...'}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="mt-1 min-h-[80px]"
            rows={3}
          />
        </div>

        <Button
          type="submit"
          className="w-full gradient-button h-12"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...'}
            </span>
          ) : (
            <>
              {language === 'bn' ? 'রিকোয়েস্ট পাঠান' : 'Submit Request'}
              <Send className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          {language === 'bn' 
            ? '🔒 আপনার তথ্য সম্পূর্ণ নিরাপদ'
            : '🔒 Your information is completely safe'}
        </p>
      </form>
    </div>
  );
}
