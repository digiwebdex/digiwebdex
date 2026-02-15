import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Globe, 
  User, 
  CreditCard,
  Loader2,
  CheckCircle2,
  Smartphone,
  Building2,
  Copy,
  Package,
  Server,
  Code,
  Cpu
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { DIGIWEBDEX_CONTACT } from '@/services/contactService';
import type { DomainSearchResult } from '@/services/domainService';

// Form validation schema
const customerFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().trim().min(10, 'Valid phone number required').max(20),
  email: z.string().trim().email('Valid email required').max(255),
  message: z.string().trim().max(500).optional(),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

interface BundlePackage {
  id: string;
  name: { en: string; bn: string };
  description: { en: string; bn: string };
  price: number;
  category: 'hosting' | 'web_development' | 'software_development';
  features: { en: string[]; bn: string[] };
  isPopular?: boolean;
}

interface DomainOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: DomainSearchResult | null;
}

type PaymentMethod = 'bkash_personal' | 'bank_transfer';

const paymentInfo = {
  bkash_personal: {
    number: '01674533303',
    name: 'DigiWebDex',
    type: 'Personal',
    instructions: {
      en: ['Open bKash app', 'Go to "Send Money"', 'Enter number above', 'Add Order ID in reference', 'Complete & screenshot'],
      bn: ['বিকাশ অ্যাপ খুলুন', '"Send Money" এ যান', 'উপরের নম্বরে পাঠান', 'রেফারেন্সে Order ID দিন', 'সম্পন্ন করে স্ক্রিনশট নিন'],
    },
  },
  bank_transfer: {
    bankName: 'Dutch-Bangla Bank Limited',
    accountName: 'DigiWebDex',
    accountNumber: '1234567890123',
    branch: 'Dhaka Main Branch',
    routingNumber: '090123456',
    instructions: {
      en: ['Transfer to account above', 'Use Order ID as reference', 'Keep receipt/screenshot'],
      bn: ['উপরের একাউন্টে টাকা পাঠান', 'রেফারেন্সে Order ID দিন', 'রসিদ/স্ক্রিনশট রাখুন'],
    },
  },
};

