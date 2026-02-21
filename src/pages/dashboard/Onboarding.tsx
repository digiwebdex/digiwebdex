import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DIGIWEBDEX_CONTACT } from '@/services/contactService';
import { HostingDomainSelector, SelectedDomain } from '@/components/order/HostingDomainSelector';
import { DomainSearchInput } from '@/components/domain/DomainSearchInput';
import { DomainSearchResults } from '@/components/domain/DomainSearchResults';
import { domainService, type DomainSearchResult } from '@/services/domainService';
import {
  Globe, Server, Code, BarChart3, Package, User, CreditCard,
  Check, ChevronLeft, ChevronRight, Loader2, CheckCircle2,
  Smartphone, Building2, Copy, Upload, HandCoins, Rocket, Search
} from 'lucide-react';

// ─── Types ───
type ServiceType = 'domain' | 'hosting' | 'web_development' | 'software_development' | 'digital_marketing';

interface PackageOption {
  id: string;
  name: { en: string; bn: string };
  description: { en: string; bn: string };
  price: number;
  features: { en: string[]; bn: string[] };
  isPopular?: boolean;
  serviceType: ServiceType;
}

type PaymentMethod = 'bkash_personal' | 'bank_transfer' | 'cod';

// ─── Form Schema ───
const customerFormSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(10).max(20),
  email: z.string().trim().email().max(255),
  message: z.string().trim().max(500).optional(),
});
type CustomerFormData = z.infer<typeof customerFormSchema>;

// ─── Service Options ───
const serviceOptions: { type: ServiceType; icon: React.ElementType; label_en: string; label_bn: string; desc_en: string; desc_bn: string }[] = [
  { type: 'domain', icon: Globe, label_en: 'Domain Registration', label_bn: 'ডোমেইন রেজিস্ট্রেশন', desc_en: 'Search & register your domain', desc_bn: 'ডোমেইন খুঁজুন ও রেজিস্টার করুন' },
  { type: 'hosting', icon: Server, label_en: 'Web Hosting', label_bn: 'ওয়েব হোস্টিং', desc_en: 'SSD hosting with cPanel', desc_bn: 'SSD হোস্টিং cPanel সহ' },
  { type: 'web_development', icon: Code, label_en: 'Website Development', label_bn: 'ওয়েবসাইট ডেভেলপমেন্ট', desc_en: 'Professional web solutions', desc_bn: 'প্রফেশনাল ওয়েব সমাধান' },
  { type: 'software_development', icon: Package, label_en: 'Software / ERP', label_bn: 'সফটওয়্যার / ERP', desc_en: 'Custom software development', desc_bn: 'কাস্টম সফটওয়্যার ডেভেলপমেন্ট' },
  { type: 'digital_marketing', icon: BarChart3, label_en: 'Digital Marketing', label_bn: 'ডিজিটাল মার্কেটিং', desc_en: 'SEO, SEM & social media', desc_bn: 'SEO, SEM ও সোশ্যাল মিডিয়া' },
];

