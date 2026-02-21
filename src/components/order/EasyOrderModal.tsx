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
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  User, 
  CreditCard,
  Upload,
  Loader2,
  CheckCircle2,
  Smartphone,
  Building2,
  Copy,
  Globe
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { DIGIWEBDEX_CONTACT } from '@/services/contactService';
import { HostingDomainSelector, SelectedDomain } from './HostingDomainSelector';

// Form validation schema
const customerFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().trim().min(10, 'Valid phone number required').max(20),
  email: z.string().trim().email('Valid email required').max(255),
  message: z.string().trim().max(500).optional(),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

export interface PackageOption {
  id: string;
  name: { en: string; bn: string };
  description: { en: string; bn: string };
  price: number;
  features: { en: string[]; bn: string[] };
  isPopular?: boolean;
  serviceType: string;
}

interface EasyOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages?: PackageOption[];
  preselectedPackage?: PackageOption;
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

const defaultPackages: PackageOption[] = [
  {
    id: 'hosting-basic',
    name: { en: 'Basic Hosting', bn: 'বেসিক হোস্টিং' },
    description: { en: 'Perfect for personal websites', bn: 'ব্যক্তিগত ওয়েবসাইটের জন্য' },
    price: 3500,
    serviceType: 'hosting',
    features: { en: ['5 GB SSD', '50 GB Bandwidth', 'Free SSL'], bn: ['৫ জিবি SSD', '৫০ জিবি ব্যান্ডউইথ', 'ফ্রি SSL'] },
  },
  {
    id: 'hosting-business',
    name: { en: 'Business Hosting', bn: 'বিজনেস হোস্টিং' },
    description: { en: 'For growing businesses', bn: 'বর্ধনশীল ব্যবসার জন্য' },
    price: 5900,
    serviceType: 'hosting',
    isPopular: true,
    features: { en: ['10 GB SSD', 'Unlimited Bandwidth', 'Priority Support'], bn: ['১০ জিবি SSD', 'আনলিমিটেড ব্যান্ডউইথ', 'অগ্রাধিকার সাপোর্ট'] },
  },
  {
    id: 'web-starter',
    name: { en: 'Starter Website', bn: 'স্টার্টার ওয়েবসাইট' },
    description: { en: '5 Page business website', bn: '৫ পেজ বিজনেস ওয়েবসাইট' },
    price: 15000,
    serviceType: 'web_development',
    features: { en: ['5 Pages', 'Responsive', 'SEO Optimized'], bn: ['৫ পেজ', 'রেসপন্সিভ', 'SEO অপ্টিমাইজড'] },
  },
  {
    id: 'web-business',
    name: { en: 'Business Website', bn: 'বিজনেস ওয়েবসাইট' },
    description: { en: 'Professional presence', bn: 'প্রফেশনাল উপস্থিতি' },
    price: 35000,
    serviceType: 'web_development',
    isPopular: true,
    features: { en: ['15 Pages', 'Custom Design', 'Admin Panel'], bn: ['১৫ পেজ', 'কাস্টম ডিজাইন', 'অ্যাডমিন প্যানেল'] },
  },
  {
    id: 'web-ecommerce',
    name: { en: 'E-commerce', bn: 'ই-কমার্স' },
    description: { en: 'Full online store', bn: 'সম্পূর্ণ অনলাইন স্টোর' },
    price: 75000,
    serviceType: 'web_development',
    features: { en: ['Unlimited Products', 'Payment Gateway', 'Inventory'], bn: ['আনলিমিটেড প্রোডাক্ট', 'পেমেন্ট গেটওয়ে', 'ইনভেন্টরি'] },
  },
];