const bundlePackages: BundlePackage[] = [
  // Hosting Packages
  {
    id: 'hosting-starter',
    name: { en: 'Starter Hosting', bn: 'স্টার্টার হোস্টিং' },
    description: { en: '5GB SSD, 50GB Bandwidth', bn: '৫ জিবি SSD, ৫০ জিবি ব্যান্ডউইথ' },
    price: 4800,
    category: 'hosting',
    features: { en: ['5 GB SSD', '50 GB Bandwidth', 'Free SSL', '5 Email Accounts'], bn: ['৫ জিবি SSD', '৫০ জিবি ব্যান্ডউইথ', 'ফ্রি SSL', '৫টি ইমেইল'] },
  },
  {
    id: 'hosting-business',
    name: { en: 'Business Hosting', bn: 'বিজনেস হোস্টিং' },
    description: { en: '10GB SSD, Unlimited BW', bn: '১০ জিবি SSD, আনলিমিটেড BW' },
    price: 9900,
    category: 'hosting',
    isPopular: true,
    features: { en: ['10 GB SSD', 'Unlimited Bandwidth', 'Free SSL', 'Unlimited Email'], bn: ['১০ জিবি SSD', 'আনলিমিটেড ব্যান্ডউইথ', 'ফ্রি SSL', 'আনলিমিটেড ইমেইল'] },
  },
  {
    id: 'hosting-premium',
    name: { en: 'Premium Hosting', bn: 'প্রিমিয়াম হোস্টিং' },
    description: { en: '20GB SSD, Unlimited BW', bn: '২০ জিবি SSD, আনলিমিটেড BW' },
    price: 14500,
    category: 'hosting',
    features: { en: ['20 GB SSD', 'Unlimited Bandwidth', 'Free Domain', 'Priority Support'], bn: ['২০ জিবি SSD', 'আনলিমিটেড ব্যান্ডউইথ', 'ফ্রি ডোমেইন', 'প্রায়োরিটি সাপোর্ট'] },
  },
  // Website Packages
  {
    id: 'web-starter',
    name: { en: 'Starter Website', bn: 'স্টার্টার ওয়েবসাইট' },
    description: { en: '5 Page Business Site', bn: '৫ পেজ বিজনেস সাইট' },
    price: 15000,
    category: 'web_development',
    features: { en: ['5 Pages', 'Mobile Responsive', 'SEO Optimized'], bn: ['৫ পেজ', 'মোবাইল রেসপন্সিভ', 'SEO অপ্টিমাইজড'] },
  },
  {
    id: 'web-business',
    name: { en: 'Business Website', bn: 'বিজনেস ওয়েবসাইট' },
    description: { en: '15 Page Professional', bn: '১৫ পেজ প্রফেশনাল' },
    price: 30000,
    category: 'web_development',
    isPopular: true,
    features: { en: ['15 Pages', 'Custom Design', 'Admin Panel', 'Contact Forms'], bn: ['১৫ পেজ', 'কাস্টম ডিজাইন', 'অ্যাডমিন প্যানেল', 'কন্টাক্ট ফর্ম'] },
  },
  {
    id: 'web-ecommerce',
    name: { en: 'E-commerce Website', bn: 'ই-কমার্স ওয়েবসাইট' },
    description: { en: 'Full Online Store', bn: 'সম্পূর্ণ অনলাইন স্টোর' },
    price: 50000,
    category: 'web_development',
    features: { en: ['Unlimited Products', 'Payment Gateway', 'Order Management'], bn: ['আনলিমিটেড প্রোডাক্ট', 'পেমেন্ট গেটওয়ে', 'অর্ডার ম্যানেজমেন্ট'] },
  },
  // Software Packages
  {
    id: 'software-starter',
    name: { en: 'Starter Software', bn: 'স্টার্টার সফটওয়্যার' },
    description: { en: 'Small Business App', bn: 'ছোট ব্যবসার অ্যাপ' },
    price: 30000,
    category: 'software_development',
    features: { en: ['Basic Features', 'Cloud Hosting', '3 Months Support'], bn: ['বেসিক ফিচার', 'ক্লাউড হোস্টিং', '৩ মাস সাপোর্ট'] },
  },
  {
    id: 'software-business',
    name: { en: 'Business Software', bn: 'বিজনেস সফটওয়্যার' },
    description: { en: 'Multi-user System', bn: 'মাল্টি-ইউজার সিস্টেম' },
    price: 60000,
    category: 'software_development',
    isPopular: true,
    features: { en: ['Multi-User', 'Role Management', 'Reports', '6 Months Support'], bn: ['মাল্টি-ইউজার', 'রোল ম্যানেজমেন্ট', 'রিপোর্ট', '৬ মাস সাপোর্ট'] },
  },
  {
    id: 'software-enterprise',
    name: { en: 'Enterprise Software', bn: 'এন্টারপ্রাইজ সফটওয়্যার' },
    description: { en: 'Full ERP/POS', bn: 'সম্পূর্ণ ERP/POS' },
    price: 100000,
    category: 'software_development',
    features: { en: ['Full ERP/POS', 'Multi-Branch', 'Mobile App', '1 Year AMC'], bn: ['সম্পূর্ণ ERP/POS', 'মাল্টি-ব্র্যাঞ্চ', 'মোবাইল অ্যাপ', '১ বছর AMC'] },
  },
];

