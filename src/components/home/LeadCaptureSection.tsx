import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, CheckCircle, Sparkles, Users, Headphones, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const leadSchema = z.object({
  name: z.string().trim().min(2, 'নাম অন্তত ২ অক্ষর হতে হবে').max(100),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, 'সঠিক ফোন নম্বর দিন'),
  service: z.string().min(1, 'সার্ভিস নির্বাচন করুন'),
});

export function LeadCaptureSection() {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const services = [
    { value: 'domain-hosting', label: language === 'bn' ? 'ডোমেইন ও হোস্টিং' : 'Domain & Hosting' },
    { value: 'web-development', label: language === 'bn' ? 'ওয়েব ডেভেলপমেন্ট' : 'Web Development' },
    { value: 'software', label: language === 'bn' ? 'সফটওয়্যার ডেভেলপমেন্ট' : 'Software Development' },
    { value: 'digital-marketing', label: language === 'bn' ? 'ডিজিটাল মার্কেটিং' : 'Digital Marketing' },
    { value: 'other', label: language === 'bn' ? 'অন্যান্য' : 'Other' },
  ];

  const benefits = [
    { icon: Users, text: language === 'bn' ? '৫০০+ সফল প্রজেক্ট' : '500+ Successful Projects' },
    { icon: Headphones, text: language === 'bn' ? '২৪/৭ সাপোর্ট' : '24/7 Support' },
    { icon: Shield, text: language === 'bn' ? '১০০% সন্তুষ্টি' : '100% Satisfaction' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = leadSchema.parse(formData);
      setIsSubmitting(true);

      // Save lead to contact_messages table
      const { error } = await supabase.from('contact_messages').insert({
        name: validated.name,
        phone: validated.phone,
        email: `${validated.phone}@lead.digiwebdex.com`,
        subject: `Lead: ${validated.service}`,
        message: `Service Interest: ${validated.service}`,
      });

      if (error) throw error;

      // Trigger notification (via edge function if configured)
      try {
        await supabase.functions.invoke('contact-notification', {
          body: {
            type: 'lead',
            name: validated.name,
            phone: validated.phone,
            service: validated.service,
          },
        });
      } catch {
        // Notification optional - don't fail the submission
      }

      setIsSuccess(true);
      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব।' : 'We will contact you shortly.',
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
          description: language === 'bn' ? 'আবার চেষ্টা করুন।' : 'Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <section className="section-padding relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="container-custom">
          <div className="max-w-lg mx-auto text-center glass-premium p-10 rounded-3xl animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              {language === 'bn' ? 'ধন্যবাদ!' : 'Thank You!'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'bn' 
                ? 'আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।'
                : 'Our team will contact you shortly.'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-accent/5" />
      <div className="absolute inset-0 mesh-gradient opacity-50" />
      
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Left - Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium text-primary text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              {language === 'bn' ? 'ফ্রি কনসাল্টেশন' : 'Free Consultation'}
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'bn' ? (
                <>আপনার প্রজেক্ট নিয়ে <span className="gradient-text">আলোচনা করুন</span></>
              ) : (
                <>Discuss Your <span className="gradient-text">Project With Us</span></>
              )}
            </h2>
            
            <p className="text-muted-foreground mb-8">
              {language === 'bn'
                ? 'ফোন নম্বর দিন, আমাদের এক্সপার্ট টিম আপনার সাথে যোগাযোগ করবে।'
                : 'Leave your phone number and our expert team will contact you.'}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Form */}
          <div className="glass-premium p-8 rounded-3xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="lead-name" className="text-sm font-medium mb-2 block">
                  {language === 'bn' ? 'আপনার নাম' : 'Your Name'}
                </Label>
                <Input
                  id="lead-name"
                  placeholder={language === 'bn' ? 'নাম লিখুন' : 'Enter your name'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="lead-phone" className="text-sm font-medium mb-2 block">
                  {language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}
                </Label>
                <Input
                  id="lead-phone"
                  placeholder="01XXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </div>

              <div>
                <Label htmlFor="lead-service" className="text-sm font-medium mb-2 block">
                  {language === 'bn' ? 'সার্ভিস নির্বাচন করুন' : 'Select Service'}
                </Label>
                <Select
                  value={formData.service}
                  onValueChange={(value) => setFormData({ ...formData, service: value })}
                >
                  <SelectTrigger className={errors.service ? 'border-destructive' : ''}>
                    <SelectValue placeholder={language === 'bn' ? 'সার্ভিস বাছুন' : 'Choose service'} />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.service && <p className="text-xs text-destructive mt-1">{errors.service}</p>}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full gradient-button h-12 text-base group"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...'}
                  </span>
                ) : (
                  <>
                    {language === 'bn' ? 'কল ব্যাক রিকোয়েস্ট করুন' : 'Request Callback'}
                    <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {language === 'bn'
                  ? '🔒 আপনার তথ্য সম্পূর্ণ নিরাপদ থাকবে'
                  : '🔒 Your information is completely safe'}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