// ─── Package Data ───
const packagesByService: Record<ServiceType, PackageOption[]> = {
  domain: [], // domain uses search flow, not packages
  hosting: [
    { id: 'hosting-starter', name: { en: 'Starter Hosting', bn: 'স্টার্টার হোস্টিং' }, description: { en: '5GB SSD, 50GB BW', bn: '৫ জিবি SSD, ৫০ জিবি BW' }, price: 3500, serviceType: 'hosting', features: { en: ['5 GB SSD Storage', '50 GB Bandwidth', 'Free SSL Certificate', '5 Email Accounts', 'cPanel Access'], bn: ['৫ জিবি SSD স্টোরেজ', '৫০ জিবি ব্যান্ডউইথ', 'ফ্রি SSL সার্টিফিকেট', '৫টি ইমেইল অ্যাকাউন্ট', 'cPanel অ্যাক্সেস'] } },
    { id: 'hosting-business', name: { en: 'Business Hosting', bn: 'বিজনেস হোস্টিং' }, description: { en: '10GB SSD, Unlimited BW', bn: '১০ জিবি SSD, আনলিমিটেড BW' }, price: 5900, serviceType: 'hosting', isPopular: true, features: { en: ['10 GB SSD Storage', 'Unlimited Bandwidth', 'Free SSL & CDN', '20 Email Accounts', 'Priority Support'], bn: ['১০ জিবি SSD স্টোরেজ', 'আনলিমিটেড ব্যান্ডউইথ', 'ফ্রি SSL ও CDN', '২০টি ইমেইল অ্যাকাউন্ট', 'অগ্রাধিকার সাপোর্ট'] } },
    { id: 'hosting-premium', name: { en: 'Premium Hosting', bn: 'প্রিমিয়াম হোস্টিং' }, description: { en: '20GB SSD, Unlimited BW', bn: '২০ জিবি SSD, আনলিমিটেড BW' }, price: 9900, serviceType: 'hosting', features: { en: ['20 GB NVMe Storage', 'Unlimited Bandwidth', 'Free SSL, CDN & Backup', 'Unlimited Emails', 'Dedicated Support'], bn: ['২০ জিবি NVMe স্টোরেজ', 'আনলিমিটেড ব্যান্ডউইথ', 'ফ্রি SSL, CDN ও ব্যাকআপ', 'আনলিমিটেড ইমেইল', 'ডেডিকেটেড সাপোর্ট'] } },
  ],
  web_development: [
    { id: 'web-starter', name: { en: 'Starter Website', bn: 'স্টার্টার ওয়েবসাইট' }, description: { en: '5 Page Website', bn: '৫ পেজ ওয়েবসাইট' }, price: 15000, serviceType: 'web_development', features: { en: ['5 Pages', 'Responsive Design', 'SEO Optimized', 'Contact Form', 'Social Links'], bn: ['৫টি পেজ', 'রেসপন্সিভ ডিজাইন', 'SEO অপ্টিমাইজড', 'কন্ট্যাক্ট ফর্ম', 'সোশ্যাল লিংক'] } },
    { id: 'web-business', name: { en: 'Business Website', bn: 'বিজনেস ওয়েবসাইট' }, description: { en: '15 Page + CMS', bn: '১৫ পেজ + CMS' }, price: 35000, serviceType: 'web_development', isPopular: true, features: { en: ['15 Pages', 'Custom Design', 'Admin Panel', 'Blog System', 'Analytics'], bn: ['১৫টি পেজ', 'কাস্টম ডিজাইন', 'অ্যাডমিন প্যানেল', 'ব্লগ সিস্টেম', 'অ্যানালিটিক্স'] } },
    { id: 'web-ecommerce', name: { en: 'E-commerce', bn: 'ই-কমার্স' }, description: { en: 'Full Online Store', bn: 'পূর্ণ অনলাইন স্টোর' }, price: 50000, serviceType: 'web_development', features: { en: ['Unlimited Products', 'Payment Gateway', 'Inventory Management', 'Order Tracking', 'Mobile App Ready'], bn: ['আনলিমিটেড প্রোডাক্ট', 'পেমেন্ট গেটওয়ে', 'ইনভেন্টরি ম্যানেজমেন্ট', 'অর্ডার ট্র্যাকিং', 'মোবাইল অ্যাপ রেডি'] } },
  ],
  software_development: [
    { id: 'sw-basic', name: { en: 'Basic Software', bn: 'বেসিক সফটওয়্যার' }, description: { en: 'Small business solution', bn: 'ছোট ব্যবসার সমাধান' }, price: 30000, serviceType: 'software_development', features: { en: ['Core Modules', 'User Management', 'Basic Reports', 'Mobile Friendly', '3 Month Support'], bn: ['কোর মডিউল', 'ইউজার ম্যানেজমেন্ট', 'বেসিক রিপোর্ট', 'মোবাইল ফ্রেন্ডলি', '৩ মাস সাপোর্ট'] } },
    { id: 'sw-pro', name: { en: 'Professional ERP', bn: 'প্রফেশনাল ERP' }, description: { en: 'Complete business ERP', bn: 'সম্পূর্ণ বিজনেস ERP' }, price: 60000, serviceType: 'software_development', isPopular: true, features: { en: ['All Modules', 'Multi-user', 'Advanced Reports', 'API Integration', '6 Month Support'], bn: ['সকল মডিউল', 'মাল্টি-ইউজার', 'অ্যাডভান্সড রিপোর্ট', 'API ইন্টিগ্রেশন', '৬ মাস সাপোর্ট'] } },
    { id: 'sw-enterprise', name: { en: 'Enterprise Solution', bn: 'এন্টারপ্রাইজ সমাধান' }, description: { en: 'Large scale solution', bn: 'বড় পরিসরের সমাধান' }, price: 100000, serviceType: 'software_development', features: { en: ['Unlimited Modules', 'Multi-branch', 'BI Dashboard', 'Custom Integrations', '1 Year Support'], bn: ['আনলিমিটেড মডিউল', 'মাল্টি-ব্রাঞ্চ', 'BI ড্যাশবোর্ড', 'কাস্টম ইন্টিগ্রেশন', '১ বছর সাপোর্ট'] } },
  ],
  digital_marketing: [
    { id: 'dm-starter', name: { en: 'Starter Marketing', bn: 'স্টার্টার মার্কেটিং' }, description: { en: 'Basic SEO & Social', bn: 'বেসিক SEO ও সোশ্যাল' }, price: 5000, serviceType: 'digital_marketing', features: { en: ['Basic SEO', '2 Social Platforms', 'Monthly Report', 'Google My Business'], bn: ['বেসিক SEO', '২টি সোশ্যাল প্ল্যাটফর্ম', 'মাসিক রিপোর্ট', 'Google My Business'] } },
    { id: 'dm-growth', name: { en: 'Growth Package', bn: 'গ্রোথ প্যাকেজ' }, description: { en: 'SEO + Ads + Social', bn: 'SEO + অ্যাড + সোশ্যাল' }, price: 10000, serviceType: 'digital_marketing', isPopular: true, features: { en: ['Advanced SEO', 'Google Ads', 'All Social Platforms', 'Content Creation', 'Weekly Reports'], bn: ['অ্যাডভান্সড SEO', 'গুগল অ্যাডস', 'সকল সোশ্যাল প্ল্যাটফর্ম', 'কন্টেন্ট ক্রিয়েশন', 'সাপ্তাহিক রিপোর্ট'] } },
    { id: 'dm-premium', name: { en: 'Premium Marketing', bn: 'প্রিমিয়াম মার্কেটিং' }, description: { en: 'Full digital strategy', bn: 'সম্পূর্ণ ডিজিটাল স্ট্রাটেজি' }, price: 15000, serviceType: 'digital_marketing', features: { en: ['Full SEO + SEM', 'Paid Campaigns', 'Influencer Marketing', 'Video Content', 'Dedicated Manager'], bn: ['ফুল SEO + SEM', 'পেইড ক্যাম্পেইন', 'ইনফ্লুয়েন্সার মার্কেটিং', 'ভিডিও কন্টেন্ট', 'ডেডিকেটেড ম্যানেজার'] } },
  ],
};