export function DomainOrderModal({ isOpen, onClose, domain }: DomainOrderModalProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedBundles, setSelectedBundles] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: user?.email || '',
      message: '',
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(language === 'bn' ? 'কপি করা হয়েছে!' : 'Copied!');
  };

  const toggleBundle = (id: string) => {
    setSelectedBundles(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const getSelectedBundlePackages = () => {
    return bundlePackages.filter(pkg => selectedBundles.includes(pkg.id));
  };

  const calculateTotal = () => {
    const domainPrice = domain?.price || 0;
    const bundleTotal = getSelectedBundlePackages().reduce((sum, pkg) => sum + pkg.price, 0);
    return domainPrice + bundleTotal;
  };

  const handleSubmitOrder = async (data: CustomerFormData) => {
    if (!domain || !paymentMethod) return;

    setIsSubmitting(true);
    try {
      // Generate order number
      const { data: orderNum } = await supabase.rpc('generate_order_number');
      const generatedOrderNumber = orderNum || `ORD-${Date.now()}`;

      const selectedPackages = getSelectedBundlePackages();
      const orderDescription = [
        `Domain: ${domain.domain}`,
        ...selectedPackages.map(pkg => pkg.name.en)
      ].join(', ');

      // Create order
      const orderInsert = {
        order_number: generatedOrderNumber,
        user_id: user?.id || null,
        service_type: 'domain' as const,
        billing_type: 'one_time' as const,
        subtotal: calculateTotal(),
        total: calculateTotal(),
        status: 'pending' as const,
        notes: `${orderDescription}\nCustomer: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nMessage: ${data.message || 'N/A'}`,
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderInsert)
        .select()
        .single();

      if (orderError) throw orderError;

      // Upload screenshot if provided
      let screenshotUrl: string | null = null;
      if (screenshotFile) {
        const fileExt = screenshotFile.name.split('.').pop();
        const fileName = `${order.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, screenshotFile);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(fileName);
          screenshotUrl = urlData.publicUrl;
        }
      }

      // Create manual payment record
      await supabase
        .from('manual_payments')
        .insert({
          order_id: order.id,
          user_id: user?.id || '00000000-0000-0000-0000-000000000000',
          method: paymentMethod,
          transaction_id: `PENDING-${generatedOrderNumber}`,
          amount: calculateTotal(),
          screenshot_url: screenshotUrl,
          notes: `Domain: ${domain.domain}, Bundles: ${selectedPackages.map(p => p.name.en).join(', ') || 'None'}\nCustomer: ${data.name}, Phone: ${data.phone}, Email: ${data.email}`,
          status: 'pending',
        });

      // Store order meta
      await supabase.from('order_meta').insert([
        { order_id: order.id, meta_key: 'customer_name', meta_value: data.name },
        { order_id: order.id, meta_key: 'customer_phone', meta_value: data.phone },
        { order_id: order.id, meta_key: 'customer_email', meta_value: data.email },
        { order_id: order.id, meta_key: 'domain_name', meta_value: domain.domain },
        { order_id: order.id, meta_key: 'domain_price', meta_value: String(domain.price) },
        { order_id: order.id, meta_key: 'bundle_packages', meta_value: JSON.stringify(selectedPackages.map(p => ({ id: p.id, name: p.name.en, price: p.price }))) },
        { order_id: order.id, meta_key: 'payment_method', meta_value: paymentMethod },
      ]);

      // Send notification
      try {
        await supabase.functions.invoke('contact-notification', {
          body: {
            type: screenshotUrl ? 'payment_received' : 'order_created',
            orderNumber: generatedOrderNumber,
            customerName: data.name,
            customerPhone: data.phone,
            customerEmail: data.email,
            packageName: orderDescription,
            amount: calculateTotal(),
            paymentMethod: paymentMethod,
          },
        });
      } catch (notifError) {
        console.error('Notification error (non-blocking):', notifError);
      }

      setOrderNumber(generatedOrderNumber);
      setOrderComplete(true);

      toast.success(
        language === 'bn' ? 'অর্ডার সফল হয়েছে!' : 'Order placed successfully!',
        { description: generatedOrderNumber }
      );

    } catch (error) {
      console.error('Order error:', error);
      toast.error(
        language === 'bn' ? 'অর্ডার করতে সমস্যা হয়েছে' : 'Failed to place order'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === 2) {
      form.handleSubmit((data) => {
        setStep(3);
      })();
      return;
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleClose = () => {
    setStep(1);
    setSelectedBundles([]);
    setPaymentMethod(null);
    setOrderComplete(false);
    setOrderNumber('');
    setScreenshotFile(null);
    form.reset();
    onClose();
  };

  const steps = [
    { num: 1, label: language === 'bn' ? 'প্যাকেজ যোগ করুন' : 'Add Packages', icon: Package },
    { num: 2, label: language === 'bn' ? 'তথ্য' : 'Details', icon: User },
    { num: 3, label: language === 'bn' ? 'পেমেন্ট' : 'Payment', icon: CreditCard },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hosting': return Server;
      case 'web_development': return Code;
      case 'software_development': return Cpu;
      default: return Package;
    }
  };

  if (!domain) return null;

  if (orderComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {language === 'bn' ? 'অর্ডার সফল!' : 'Order Successful!'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === 'bn' ? 'আপনার অর্ডার নম্বর:' : 'Your order number:'}
            </p>
            <div className="bg-primary/10 rounded-lg p-4 mb-6">
              <code className="text-lg font-bold text-primary">{orderNumber}</code>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {language === 'bn' ? 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।' : 'We will contact you soon.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleClose}>
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </Button>
              <Button 
                className="gradient-button"
                onClick={() => window.open(`https://wa.me/${DIGIWEBDEX_CONTACT.whatsapp}?text=Order: ${orderNumber}`, '_blank')}
              >
                {language === 'bn' ? 'WhatsApp এ যোগাযোগ' : 'Chat on WhatsApp'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {language === 'bn' ? 'ডোমেইন অর্ডার করুন' : 'Order Domain'}
          </DialogTitle>
        </DialogHeader>

        {/* Domain Summary */}
        <div className="bg-primary/10 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="h-6 w-6 text-primary" />
            <div>
              <p className="font-bold text-lg">{domain.domain}</p>
              <p className="text-sm text-muted-foreground">
                {language === 'bn' ? 'ডোমেইন রেজিস্ট্রেশন' : 'Domain Registration'}
              </p>
            </div>
          </div>
          <p className="text-xl font-bold text-primary">{formatCurrency(domain.price)}</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-4 px-4">
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    step >= s.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {step > s.num ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className="text-xs mt-1 hidden sm:block">{s.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={cn('flex-1 h-1 mx-2 rounded transition-all', step > s.num ? 'bg-primary' : 'bg-muted')} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Bundle Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-center text-muted-foreground">
              {language === 'bn' ? 'অতিরিক্ত সার্ভিস যোগ করুন (ঐচ্ছিক)' : 'Add additional services (optional)'}
            </p>

            {/* Hosting Section */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                {language === 'bn' ? 'হোস্টিং প্যাকেজ' : 'Hosting Packages'}
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {bundlePackages.filter(p => p.category === 'hosting').map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={cn(
                      'cursor-pointer transition-all hover:border-primary/50 relative',
                      selectedBundles.includes(pkg.id) && 'border-primary ring-2 ring-primary/20'
                    )}
                    onClick={() => toggleBundle(pkg.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <Checkbox checked={selectedBundles.includes(pkg.id)} />
                        {pkg.isPopular && (
                          <Badge variant="secondary" className="text-[10px]">
                            {language === 'bn' ? 'জনপ্রিয়' : 'Popular'}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm">{pkg.name[language]}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{pkg.description[language]}</p>
                      <p className="text-lg font-bold text-primary">{formatCurrency(pkg.price)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Web Development Section */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                {language === 'bn' ? 'ওয়েবসাইট প্যাকেজ' : 'Website Packages'}
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {bundlePackages.filter(p => p.category === 'web_development').map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={cn(
                      'cursor-pointer transition-all hover:border-primary/50 relative',
                      selectedBundles.includes(pkg.id) && 'border-primary ring-2 ring-primary/20'
                    )}
                    onClick={() => toggleBundle(pkg.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <Checkbox checked={selectedBundles.includes(pkg.id)} />
                        {pkg.isPopular && (
                          <Badge variant="secondary" className="text-[10px]">
                            {language === 'bn' ? 'জনপ্রিয়' : 'Popular'}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm">{pkg.name[language]}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{pkg.description[language]}</p>
                      <p className="text-lg font-bold text-primary">{formatCurrency(pkg.price)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Software Development Section */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                {language === 'bn' ? 'সফটওয়্যার প্যাকেজ' : 'Software Packages'}
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {bundlePackages.filter(p => p.category === 'software_development').map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={cn(
                      'cursor-pointer transition-all hover:border-primary/50 relative',
                      selectedBundles.includes(pkg.id) && 'border-primary ring-2 ring-primary/20'
                    )}
                    onClick={() => toggleBundle(pkg.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <Checkbox checked={selectedBundles.includes(pkg.id)} />
                        {pkg.isPopular && (
                          <Badge variant="secondary" className="text-[10px]">
                            {language === 'bn' ? 'জনপ্রিয়' : 'Popular'}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm">{pkg.name[language]}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{pkg.description[language]}</p>
                      <p className="text-lg font-bold text-primary">{formatCurrency(pkg.price)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Total Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>{language === 'bn' ? 'মোট' : 'Total'}</span>
                <span className="text-primary">{formatCurrency(calculateTotal())}</span>
              </div>
              {selectedBundles.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'bn' 
                    ? `ডোমেইন + ${selectedBundles.length}টি প্যাকেজ` 
                    : `Domain + ${selectedBundles.length} package(s)`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Customer Form */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{domain.domain}</span>
                  {selectedBundles.length > 0 && (
                    <span className="text-sm text-muted-foreground ml-2">
                      + {selectedBundles.length} {language === 'bn' ? 'টি প্যাকেজ' : 'package(s)'}
                    </span>
                  )}
                </div>
                <span className="font-bold text-primary">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{language === 'bn' ? 'আপনার নাম' : 'Your Name'} *</Label>
                <Input id="name" placeholder={language === 'bn' ? 'নাম লিখুন' : 'Enter your name'} {...form.register('name')} className="mt-1" />
                {form.formState.errors.name && <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="phone">{language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'} *</Label>
                <Input id="phone" placeholder={language === 'bn' ? '01XXXXXXXXX' : '01XXXXXXXXX'} {...form.register('phone')} className="mt-1" />
                {form.formState.errors.phone && <p className="text-xs text-destructive mt-1">{form.formState.errors.phone.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">{language === 'bn' ? 'ইমেইল' : 'Email'} *</Label>
                <Input id="email" type="email" placeholder={language === 'bn' ? 'example@email.com' : 'example@email.com'} {...form.register('email')} className="mt-1" />
                {form.formState.errors.email && <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="message">{language === 'bn' ? 'অতিরিক্ত তথ্য (ঐচ্ছিক)' : 'Additional Info (Optional)'}</Label>
                <Textarea id="message" placeholder={language === 'bn' ? 'কোনো বিশেষ নির্দেশনা থাকলে লিখুন' : 'Any special instructions'} {...form.register('message')} className="mt-1" rows={3} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{domain.domain}</span>
                  {selectedBundles.length > 0 && (
                    <span className="text-sm text-muted-foreground ml-2">
                      + {selectedBundles.length} {language === 'bn' ? 'টি প্যাকেজ' : 'package(s)'}
                    </span>
                  )}
                </div>
                <span className="font-bold text-primary">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            <p className="text-center text-muted-foreground">
              {language === 'bn' ? 'পেমেন্ট মেথড বেছে নিন' : 'Choose payment method'}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <Card
                className={cn('cursor-pointer transition-all hover:border-primary/50', paymentMethod === 'bkash_personal' && 'border-primary ring-2 ring-primary/20')}
                onClick={() => setPaymentMethod('bkash_personal')}
              >
                <CardContent className="p-4 text-center">
                  <Smartphone className="h-8 w-8 mx-auto mb-2 text-pink-500" />
                  <h3 className="font-semibold">{language === 'bn' ? 'বিকাশ' : 'bKash'}</h3>
                  <p className="text-xs text-muted-foreground">Send Money</p>
                </CardContent>
              </Card>
              <Card
                className={cn('cursor-pointer transition-all hover:border-primary/50', paymentMethod === 'bank_transfer' && 'border-primary ring-2 ring-primary/20')}
                onClick={() => setPaymentMethod('bank_transfer')}
              >
                <CardContent className="p-4 text-center">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">{language === 'bn' ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer'}</h3>
                  <p className="text-xs text-muted-foreground">DBBL</p>
                </CardContent>
              </Card>
            </div>

            {paymentMethod && (
              <div className="bg-muted/50 rounded-lg p-4 mt-4">
                {paymentMethod === 'bkash_personal' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{language === 'bn' ? 'বিকাশ নম্বর' : 'bKash Number'}</span>
                      <div className="flex items-center gap-2">
                        <code className="font-bold">{paymentInfo.bkash_personal.number}</code>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(paymentInfo.bkash_personal.number)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <ul className="text-xs space-y-1">
                      {paymentInfo.bkash_personal.instructions[language].map((inst, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary font-bold">{i + 1}.</span>
                          {inst}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'bn' ? 'ব্যাংক' : 'Bank'}</span>
                      <span className="font-medium">{paymentInfo.bank_transfer.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'bn' ? 'একাউন্ট নাম' : 'Account Name'}</span>
                      <span className="font-medium">{paymentInfo.bank_transfer.accountName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{language === 'bn' ? 'একাউন্ট নম্বর' : 'Account No'}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{paymentInfo.bank_transfer.accountNumber}</span>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(paymentInfo.bank_transfer.accountNumber)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {paymentMethod && (
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'পেমেন্ট স্ক্রিনশট (ঐচ্ছিক)' : 'Payment Screenshot (Optional)'}</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label htmlFor="screenshot-upload" className="cursor-pointer">
                    {screenshotFile ? (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm">{screenshotFile.name}</span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        <p className="text-sm">{language === 'bn' ? 'স্ক্রিনশট আপলোড করুন' : 'Upload screenshot'}</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={step === 1 ? handleClose : handleBack} disabled={isSubmitting}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {step === 1 ? (language === 'bn' ? 'বাতিল' : 'Cancel') : (language === 'bn' ? 'পেছনে' : 'Back')}
          </Button>

          {step < 3 ? (
            <Button onClick={handleNext} className="gradient-button">
              {language === 'bn' ? 'পরবর্তী' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={form.handleSubmit(handleSubmitOrder)}
              disabled={!paymentMethod || isSubmitting}
              className="gradient-button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {language === 'bn' ? 'অপেক্ষা করুন...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {language === 'bn' ? 'অর্ডার সম্পন্ন করুন' : 'Complete Order'}
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