export function EasyOrderModal({ isOpen, onClose, packages = defaultPackages, preselectedPackage }: EasyOrderModalProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  
  // If a package is preselected, skip step 1 entirely
  const hasPreselection = !!preselectedPackage;
  const [step, setStep] = useState(hasPreselection ? 2 : 1);
  const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(preselectedPackage || null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  
  // Domain selection state for hosting orders
  const [selectedDomain, setSelectedDomain] = useState<SelectedDomain | null>(null);
  
  // Check if current package is hosting
  const isHostingPackage = selectedPackage?.serviceType === 'hosting';

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: user?.email || '',
      message: '',
    },
  });
  
  // Reset state when modal opens with new preselection
  React.useEffect(() => {
    if (isOpen && preselectedPackage) {
      setSelectedPackage(preselectedPackage);
      setStep(2);
    } else if (isOpen && !preselectedPackage) {
      setStep(1);
      setSelectedPackage(null);
    }
  }, [isOpen, preselectedPackage]);

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

  const handleSubmitOrder = async (data: CustomerFormData) => {
    if (!selectedPackage || !paymentMethod) return;
    
    // Validate domain for hosting orders
    if (isHostingPackage && !selectedDomain?.isValid) {
      toast.error(language === 'bn' ? 'হোস্টিং অর্ডারের জন্য ডোমেইন আবশ্যক।' : 'Domain is required for hosting order.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate order number
      const { data: orderNum } = await supabase.rpc('generate_order_number');
      const generatedOrderNumber = orderNum || `ORD-${Date.now()}`;

      // Calculate total with domain price if new domain selected
      const domainPrice = selectedDomain?.type === 'new' && selectedDomain.price ? selectedDomain.price : 0;
      const totalAmount = selectedPackage.price + domainPrice;

      // Create order
      const orderInsert = {
        order_number: generatedOrderNumber,
        user_id: user?.id || null,
        service_type: selectedPackage.serviceType as 'hosting' | 'domain' | 'web_development' | 'software_development' | 'digital_marketing',
        billing_type: (selectedPackage.serviceType === 'hosting' ? 'yearly' : 'one_time') as 'one_time' | 'recurring' | 'milestone',
        subtotal: totalAmount,
        total: totalAmount,
        status: 'pending' as const,
        notes: `Package: ${selectedPackage.name.en}\nDomain: ${selectedDomain?.domainName || 'N/A'} (${selectedDomain?.type || 'N/A'})\nCustomer: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nMessage: ${data.message || 'N/A'}`,
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
          amount: totalAmount,
          screenshot_url: screenshotUrl,
          notes: `Customer: ${data.name}, Phone: ${data.phone}, Email: ${data.email}`,
          status: 'pending',
        });

      // Store order meta
      const metaEntries = [
        { order_id: order.id, meta_key: 'customer_name', meta_value: data.name },
        { order_id: order.id, meta_key: 'customer_phone', meta_value: data.phone },
        { order_id: order.id, meta_key: 'customer_email', meta_value: data.email },
        { order_id: order.id, meta_key: 'package_name', meta_value: selectedPackage.name.en },
        { order_id: order.id, meta_key: 'payment_method', meta_value: paymentMethod },
      ];
      
      // Add domain meta for hosting orders
      if (isHostingPackage && selectedDomain) {
        metaEntries.push(
          { order_id: order.id, meta_key: 'domain_name', meta_value: selectedDomain.domainName },
          { order_id: order.id, meta_key: 'domain_type', meta_value: selectedDomain.type }
        );
        if (selectedDomain.type === 'new' && selectedDomain.price) {
          metaEntries.push(
            { order_id: order.id, meta_key: 'domain_price', meta_value: String(selectedDomain.price) }
          );
        }
      }
      
      await supabase.from('order_meta').insert(metaEntries);

      // Send multi-channel notifications via edge function
      try {
        await supabase.functions.invoke('contact-notification', {
          body: {
            type: screenshotUrl ? 'payment_received' : 'order_created',
            orderNumber: generatedOrderNumber,
            customerName: data.name,
            customerPhone: data.phone,
            customerEmail: data.email,
            packageName: selectedPackage.name.en,
            amount: selectedPackage.price,
            paymentMethod: paymentMethod,
          },
        });
      } catch (notifError) {
        console.error('Notification error (non-blocking):', notifError);
      }

      // Create in-app notification for admin
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
    if (step === 1 && !selectedPackage) {
      toast.error(language === 'bn' ? 'একটি প্যাকেজ বেছে নিন' : 'Please select a package');
      return;
    }
    if (step === 2) {
      // Validate domain for hosting orders before proceeding
      if (isHostingPackage && !selectedDomain?.isValid) {
        toast.error(language === 'bn' ? 'হোস্টিং অর্ডারের জন্য ডোমেইন আবশ্যক।' : 'Domain is required for hosting order.');
        return;
      }
      form.handleSubmit((data) => {
        setStep(3);
      })();
      return;
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    // If preselected, don't go back to step 1, just close
    if (hasPreselection && step === 2) {
      handleClose();
      return;
    }
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleClose = () => {
    setStep(1);
    setSelectedPackage(null);
    setPaymentMethod(null);
    setOrderComplete(false);
    setOrderNumber('');
    setScreenshotFile(null);
    setSelectedDomain(null);
    form.reset();
    onClose();
  };

  const steps = [
    { num: 1, label: language === 'bn' ? 'প্যাকেজ' : 'Package', icon: Package },
    { num: 2, label: language === 'bn' ? 'তথ্য' : 'Details', icon: User },
    { num: 3, label: language === 'bn' ? 'পেমেন্ট' : 'Payment', icon: CreditCard },
  ];

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
              {language === 'bn'
                ? 'আপনার অর্ডার নম্বর:' 
                : 'Your order number:'}
            </p>
            <div className="bg-primary/10 rounded-lg p-4 mb-6">
              <code className="text-lg font-bold text-primary">{orderNumber}</code>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {language === 'bn'
                ? 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।'
                : 'We will contact you soon.'}
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {language === 'bn' ? 'সহজে অর্ডার করুন' : 'Easy Order'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-6 px-4">
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    step >= s.num
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {step > s.num ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className="text-xs mt-1 hidden sm:block">{s.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2 rounded transition-all',
                    step > s.num ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Package Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground mb-4">
              {language === 'bn' ? 'আপনার প্যাকেজ বেছে নিন' : 'Choose your package'}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={cn(
                    'cursor-pointer transition-all hover:border-primary/50',
                    selectedPackage?.id === pkg.id && 'border-primary ring-2 ring-primary/20'
                  )}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{pkg.name[language]}</h3>
                        <p className="text-xs text-muted-foreground">{pkg.description[language]}</p>
                      </div>
                      {pkg.isPopular && (
                        <Badge variant="secondary" className="text-xs">
                          {language === 'bn' ? 'জনপ্রিয়' : 'Popular'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xl font-bold text-primary mb-2">
                      {formatCurrency(pkg.price)}
                    </p>
                    <ul className="text-xs space-y-1">
                      {pkg.features[language].slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Customer Form */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Package Summary with Domain */}
            {selectedPackage && (
              <div className="bg-muted/50 rounded-lg p-3 mb-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{selectedPackage.name[language]}</span>
                  <span className="font-bold text-primary">{formatCurrency(selectedPackage.price)}</span>
                </div>
                {selectedDomain?.isValid && selectedDomain.type === 'new' && selectedDomain.price && (
                  <div className="flex justify-between items-center text-sm border-t pt-2">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {selectedDomain.domainName}
                    </span>
                    <span className="text-primary">+{formatCurrency(selectedDomain.price)}</span>
                  </div>
                )}
                {selectedDomain?.isValid && selectedDomain.type === 'existing' && (
                  <div className="flex justify-between items-center text-sm border-t pt-2">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {selectedDomain.domainName}
                    </span>
                    <span className="text-xs text-muted-foreground">{language === 'bn' ? 'পূর্বের ডোমেইন' : 'Existing'}</span>
                  </div>
                )}
                {selectedDomain?.isValid && selectedDomain.type === 'new' && selectedDomain.price && (
                  <div className="flex justify-between items-center font-bold border-t pt-2">
                    <span>{language === 'bn' ? 'মোট' : 'Total'}</span>
                    <span className="text-primary">{formatCurrency(selectedPackage.price + selectedDomain.price)}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Domain Selector for Hosting */}
            {isHostingPackage && (
              <HostingDomainSelector
                selectedDomain={selectedDomain}
                onDomainChange={setSelectedDomain}
              />
            )}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{language === 'bn' ? 'আপনার নাম' : 'Your Name'} *</Label>
                <Input
                  id="name"
                  placeholder={language === 'bn' ? 'নাম লিখুন' : 'Enter your name'}
                  {...form.register('name')}
                  className="mt-1"
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">{language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'} *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  {...form.register('phone')}
                  className="mt-1"
                />
                {form.formState.errors.phone && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.phone.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">{language === 'bn' ? 'ইমেইল' : 'Email'} *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...form.register('email')}
                  className="mt-1"
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="message">{language === 'bn' ? 'বার্তা (ঐচ্ছিক)' : 'Message (Optional)'}</Label>
                <Textarea
                  id="message"
                  placeholder={language === 'bn' ? 'বিস্তারিত লিখুন...' : 'Any additional details...'}
                  {...form.register('message')}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment Method */}
        {step === 3 && (
          <div className="space-y-4">
            {selectedPackage && (
              <div className="bg-muted/50 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{selectedPackage.name[language]}</span>
                  <span className="font-bold text-primary">{formatCurrency(selectedPackage.price)}</span>
                </div>
              </div>
            )}

            <p className="text-center text-muted-foreground">
              {language === 'bn' ? 'পেমেন্ট মেথড বেছে নিন' : 'Select payment method'}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* bKash */}
              <Card
                className={cn(
                  'cursor-pointer transition-all hover:border-primary/50',
                  paymentMethod === 'bkash_personal' && 'border-primary ring-2 ring-primary/20'
                )}
                onClick={() => setPaymentMethod('bkash_personal')}
              >
                <CardContent className="p-4 text-center">
                  <Smartphone className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">{language === 'bn' ? 'বিকাশ' : 'bKash'}</h3>
                  <p className="text-xs text-muted-foreground">{language === 'bn' ? 'পার্সোনাল' : 'Personal'}</p>
                </CardContent>
              </Card>

              {/* Bank Transfer */}
              <Card
                className={cn(
                  'cursor-pointer transition-all hover:border-primary/50',
                  paymentMethod === 'bank_transfer' && 'border-primary ring-2 ring-primary/20'
                )}
                onClick={() => setPaymentMethod('bank_transfer')}
              >
                <CardContent className="p-4 text-center">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">{language === 'bn' ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer'}</h3>
                  <p className="text-xs text-muted-foreground">{language === 'bn' ? 'DBBL' : 'DBBL'}</p>
                </CardContent>
              </Card>
            </div>

            {/* Payment Instructions */}
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
                        <code className="font-bold">{paymentInfo.bank_transfer.accountNumber}</code>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(paymentInfo.bank_transfer.accountNumber)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'bn' ? 'ব্রাঞ্চ' : 'Branch'}</span>
                      <span className="font-medium">{paymentInfo.bank_transfer.branch}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Screenshot Upload */}
            {paymentMethod && (
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'পেমেন্ট স্ক্রিনশট (ঐচ্ছিক)' : 'Payment Screenshot (Optional)'}</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="screenshot-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setScreenshotFile(file);
                    }}
                  />
                  <label htmlFor="screenshot-upload" className="cursor-pointer">
                    {screenshotFile ? (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm">{screenshotFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="h-8 w-8" />
                        <span className="text-sm">{language === 'bn' ? 'স্ক্রিনশট আপলোড করুন' : 'Upload screenshot'}</span>
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
          <Button variant="outline" onClick={(step === 1 || (hasPreselection && step === 2)) ? handleClose : handleBack} disabled={isSubmitting}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {(step === 1 || (hasPreselection && step === 2)) ? (language === 'bn' ? 'বাতিল' : 'Cancel') : (language === 'bn' ? 'পেছনে' : 'Back')}
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