// ─── Payment Info ───
const paymentInfo = {
  bkash_personal: { number: '01674533303', instructions: { en: ['Open bKash app', 'Go to "Send Money"', 'Enter number above', 'Add Order ID in reference', 'Complete & screenshot'], bn: ['বিকাশ অ্যাপ খুলুন', '"Send Money" এ যান', 'উপরের নম্বরে পাঠান', 'রেফারেন্সে Order ID দিন', 'সম্পন্ন করে স্ক্রিনশট নিন'] } },
  bank_transfer: { bankName: 'Pubali Bank Ltd.', accountName: 'Md. Iqbal Hossain', accountNumber: '2706101077904', branch: 'Asad Avenue Branch', routingNumber: '175260162', instructions: { en: ['Transfer to account above', 'Use Order ID as reference', 'Keep receipt/screenshot'], bn: ['উপরের একাউন্টে টাকা পাঠান', 'রেফারেন্সে Order ID দিন', 'রসিদ/স্ক্রিনশট রাখুন'] } },
  cod: { instructions: { en: ['Place your order now', 'Our team will contact you', 'Pay cash on delivery', 'Get receipt upon payment'], bn: ['এখনই অর্ডার করুন', 'আমাদের টিম যোগাযোগ করবে', 'সেবা প্রদানের সময় পরিশোধ করুন', 'পেমেন্টের রসিদ নিন'] } },
};

