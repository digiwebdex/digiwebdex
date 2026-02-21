import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DIGIWEBDEX_CONTACT } from '@/services/contactService';
import { domainService, type DomainSearchResult } from '@/services/domainService';
import {
  Globe, Server, Search, Check, X, ChevronLeft, ChevronRight, Loader2,
  CheckCircle2, Smartphone, Building2, Copy, Upload, HandCoins,
  ShieldCheck, AlertCircle, Package, CreditCard, User, Eye
} from 'lucide-react';

// ─── Schema ───
const detailsSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(10).max(20),
  email: z.string().trim().email().max(255),
  company: z.string().trim().max(100).optional(),
});
type DetailsForm = z.infer<typeof detailsSchema>;

type PaymentMethod = 'bkash_personal' | 'bank_transfer' | 'cod';

// ─── Hosting Plans ───
const hostingPlans = [
  { id: 'starter', name: { en: 'Starter', bn: 'স্টার্টার' }, price: 3500, desc: { en: '5GB SSD, 50GB BW, Free SSL', bn: '৫GB SSD, ৫০GB BW, ফ্রি SSL' }, features: { en: ['5 GB SSD Storage', '50 GB Bandwidth', 'Free SSL', '5 Email Accounts', 'cPanel Access'], bn: ['৫ GB SSD', '৫০ GB ব্যান্ডউইথ', 'ফ্রি SSL', '৫টি ইমেইল', 'cPanel'] } },
  { id: 'business', name: { en: 'Business', bn: 'বিজনেস' }, price: 5900, isPopular: true, desc: { en: '10GB SSD, Unlimited BW, CDN', bn: '১০GB SSD, আনলিমিটেড BW, CDN' }, features: { en: ['10 GB SSD Storage', 'Unlimited Bandwidth', 'Free SSL & CDN', '20 Email Accounts', 'Priority Support'], bn: ['১০ GB SSD', 'আনলিমিটেড BW', 'ফ্রি SSL ও CDN', '২০টি ইমেইল', 'অগ্রাধিকার সাপোর্ট'] } },
  { id: 'premium', name: { en: 'Premium', bn: 'প্রিমিয়াম' }, price: 9900, desc: { en: '20GB NVMe, Unlimited, Backup', bn: '২০GB NVMe, আনলিমিটেড, ব্যাকআপ' }, features: { en: ['20 GB NVMe Storage', 'Unlimited Bandwidth', 'Free SSL, CDN & Backup', 'Unlimited Emails', 'Dedicated Support'], bn: ['২০ GB NVMe', 'আনলিমিটেড BW', 'SSL, CDN ও ব্যাকআপ', 'আনলিমিটেড ইমেইল', 'ডেডিকেটেড সাপোর্ট'] } },
];

const paymentInfo = {
  bkash_personal: { number: '01674533303', instructions: { en: ['Open bKash app', 'Go to "Send Money"', 'Enter number above', 'Add Order ID in reference', 'Complete & screenshot'], bn: ['বিকাশ অ্যাপ খুলুন', '"Send Money" এ যান', 'উপরের নম্বরে পাঠান', 'রেফারেন্সে Order ID দিন', 'সম্পন্ন করে স্ক্রিনশট নিন'] } },
  bank_transfer: { bankName: 'Pubali Bank Ltd.', accountName: 'Md. Iqbal Hossain', accountNumber: '2706101077904', branch: 'Asad Avenue Branch', routingNumber: '175260162', instructions: { en: ['Transfer to account above', 'Use Order ID as reference', 'Keep receipt/screenshot'], bn: ['উপরের একাউন্টে টাকা পাঠান', 'রেফারেন্সে Order ID দিন', 'রসিদ/স্ক্রিনশট রাখুন'] } },
  cod: { instructions: { en: ['Place your order now', 'Our team will contact you', 'Pay cash on delivery', 'Get receipt upon payment'], bn: ['এখনই অর্ডার করুন', 'আমাদের টিম যোগাযোগ করবে', 'সেবা প্রদানের সময় পরিশোধ করুন', 'পেমেন্টের রসিদ নিন'] } },
};