// ─── Steps Config ───
const STEPS = [
  { num: 1, label_en: 'Service', label_bn: 'সেবা', icon: Package },
  { num: 2, label_en: 'Package', label_bn: 'প্যাকেজ', icon: Rocket },
  { num: 3, label_en: 'Details', label_bn: 'তথ্য', icon: User },
  { num: 4, label_en: 'Payment', label_bn: 'পেমেন্ট', icon: CreditCard },
];

export default function Onboarding() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const basePath = language === 'en' ? '/en' : '/bn';

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<SelectedDomain | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Domain search states (for domain-only flow)
  const [domainSearching, setDomainSearching] = useState(false);
  const [domainResults, setDomainResults] = useState<{ primary: DomainSearchResult; alternatives: DomainSearchResult[] } | null>(null);
  const [selectedDomainResult, setSelectedDomainResult] = useState<DomainSearchResult | null>(null);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: { name: '', phone: '', email: user?.email || '', message: '' },
  });

  useEffect(() => {
    if (user?.email) form.setValue('email', user.email);
  }, [user]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(amount);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(language === 'bn' ? 'কপি হয়েছে!' : 'Copied!');
  };

  // ─── Domain search ───
  const handleDomainSearch = async (query: string) => {
    setDomainSearching(true);
    setDomainResults(null);
    try {
      const results = await domainService.searchDomain(query, user?.id);
      setDomainResults(results);
    } catch {
      toast.error(language === 'bn' ? 'ডোমেইন খুঁজতে সমস্যা' : 'Domain search failed');
    } finally {
      setDomainSearching(false);
    }
  };

  const handleSelectDomainResult = (result: DomainSearchResult) => {
    if (!result.isAvailable) return;
    setSelectedDomainResult(result);
    setSelectedPackage({
      id: `domain-${result.tld}`,
      name: { en: result.domain, bn: result.domain },
      description: { en: `Domain registration`, bn: 'ডোমেইন রেজিস্ট্রেশন' },
      price: result.price,
      serviceType: 'domain',
      features: { en: ['1 Year Registration', 'DNS Management', 'WHOIS Privacy'], bn: ['১ বছর রেজিস্ট্রেশন', 'DNS ম্যানেজমেন্ট', 'WHOIS প্রাইভেসি'] },
    });
  };

  // ─── Total calculation ───
  const getTotal = () => {
    let total = selectedPackage?.price || 0;
    if (selectedService === 'hosting' && selectedDomain?.type === 'new' && selectedDomain.price) {
      total += selectedDomain.price;
    }
    return total;
  };

  // ─── Navigation ───
  const handleNext = () => {
    if (step === 1 && !selectedService) {
      toast.error(language === 'bn' ? 'একটি সেবা বেছে নিন' : 'Please select a service');
      return;
    }
    if (step === 2) {
      if (selectedService === 'domain' && !selectedDomainResult) {
        toast.error(language === 'bn' ? 'একটি ডোমেইন বেছে নিন' : 'Please select a domain');
        return;
      }
      if (selectedService !== 'domain' && !selectedPackage) {
        toast.error(language === 'bn' ? 'একটি প্যাকেজ বেছে নিন' : 'Please select a package');
        return;
      }
      if (selectedService === 'hosting' && !selectedDomain?.isValid) {
        toast.error(language === 'bn' ? 'হোস্টিংয়ের জন্য ডোমেইন আবশ্যক' : 'Domain is required for hosting');
        return;
      }
    }
    if (step === 3) {
      form.handleSubmit(() => setStep(4))();
      return;
    }
    setStep(s => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    if (step === 1) return;
    setStep(s => s - 1);
  };

  // ─── Submit ───
  const handleSubmitOrder = async (data: CustomerFormData) => {
    if (!selectedPackage || !paymentMethod) return;
    setIsSubmitting(true);
    try {
      const { data: orderNum } = await supabase.rpc('generate_order_number');
      const generatedOrderNumber = orderNum || `ORD-${Date.now()}`;
      const totalAmount = getTotal();

      const { data: order, error: orderError } = await supabase.from('orders').insert({
        order_number: generatedOrderNumber,
        user_id: user?.id || null,
        service_type: selectedService as any,
        billing_type: (selectedService === 'hosting' || selectedService === 'digital_marketing' ? 'recurring' : 'one_time') as any,
        subtotal: totalAmount,
        total: totalAmount,
        status: 'pending' as const,
        notes: `Service: ${selectedService}\nPackage: ${selectedPackage.name.en}\nCustomer: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}`,
      }).select().single();

      if (orderError) throw orderError;

      // Upload screenshot
      let screenshotUrl: string | null = null;
      if (screenshotFile) {
        const fileExt = screenshotFile.name.split('.').pop();
        const fileName = `${order.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('payment-proofs').upload(fileName, screenshotFile);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);
          screenshotUrl = urlData.publicUrl;
        }
      }

      // Manual payment record
      await supabase.from('manual_payments').insert({
        order_id: order.id,
        user_id: user?.id || '00000000-0000-0000-0000-000000000000',
        method: paymentMethod,
        transaction_id: `PENDING-${generatedOrderNumber}`,
        amount: totalAmount,
        screenshot_url: screenshotUrl,
        notes: `${data.name}, ${data.phone}`,
        status: 'pending',
      });

      // Order meta
      const metaEntries = [
        { order_id: order.id, meta_key: 'customer_name', meta_value: data.name },
        { order_id: order.id, meta_key: 'customer_phone', meta_value: data.phone },
        { order_id: order.id, meta_key: 'customer_email', meta_value: data.email },
        { order_id: order.id, meta_key: 'package_name', meta_value: selectedPackage.name.en },
        { order_id: order.id, meta_key: 'payment_method', meta_value: paymentMethod },
      ];
      if (selectedDomain?.isValid) {
        metaEntries.push({ order_id: order.id, meta_key: 'domain_name', meta_value: selectedDomain.domainName });
      }
      await supabase.from('order_meta').insert(metaEntries);

      // Notification
      try {
        await supabase.functions.invoke('contact-notification', {
          body: { type: 'order_created', orderNumber: generatedOrderNumber, customerName: data.name, customerPhone: data.phone, customerEmail: data.email, packageName: selectedPackage.name.en, amount: totalAmount, paymentMethod },
        });
      } catch {}

      await supabase.from('notifications').insert({
        user_id: user?.id || null,
        notification_type: 'in_app',
        recipient: 'admin',
        subject: `New Order: ${generatedOrderNumber}`,
        body: `New ${selectedPackage.name.en} order from ${data.name}`,
        status: 'pending',
      });

      setOrderNumber(generatedOrderNumber);
      setOrderComplete(true);
      toast.success(language === 'bn' ? 'অর্ডার সফল!' : 'Order placed!');
    } catch (error) {
      console.error(error);
      toast.error(language === 'bn' ? 'অর্ডার করতে সমস্যা' : 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Success Screen ───
  if (orderComplete) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto text-center py-12">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">{language === 'bn' ? 'অর্ডার সফল হয়েছে!' : 'Order Successful!'}</h1>
          <p className="text-muted-foreground mb-4">{language === 'bn' ? 'আপনার অর্ডার নম্বর:' : 'Your order number:'}</p>
          <div className="bg-primary/10 rounded-xl p-6 mb-6">
            <code className="text-2xl font-bold text-primary">{orderNumber}</code>
          </div>
          <p className="text-sm text-muted-foreground mb-8">{language === 'bn' ? 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।' : 'We will contact you soon.'}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" asChild><a href={`${basePath}/dashboard/orders`}>{language === 'bn' ? 'অর্ডার দেখুন' : 'View Orders'}</a></Button>
            <Button className="gradient-button" onClick={() => window.open(`https://wa.me/${DIGIWEBDEX_CONTACT.whatsapp}?text=Order: ${orderNumber}`, '_blank')}>
              {language === 'bn' ? 'WhatsApp' : 'WhatsApp'}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">{language === 'bn' ? 'নতুন সেবা শুরু করুন' : 'Get Started'}</h1>
          <p className="text-muted-foreground mt-1">{language === 'bn' ? 'ধাপে ধাপে আপনার সেবা সেটআপ করুন' : 'Set up your service step by step'}</p>
        </div>

        {/* Progress */}
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          {STEPS.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all', step >= s.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                  {step > s.num ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className="text-xs mt-2 hidden sm:block">{language === 'bn' ? s.label_bn : s.label_en}</span>
              </div>
              {idx < STEPS.length - 1 && <div className={cn('flex-1 h-1 mx-3 rounded', step > s.num ? 'bg-primary' : 'bg-muted')} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">{language === 'bn' ? 'কোন সেবা প্রয়োজন?' : 'What service do you need?'}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {serviceOptions.map((svc) => (
                <Card
                  key={svc.type}
                  className={cn('cursor-pointer transition-all hover:border-primary/50 hover:shadow-md', selectedService === svc.type && 'border-primary ring-2 ring-primary/20')}
                  onClick={() => { setSelectedService(svc.type); setSelectedPackage(null); setSelectedDomain(null); setSelectedDomainResult(null); setDomainResults(null); }}
                >
                  <CardContent className="p-6 text-center">
                    <div className={cn('w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-3', selectedService === svc.type ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary')}>
                      <svc.icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-semibold mb-1">{language === 'bn' ? svc.label_bn : svc.label_en}</h3>
                    <p className="text-xs text-muted-foreground">{language === 'bn' ? svc.desc_bn : svc.desc_en}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Package / Domain Selection */}
        {step === 2 && selectedService === 'domain' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  {language === 'bn' ? 'ডোমেইন খুঁজুন' : 'Search Domain'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DomainSearchInput onSearch={handleDomainSearch} isLoading={domainSearching} size="lg" />
                {domainResults && (
                  <DomainSearchResults
                    primary={domainResults.primary}
                    alternatives={domainResults.alternatives}
                    onAddToCart={handleSelectDomainResult}
                  />
                )}
                {selectedDomainResult && (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-medium">{selectedDomainResult.domain}</span>
                    <Badge className="ml-auto">{formatCurrency(selectedDomainResult.price)}/{language === 'bn' ? 'বছর' : 'year'}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {step === 2 && selectedService && selectedService !== 'domain' && (
          <div className="space-y-6">
            {/* Hosting needs domain */}
            {selectedService === 'hosting' && (
              <Card>
                <CardContent className="pt-6">
                  <HostingDomainSelector selectedDomain={selectedDomain} onDomainChange={setSelectedDomain} />
                </CardContent>
              </Card>
            )}

            {/* Package Grid */}
            <div>
              <p className="text-center text-muted-foreground mb-4">{language === 'bn' ? 'আপনার প্যাকেজ বেছে নিন' : 'Choose your package'}</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(packagesByService[selectedService] || []).map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={cn('cursor-pointer transition-all hover:border-primary/50 relative', selectedPackage?.id === pkg.id && 'border-primary ring-2 ring-primary/20')}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    {pkg.isPopular && (
                      <Badge className="absolute -top-2 right-4 text-xs">{language === 'bn' ? 'জনপ্রিয়' : 'Popular'}</Badge>
                    )}
                    <CardContent className="p-5">
                      <h3 className="font-semibold mb-1">{pkg.name[language]}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{pkg.description[language]}</p>
                      <p className="text-2xl font-bold text-primary mb-4">
                        {formatCurrency(pkg.price)}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{selectedService === 'hosting' || selectedService === 'digital_marketing' ? (language === 'bn' ? 'বছর' : 'year') : (language === 'bn' ? 'একবার' : 'once')}
                        </span>
                      </p>
                      <ul className="text-xs space-y-1.5">
                        {pkg.features[language].map((f, i) => (
                          <li key={i} className="flex items-center gap-2"><Check className="h-3 w-3 text-primary shrink-0" />{f}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Customer Details */}
        {step === 3 && (
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>{language === 'bn' ? 'আপনার তথ্য দিন' : 'Your Details'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{selectedPackage?.name[language]}</span>
                  <span className="font-bold text-primary">{formatCurrency(selectedPackage?.price || 0)}</span>
                </div>
                {selectedService === 'hosting' && selectedDomain?.isValid && selectedDomain.type === 'new' && selectedDomain.price && (
                  <div className="flex justify-between items-center text-sm border-t pt-2">
                    <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{selectedDomain.domainName}</span>
                    <span className="text-primary">+{formatCurrency(selectedDomain.price)}</span>
                  </div>
                )}
                {selectedDomain?.isValid && selectedDomain.type === 'existing' && (
                  <div className="flex justify-between items-center text-sm border-t pt-2">
                    <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{selectedDomain.domainName}</span>
                    <span className="text-xs text-muted-foreground">{language === 'bn' ? 'পূর্বের' : 'Existing'}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold border-t pt-2">
                  <span>{language === 'bn' ? 'মোট' : 'Total'}</span>
                  <span className="text-primary">{formatCurrency(getTotal())}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>{language === 'bn' ? 'আপনার নাম' : 'Your Name'} *</Label>
                  <Input placeholder={language === 'bn' ? 'নাম লিখুন' : 'Enter your name'} {...form.register('name')} className="mt-1" />
                  {form.formState.errors.name && <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>}
                </div>
                <div>
                  <Label>{language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'} *</Label>
                  <Input type="tel" placeholder="01XXXXXXXXX" {...form.register('phone')} className="mt-1" />
                  {form.formState.errors.phone && <p className="text-xs text-destructive mt-1">{form.formState.errors.phone.message}</p>}
                </div>
                <div>
                  <Label>{language === 'bn' ? 'ইমেইল' : 'Email'} *</Label>
                  <Input type="email" placeholder="you@example.com" {...form.register('email')} className="mt-1" />
                  {form.formState.errors.email && <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>}
                </div>
                <div>
                  <Label>{language === 'bn' ? 'বার্তা (ঐচ্ছিক)' : 'Message (Optional)'}</Label>
                  <Textarea placeholder={language === 'bn' ? 'বিস্তারিত লিখুন...' : 'Any details...'} {...form.register('message')} className="mt-1" rows={3} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>{language === 'bn' ? 'পেমেন্ট মেথড' : 'Payment Method'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Total */}
              <div className="bg-muted/50 rounded-lg p-4 flex justify-between items-center">
                <span className="font-medium">{language === 'bn' ? 'মোট পরিশোধযোগ্য' : 'Total Payable'}</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(getTotal())}</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Card className={cn('cursor-pointer transition-all hover:border-primary/50', paymentMethod === 'bkash_personal' && 'border-primary ring-2 ring-primary/20')} onClick={() => setPaymentMethod('bkash_personal')}>
                  <CardContent className="p-4 text-center">
                    <Smartphone className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold">{language === 'bn' ? 'বিকাশ' : 'bKash'}</h3>
                  </CardContent>
                </Card>
                <Card className={cn('cursor-pointer transition-all hover:border-primary/50', paymentMethod === 'bank_transfer' && 'border-primary ring-2 ring-primary/20')} onClick={() => setPaymentMethod('bank_transfer')}>
                  <CardContent className="p-4 text-center">
                    <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold">{language === 'bn' ? 'ব্যাংক' : 'Bank'}</h3>
                  </CardContent>
                </Card>
                <Card className={cn('cursor-pointer transition-all hover:border-primary/50', paymentMethod === 'cod' && 'border-primary ring-2 ring-primary/20')} onClick={() => setPaymentMethod('cod')}>
                  <CardContent className="p-4 text-center">
                    <HandCoins className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold">COD</h3>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Instructions */}
              {paymentMethod && (
                <div className="bg-muted/50 rounded-lg p-4">
                  {paymentMethod === 'bkash_personal' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{language === 'bn' ? 'বিকাশ নম্বর' : 'bKash Number'}</span>
                        <div className="flex items-center gap-2">
                          <code className="font-bold">{paymentInfo.bkash_personal.number}</code>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(paymentInfo.bkash_personal.number)}><Copy className="h-3 w-3" /></Button>
                        </div>
                      </div>
                      <ul className="text-xs space-y-1">
                        {paymentInfo.bkash_personal.instructions[language].map((inst, i) => (
                          <li key={i} className="flex items-start gap-2"><span className="text-primary font-bold">{i + 1}.</span>{inst}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {paymentMethod === 'bank_transfer' && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">{language === 'bn' ? 'ব্যাংক' : 'Bank'}</span><span className="font-medium">{paymentInfo.bank_transfer.bankName}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{language === 'bn' ? 'একাউন্ট নাম' : 'Account Name'}</span><span className="font-medium">{paymentInfo.bank_transfer.accountName}</span></div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{language === 'bn' ? 'একাউন্ট নম্বর' : 'Account No'}</span>
                        <div className="flex items-center gap-2">
                          <code className="font-bold">{paymentInfo.bank_transfer.accountNumber}</code>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(paymentInfo.bank_transfer.accountNumber)}><Copy className="h-3 w-3" /></Button>
                        </div>
                      </div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{language === 'bn' ? 'ব্রাঞ্চ' : 'Branch'}</span><span className="font-medium">{paymentInfo.bank_transfer.branch}</span></div>
                    </div>
                  )}
                  {paymentMethod === 'cod' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-primary"><HandCoins className="h-5 w-5" /><span className="font-semibold">{language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</span></div>
                      <ul className="text-xs space-y-1">
                        {paymentInfo.cod.instructions[language].map((inst, i) => (
                          <li key={i} className="flex items-start gap-2"><span className="text-primary font-bold">{i + 1}.</span>{inst}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Screenshot Upload */}
              {paymentMethod && paymentMethod !== 'cod' && (
                <div className="space-y-2">
                  <Label>{language === 'bn' ? 'পেমেন্ট স্ক্রিনশট (ঐচ্ছিক)' : 'Payment Screenshot (Optional)'}</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <input type="file" accept="image/*" className="hidden" id="screenshot-upload" onChange={(e) => { const file = e.target.files?.[0]; if (file) setScreenshotFile(file); }} />
                    <label htmlFor="screenshot-upload" className="cursor-pointer">
                      {screenshotFile ? (
                        <div className="flex items-center justify-center gap-2 text-primary"><CheckCircle2 className="h-5 w-5" /><span className="text-sm">{screenshotFile.name}</span></div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground"><Upload className="h-8 w-8" /><span className="text-sm">{language === 'bn' ? 'স্ক্রিনশট আপলোড করুন' : 'Upload screenshot'}</span></div>
                      )}
                    </label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between max-w-xl mx-auto pt-4">
          <Button variant="outline" onClick={step === 1 ? () => window.history.back() : handleBack} disabled={isSubmitting}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {step === 1 ? (language === 'bn' ? 'ফিরে যান' : 'Go Back') : (language === 'bn' ? 'পেছনে' : 'Back')}
          </Button>
          {step < 4 ? (
            <Button onClick={handleNext} className="gradient-button">
              {language === 'bn' ? 'পরবর্তী' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={form.handleSubmit(handleSubmitOrder)} disabled={!paymentMethod || isSubmitting} className="gradient-button">
              {isSubmitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />{language === 'bn' ? 'অপেক্ষা করুন...' : 'Processing...'}</>) : (<><Check className="h-4 w-4 mr-2" />{language === 'bn' ? 'অর্ডার সম্পন্ন করুন' : 'Complete Order'}</>)}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