const STEPS = [
  { num: 1, label_en: 'Domain', label_bn: 'ডোমেইন', icon: Globe },
  { num: 2, label_en: 'Hosting', label_bn: 'হোস্টিং', icon: Server },
  { num: 3, label_en: 'Review', label_bn: 'যাচাই', icon: Eye },
  { num: 4, label_en: 'Details', label_bn: 'তথ্য', icon: User },
  { num: 5, label_en: 'Payment', label_bn: 'পেমেন্ট', icon: CreditCard },
];

export default function DomainHostingCheckout() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const lang = language === 'bn' ? 'bn' : 'en';
  const basePath = language === 'en' ? '/en' : '/bn';

  const [step, setStep] = useState(1);

  // Domain state
  const [domainQuery, setDomainQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [domainResults, setDomainResults] = useState<{ primary: DomainSearchResult; alternatives: DomainSearchResult[] } | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<DomainSearchResult | null>(null);
  const [skipDomain, setSkipDomain] = useState(false);
  const [existingDomain, setExistingDomain] = useState('');
  const [domainMode, setDomainMode] = useState<'new' | 'existing'>('new');

  // Hosting state
  const [selectedPlan, setSelectedPlan] = useState<typeof hostingPlans[0] | null>(null);

  // Verification state
  const [verified, setVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const form = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { name: '', phone: '', email: user?.email || '', company: '' },
  });

  useEffect(() => { if (user?.email) form.setValue('email', user.email); }, [user]);

  const fmt = (n: number) => new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-US', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(n);
  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success(lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!'); };

  const getTotal = () => {
    let total = selectedPlan?.price || 0;
    if (domainMode === 'new' && selectedDomain) total += selectedDomain.price;
    return total;
  };

  // ─── Domain search ───
  const searchDomain = async () => {
    if (!domainQuery.trim()) return;
    setSearching(true);
    setDomainResults(null);
    try {
      const results = await domainService.searchDomain(domainQuery, user?.id);
      setDomainResults(results);
    } catch {
      toast.error(lang === 'bn' ? 'ডোমেইন খুঁজতে সমস্যা' : 'Domain search failed');
    } finally {
      setSearching(false);
    }
  };

  // ─── Verification (email-based) ───
  const sendVerification = async () => {
    const email = form.getValues('email');
    if (!email || !z.string().email().safeParse(email).success) {
      toast.error(lang === 'bn' ? 'সঠিক ইমেইল দিন' : 'Enter a valid email');
      return;
    }
    setCodeSent(true);
    // Generate a simple 6-digit code and store it (in production, this would send via email)
    const code = String(Math.floor(100000 + Math.random() * 900000));
    sessionStorage.setItem('_vc', code);
    toast.success(lang === 'bn' ? `যাচাইকরণ কোড: ${code} (ডেমো)` : `Verification code: ${code} (Demo)`);
  };

  const verifyCode = () => {
    setVerifying(true);
    setTimeout(() => {
      const stored = sessionStorage.getItem('_vc');
      if (verificationCode === stored) {
        setVerified(true);
        toast.success(lang === 'bn' ? 'যাচাই সফল!' : 'Verified!');
      } else {
        toast.error(lang === 'bn' ? 'ভুল কোড' : 'Invalid code');
      }
      setVerifying(false);
    }, 500);
  };

  // ─── Navigation ───
  const next = () => {
    if (step === 1) {
      if (domainMode === 'new' && !selectedDomain) {
        toast.error(lang === 'bn' ? 'একটি ডোমেইন বেছে নিন' : 'Select a domain');
        return;
      }
      if (domainMode === 'existing' && !existingDomain.match(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/i)) {
        toast.error(lang === 'bn' ? 'সঠিক ডোমেইন দিন' : 'Enter a valid domain');
        return;
      }
    }
    if (step === 2 && !selectedPlan) {
      toast.error(lang === 'bn' ? 'একটি হোস্টিং প্ল্যান বেছে নিন' : 'Select a hosting plan');
      return;
    }
    if (step === 4) {
      form.handleSubmit(() => setStep(5))();
      return;
    }
    setStep(s => Math.min(s + 1, 5));
  };

  // ─── Submit ───
  const submitOrder = async () => {
    const data = form.getValues();
    if (!selectedPlan || !paymentMethod) return;
    if (!verified) {
      toast.error(lang === 'bn' ? 'প্রথমে যাচাই করুন' : 'Please verify first');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data: orderNum } = await supabase.rpc('generate_order_number');
      const genNum = orderNum || `ORD-${Date.now()}`;
      const total = getTotal();
      const domainName = domainMode === 'new' ? selectedDomain?.domain : existingDomain;

      const { data: order, error } = await supabase.from('orders').insert({
        order_number: genNum,
        user_id: user?.id || null,
        service_type: 'hosting' as const,
        billing_type: 'recurring' as const,
        subtotal: total, total,
        status: 'pending' as const,
        notes: `Bundle: Domain+Hosting\nDomain: ${domainName} (${domainMode})\nHosting: ${selectedPlan.name.en}\nCustomer: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}`,
      }).select().single();

      if (error) throw error;

      let screenshotUrl: string | null = null;
      if (screenshotFile) {
        const ext = screenshotFile.name.split('.').pop();
        const path = `${order.id}/${Date.now()}.${ext}`;
        const { error: ue } = await supabase.storage.from('payment-proofs').upload(path, screenshotFile);
        if (!ue) screenshotUrl = supabase.storage.from('payment-proofs').getPublicUrl(path).data.publicUrl;
      }

      await supabase.from('manual_payments').insert({
        order_id: order.id,
        user_id: user?.id || '00000000-0000-0000-0000-000000000000',
        method: paymentMethod,
        transaction_id: `PENDING-${genNum}`,
        amount: total,
        screenshot_url: screenshotUrl,
        notes: `Bundle checkout: ${data.name}, ${data.phone}`,
        status: 'pending',
      });

      const meta = [
        { order_id: order.id, meta_key: 'customer_name', meta_value: data.name },
        { order_id: order.id, meta_key: 'customer_phone', meta_value: data.phone },
        { order_id: order.id, meta_key: 'customer_email', meta_value: data.email },
        { order_id: order.id, meta_key: 'domain_name', meta_value: domainName || '' },
        { order_id: order.id, meta_key: 'domain_type', meta_value: domainMode },
        { order_id: order.id, meta_key: 'hosting_plan', meta_value: selectedPlan.name.en },
        { order_id: order.id, meta_key: 'payment_method', meta_value: paymentMethod },
        { order_id: order.id, meta_key: 'verified', meta_value: 'true' },
      ];
      if (domainMode === 'new' && selectedDomain) {
        meta.push({ order_id: order.id, meta_key: 'domain_price', meta_value: String(selectedDomain.price) });
      }
      await supabase.from('order_meta').insert(meta);

      try {
        await supabase.functions.invoke('contact-notification', {
          body: { type: 'order_created', orderNumber: genNum, customerName: data.name, customerPhone: data.phone, customerEmail: data.email, packageName: `${selectedPlan.name.en} + Domain`, amount: total, paymentMethod },
        });
      } catch {}

      await supabase.from('notifications').insert({
        user_id: user?.id || null,
        notification_type: 'in_app',
        recipient: 'admin',
        subject: `New Bundle Order: ${genNum}`,
        body: `Domain+Hosting from ${data.name}`,
        status: 'pending',
      });

      setOrderNumber(genNum);
      setOrderComplete(true);
      toast.success(lang === 'bn' ? 'অর্ডার সফল!' : 'Order placed!');
    } catch (err) {
      console.error(err);
      toast.error(lang === 'bn' ? 'অর্ডারে সমস্যা' : 'Order failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Order Complete ───
  if (orderComplete) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto py-12 text-center">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{lang === 'bn' ? 'অর্ডার সফল!' : 'Order Successful!'}</h2>
          <p className="text-muted-foreground mb-4">{lang === 'bn' ? 'আপনার অর্ডার নম্বর:' : 'Your order number:'}</p>
          <div className="bg-primary/10 rounded-xl p-5 mb-6">
            <code className="text-xl font-bold text-primary">{orderNumber}</code>
          </div>
          <p className="text-sm text-muted-foreground mb-8">{lang === 'bn' ? 'আমরা শীঘ্রই যোগাযোগ করব।' : 'We will contact you soon.'}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => window.location.href = `${basePath}/dashboard/orders`}>
              {lang === 'bn' ? 'অর্ডার দেখুন' : 'View Orders'}
            </Button>
            <Button className="gradient-button" onClick={() => window.open(`https://wa.me/${DIGIWEBDEX_CONTACT.whatsapp}?text=Order: ${orderNumber}`, '_blank')}>
              WhatsApp
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">
            {lang === 'bn' ? 'ডোমেইন + হোস্টিং বান্ডেল চেকআউট' : 'Domain + Hosting Bundle Checkout'}
          </h1>
          <p className="text-muted-foreground">
            {lang === 'bn' ? 'একসাথে ডোমেইন ও হোস্টিং সেটআপ করুন — ধাপে ধাপে যাচাই সহ' : 'Set up domain & hosting together — with step-by-step verification'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  step > s.num ? 'bg-primary text-primary-foreground' :
                  step === s.num ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                  'bg-muted text-muted-foreground'
                )}>
                  {step > s.num ? <Check className="h-5 w-5" /> : <s.icon className="h-4 w-4" />}
                </div>
                <span className={cn('text-xs font-medium hidden sm:block', step >= s.num ? 'text-foreground' : 'text-muted-foreground')}>
                  {lang === 'bn' ? s.label_bn : s.label_en}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-2', step > s.num ? 'bg-primary' : 'bg-muted')} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ═══ Step 1: Domain ═══ */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                {lang === 'bn' ? 'ডোমেইন নির্বাচন করুন' : 'Select Your Domain'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mode toggle */}
              <div className="flex gap-3">
                <Button variant={domainMode === 'new' ? 'default' : 'outline'} className="flex-1" onClick={() => setDomainMode('new')}>
                  {lang === 'bn' ? 'নতুন ডোমেইন কিনুন' : 'Buy New Domain'}
                </Button>
                <Button variant={domainMode === 'existing' ? 'default' : 'outline'} className="flex-1" onClick={() => setDomainMode('existing')}>
                  {lang === 'bn' ? 'পূর্বের ডোমেইন আছে' : 'Use Existing Domain'}
                </Button>
              </div>

              {domainMode === 'new' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={domainQuery}
                        onChange={e => setDomainQuery(e.target.value.toLowerCase().replace(/\s/g, ''))}
                        placeholder={lang === 'bn' ? 'ডোমেইন নাম খুঁজুন...' : 'Search domain name...'}
                        className="pl-9"
                        onKeyDown={e => e.key === 'Enter' && searchDomain()}
                      />
                    </div>
                    <Button onClick={searchDomain} disabled={!domainQuery.trim() || searching}>
                      {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : lang === 'bn' ? 'খুঁজুন' : 'Search'}
                    </Button>
                  </div>

                  {domainResults && (
                    <div className="space-y-2">
                      {/* Primary */}
                      <div
                        className={cn(
                          'flex items-center justify-between p-4 rounded-xl border-2 transition-all',
                          domainResults.primary.isAvailable ? 'cursor-pointer hover:border-primary' : 'opacity-60',
                          selectedDomain?.domain === domainResults.primary.domain && 'border-primary bg-primary/5'
                        )}
                        onClick={() => domainResults.primary.isAvailable && setSelectedDomain(domainResults.primary)}
                      >
                        <div className="flex items-center gap-3">
                          {domainResults.primary.isAvailable ? <Check className="h-5 w-5 text-primary" /> : <X className="h-5 w-5 text-destructive" />}
                          <span className="font-semibold text-lg">{domainResults.primary.domain}</span>
                          {domainResults.primary.isAvailable && <Badge className="bg-emerald-500">{lang === 'bn' ? 'পাওয়া যায়' : 'Available'}</Badge>}
                        </div>
                        <span className="font-bold text-primary text-lg">{fmt(domainResults.primary.price)}<span className="text-xs text-muted-foreground">/{lang === 'bn' ? 'বছর' : 'yr'}</span></span>
                      </div>
                      {/* Alternatives */}
                      {domainResults.alternatives.filter(a => a.isAvailable).slice(0, 4).map(alt => (
                        <div
                          key={alt.domain}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:border-primary transition-all',
                            selectedDomain?.domain === alt.domain && 'border-primary bg-primary/5'
                          )}
                          onClick={() => setSelectedDomain(alt)}
                        >
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="font-medium">{alt.domain}</span>
                          </div>
                          <span className="font-bold text-primary">{fmt(alt.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedDomain && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{selectedDomain.domain}</span>
                      <Badge className="ml-auto">{fmt(selectedDomain.price)}/{lang === 'bn' ? 'বছর' : 'yr'}</Badge>
                    </div>
                  )}
                </div>
              )}

              {domainMode === 'existing' && (
                <div className="space-y-3">
                  <Label>{lang === 'bn' ? 'আপনার ডোমেইন নাম' : 'Your Domain Name'}</Label>
                  <Input
                    value={existingDomain}
                    onChange={e => setExistingDomain(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    placeholder="example.com"
                  />
                  <p className="text-xs text-muted-foreground">{lang === 'bn' ? 'http:// বা www ছাড়া শুধু ডোমেইন নাম দিন' : 'Enter domain name only, without http:// or www'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ═══ Step 2: Hosting Plan ═══ */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                {lang === 'bn' ? 'হোস্টিং প্ল্যান বেছে নিন' : 'Choose Hosting Plan'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {hostingPlans.map(plan => (
                  <Card
                    key={plan.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-lg relative',
                      selectedPlan?.id === plan.id && 'border-primary ring-2 ring-primary/20',
                      plan.isPopular && 'border-primary/50'
                    )}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    {plan.isPopular && (
                      <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary">
                        {lang === 'bn' ? 'জনপ্রিয়' : 'Popular'}
                      </Badge>
                    )}
                    <CardContent className="p-5 pt-6 space-y-4">
                      <div className="text-center">
                        <h3 className="font-bold text-lg">{plan.name[lang]}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{plan.desc[lang]}</p>
                        <div className="mt-3">
                          <span className="text-3xl font-extrabold text-primary">{fmt(plan.price)}</span>
                          <span className="text-sm text-muted-foreground">/{lang === 'bn' ? 'বছর' : 'year'}</span>
                        </div>
                      </div>
                      <Separator />
                      <ul className="space-y-2">
                        {plan.features[lang].map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      {selectedPlan?.id === plan.id && (
                        <div className="text-center">
                          <Badge className="bg-primary">{lang === 'bn' ? 'নির্বাচিত' : 'Selected'}</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ═══ Step 3: Review & Verify ═══ */}
        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  {lang === 'bn' ? 'অর্ডার সারাংশ ও যাচাই' : 'Order Summary & Verification'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Domain summary */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{lang === 'bn' ? 'ডোমেইন' : 'Domain'}</p>
                      <p className="text-sm text-muted-foreground">
                        {domainMode === 'new' ? selectedDomain?.domain : existingDomain}
                        <Badge variant="outline" className="ml-2 text-xs">{domainMode === 'new' ? (lang === 'bn' ? 'নতুন' : 'New') : (lang === 'bn' ? 'বিদ্যমান' : 'Existing')}</Badge>
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-primary">
                    {domainMode === 'new' && selectedDomain ? fmt(selectedDomain.price) : (lang === 'bn' ? 'ফ্রি' : 'Free')}
                  </span>
                </div>

                {/* Hosting summary */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{lang === 'bn' ? 'হোস্টিং' : 'Hosting'}</p>
                      <p className="text-sm text-muted-foreground">{selectedPlan?.name[lang]} — {selectedPlan?.desc[lang]}</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary">{selectedPlan ? fmt(selectedPlan.price) : ''}</span>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10">
                  <span className="text-lg font-bold">{lang === 'bn' ? 'মোট' : 'Total'}</span>
                  <span className="text-2xl font-extrabold text-primary">{fmt(getTotal())}<span className="text-sm font-normal text-muted-foreground">/{lang === 'bn' ? 'বছর' : 'yr'}</span></span>
                </div>
              </CardContent>
            </Card>

            {/* Email Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  {lang === 'bn' ? 'ইমেইল যাচাই' : 'Email Verification'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {verified ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    <div>
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400">{lang === 'bn' ? 'যাচাই সম্পন্ন!' : 'Verified!'}</p>
                      <p className="text-sm text-muted-foreground">{form.getValues('email')}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Input
                        {...form.register('email')}
                        placeholder={lang === 'bn' ? 'আপনার ইমেইল' : 'Your email'}
                        disabled={codeSent}
                      />
                      {!codeSent && (
                        <Button onClick={sendVerification}>
                          {lang === 'bn' ? 'কোড পাঠান' : 'Send Code'}
                        </Button>
                      )}
                    </div>
                    {codeSent && (
                      <div className="flex gap-2">
                        <Input
                          value={verificationCode}
                          onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="text-center tracking-[0.5em] font-mono text-lg"
                        />
                        <Button onClick={verifyCode} disabled={verificationCode.length !== 6 || verifying}>
                          {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : lang === 'bn' ? 'যাচাই' : 'Verify'}
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {lang === 'bn' ? 'অর্ডার কনফার্মের জন্য ইমেইল যাচাই করুন' : 'Verify email to confirm your order'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══ Step 4: Customer Details ═══ */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {lang === 'bn' ? 'আপনার তথ্য' : 'Your Details'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>{lang === 'bn' ? 'নাম' : 'Full Name'} *</Label>
                    <Input {...form.register('name')} placeholder={lang === 'bn' ? 'আপনার নাম' : 'Your name'} />
                    {form.formState.errors.name && <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>}
                  </div>
                  <div>
                    <Label>{lang === 'bn' ? 'ফোন' : 'Phone'} *</Label>
                    <Input {...form.register('phone')} placeholder="01XXXXXXXXX" />
                    {form.formState.errors.phone && <p className="text-xs text-destructive mt-1">{form.formState.errors.phone.message}</p>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>{lang === 'bn' ? 'ইমেইল' : 'Email'} *</Label>
                    <Input {...form.register('email')} disabled className="bg-muted" />
                    {verified && <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{lang === 'bn' ? 'যাচাইকৃত' : 'Verified'}</p>}
                  </div>
                  <div>
                    <Label>{lang === 'bn' ? 'কোম্পানি' : 'Company'}</Label>
                    <Input {...form.register('company')} placeholder={lang === 'bn' ? 'ঐচ্ছিক' : 'Optional'} />
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ═══ Step 5: Payment ═══ */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                {lang === 'bn' ? 'পেমেন্ট' : 'Payment'} — {fmt(getTotal())}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment method selection */}
              <div className="grid gap-3 sm:grid-cols-3">
                {([
                  { key: 'bkash_personal' as const, icon: Smartphone, label: { en: 'bKash', bn: 'বিকাশ' }, color: 'text-pink-500' },
                  { key: 'bank_transfer' as const, icon: Building2, label: { en: 'Bank Transfer', bn: 'ব্যাংক ট্রান্সফার' }, color: 'text-blue-500' },
                  { key: 'cod' as const, icon: HandCoins, label: { en: 'Cash Payment', bn: 'ক্যাশ পেমেন্ট' }, color: 'text-amber-500' },
                ]).map(m => (
                  <Card
                    key={m.key}
                    className={cn('cursor-pointer transition-all hover:shadow-md', paymentMethod === m.key && 'border-primary ring-2 ring-primary/20')}
                    onClick={() => setPaymentMethod(m.key)}
                  >
                    <CardContent className="p-4 text-center">
                      <m.icon className={cn('h-8 w-8 mx-auto mb-2', m.color)} />
                      <p className="font-medium text-sm">{m.label[lang]}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Payment details */}
              {paymentMethod === 'bkash_personal' && (
                <div className="p-4 rounded-xl bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{lang === 'bn' ? 'বিকাশ নম্বর' : 'bKash Number'}</span>
                    <Button variant="outline" size="sm" onClick={() => copy(paymentInfo.bkash_personal.number)}>
                      <Copy className="h-3 w-3 mr-1" />{paymentInfo.bkash_personal.number}
                    </Button>
                  </div>
                  <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
                    {paymentInfo.bkash_personal.instructions[lang].map((s, i) => <li key={i}>{s}</li>)}
                  </ol>
                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-3">
                  {[
                    [lang === 'bn' ? 'ব্যাংক' : 'Bank', paymentInfo.bank_transfer.bankName],
                    [lang === 'bn' ? 'নাম' : 'Name', paymentInfo.bank_transfer.accountName],
                    [lang === 'bn' ? 'একাউন্ট' : 'Account', paymentInfo.bank_transfer.accountNumber],
                    [lang === 'bn' ? 'ব্রাঞ্চ' : 'Branch', paymentInfo.bank_transfer.branch],
                    [lang === 'bn' ? 'রাউটিং' : 'Routing', paymentInfo.bank_transfer.routingNumber],
                  ].map(([l, v]) => (
                    <div key={l} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{l}</span>
                      <Button variant="ghost" size="sm" className="h-auto py-1" onClick={() => copy(v)}>
                        <Copy className="h-3 w-3 mr-1" />{v}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
                    {paymentInfo.cod.instructions[lang].map((s, i) => <li key={i}>{s}</li>)}
                  </ol>
                </div>
              )}

              {/* Screenshot upload */}
              {paymentMethod && paymentMethod !== 'cod' && (
                <div>
                  <Label className="mb-2 block">{lang === 'bn' ? 'পেমেন্ট স্ক্রিনশট (ঐচ্ছিক)' : 'Payment Screenshot (Optional)'}</Label>
                  <div className="border-2 border-dashed rounded-xl p-6 text-center">
                    <input type="file" accept="image/*" id="ss-upload" className="hidden" onChange={e => e.target.files?.[0] && setScreenshotFile(e.target.files[0])} />
                    <label htmlFor="ss-upload" className="cursor-pointer">
                      {screenshotFile ? (
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="text-sm font-medium">{screenshotFile.name}</span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">{lang === 'bn' ? 'স্ক্রিনশট আপলোড করুন' : 'Upload screenshot'}</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" />{lang === 'bn' ? 'পেছনে' : 'Back'}
          </Button>
          {step < 5 ? (
            <Button onClick={next} className="gradient-button">
              {lang === 'bn' ? 'পরবর্তী' : 'Next'}<ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={submitOrder} className="gradient-button" disabled={!paymentMethod || isSubmitting || !verified}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
              {lang === 'bn' ? 'অর্ডার কনফার্ম করুন' : 'Confirm Order'}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
