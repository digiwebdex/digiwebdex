import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { SchemaMarkup, MultiSchemaMarkup } from '@/components/seo/SchemaMarkup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Check, X, ArrowRight, Shield, RefreshCw, Headphones, Star, Zap, Phone, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EasyOrderModal, PackageOption } from '@/components/order/EasyOrderModal';
import { seoService } from '@/services/seo';

interface PricingPlan {
  id: string;
  name: { en: string; bn: string };
  description: { en: string; bn: string };
  price: number;
  billingCycle: { en: string; bn: string };
  features: { en: string[]; bn: string[] };
  isPopular?: boolean;
  serviceType: string;
}

const pricingPlans: PricingPlan[] = [
  // Hosting Plans
  {
    id: 'hosting-basic',
    name: { en: 'Starter Hosting', bn: 'স্টার্টার হোস্টিং' },
    description: { en: 'Perfect for personal or small websites', bn: 'ব্যক্তিগত বা ছোট ওয়েবসাইটের জন্য উপযুক্ত' },
    price: 3500,
    billingCycle: { en: '/year', bn: '/বছর' },
    serviceType: 'hosting',
    features: {
      en: ['5 GB SSD Storage', '50 GB Bandwidth', '5 Email Accounts', 'Free SSL Certificate', 'cPanel Access'],
      bn: ['৫ জিবি SSD স্টোরেজ', '৫০ জিবি ব্যান্ডউইথ', '৫টি ইমেইল অ্যাকাউন্ট', 'ফ্রি SSL সার্টিফিকেট', 'cPanel অ্যাক্সেস'],
    },
  },
  {
    id: 'hosting-business',
    name: { en: 'Business Hosting', bn: 'বিজনেস হোস্টিং' },
    description: { en: 'For growing businesses', bn: 'বর্ধনশীল ব্যবসার জন্য' },
    price: 5900,
    billingCycle: { en: '/year', bn: '/বছর' },
    serviceType: 'hosting',
    isPopular: true,
    features: {
      en: ['10 GB SSD Storage', 'Unlimited Bandwidth', '10 Email Accounts', 'Free SSL & CDN', 'Daily Backup', 'Priority Support'],
      bn: ['১০ জিবি SSD স্টোরেজ', 'আনলিমিটেড ব্যান্ডউইথ', '১০টি ইমেইল অ্যাকাউন্ট', 'ফ্রি SSL ও CDN', 'দৈনিক ব্যাকআপ', 'অগ্রাধিকার সাপোর্ট'],
    },
  },
  {
    id: 'hosting-enterprise',
    name: { en: 'Premium Hosting', bn: 'প্রিমিয়াম হোস্টিং' },
    description: { en: 'For large scale projects', bn: 'বড় প্রজেক্টের জন্য' },
    price: 14500,
    billingCycle: { en: '/year', bn: '/বছর' },
    serviceType: 'hosting',
    features: {
      en: ['20 GB SSD Storage', 'Unlimited Bandwidth', 'Unlimited Email', 'Free Domain', 'Dedicated IP', 'Premium Support', 'Malware Scan'],
      bn: ['২০ জিবি SSD স্টোরেজ', 'আনলিমিটেড ব্যান্ডউইথ', 'আনলিমিটেড ইমেইল', 'ফ্রি ডোমেইন', 'ডেডিকেটেড IP', 'প্রিমিয়াম সাপোর্ট', 'ম্যালওয়্যার স্ক্যান'],
    },
  },
  // Web Development Plans
  {
    id: 'web-starter',
    name: { en: 'Basic Website', bn: 'বেসিক ওয়েবসাইট' },
    description: { en: 'Simple business website', bn: 'সাধারণ বিজনেস ওয়েবসাইট' },
    price: 15000,
    billingCycle: { en: '', bn: '' },
    serviceType: 'web_development',
    features: {
      en: ['5 Pages', 'Responsive Design', 'Contact Form', 'SEO Optimized', 'AI Chatbot Setup', '1 Year Support'],
      bn: ['৫টি পেজ', 'রেসপন্সিভ ডিজাইন', 'কন্টাক্ট ফর্ম', 'SEO অপ্টিমাইজড', 'AI চ্যাটবট সেটআপ', '১ বছর সাপোর্ট'],
    },
  },
  {
    id: 'web-business',
    name: { en: 'Business Website + Software', bn: 'বিজনেস ওয়েবসাইট + সফটওয়্যার সহ' },
    description: { en: 'Website with business software', bn: 'সফটওয়্যার সহ বিজনেস ওয়েবসাইট' },
    price: 30000,
    billingCycle: { en: '', bn: '' },
    serviceType: 'web_development',
    isPopular: true,
    features: {
      en: ['15 Pages', 'Custom Design', 'Blog Section', 'Admin Panel', 'Business Software', 'SEO Optimized', 'AI Chatbot Setup', '1 Year Support'],
      bn: ['১৫টি পেজ', 'কাস্টম ডিজাইন', 'ব্লগ সেকশন', 'অ্যাডমিন প্যানেল', 'বিজনেস সফটওয়্যার সহ', 'SEO অপ্টিমাইজড', 'AI চ্যাটবট সেটআপ', '১ বছর সাপোর্ট'],
    },
  },
  {
    id: 'web-ecommerce',
    name: { en: 'E-commerce + ERP Software', bn: 'ই-কমার্স + ERP সফটওয়্যার সহ' },
    description: { en: 'Full online store with ERP', bn: 'ERP সফটওয়্যার সহ সম্পূর্ণ অনলাইন স্টোর' },
    price: 50000,
    billingCycle: { en: '', bn: '' },
    serviceType: 'web_development',
    features: {
      en: ['Unlimited Products', 'Payment Gateway', 'Order Management', 'Inventory System', 'ERP Software', 'Admin Dashboard', 'AI Chatbot Setup', '1 Year Support'],
      bn: ['আনলিমিটেড প্রোডাক্ট', 'পেমেন্ট গেটওয়ে', 'অর্ডার ম্যানেজমেন্ট', 'ইনভেন্টরি সিস্টেম', 'ERP সফটওয়্যার সহ', 'অ্যাডমিন ড্যাশবোর্ড', 'AI চ্যাটবট সেটআপ', '১ বছর সাপোর্ট'],
    },
  },
  // Software Development Plans
  {
    id: 'software-starter',
    name: { en: 'Starter Software', bn: 'স্টার্টার সফটওয়্যার' },
    description: { en: 'Small business automation', bn: 'ছোট ব্যবসার অটোমেশন' },
    price: 30000,
    billingCycle: { en: '', bn: '' },
    serviceType: 'software_development',
    features: {
      en: ['Basic Features', 'Single User', 'Cloud Hosting', 'Mobile Responsive', 'AI Chatbot Setup', '1 Year Support'],
      bn: ['বেসিক ফিচার', 'সিঙ্গেল ইউজার', 'ক্লাউড হোস্টিং', 'মোবাইল রেসপন্সিভ', 'AI চ্যাটবট সেটআপ', '১ বছর সাপোর্ট'],
    },
  },
  {
    id: 'software-business',
    name: { en: 'Business Software', bn: 'বিজনেস সফটওয়্যার' },
    description: { en: 'Medium business solution', bn: 'মাঝারি ব্যবসার সলিউশন' },
    price: 60000,
    billingCycle: { en: '', bn: '' },
    serviceType: 'software_development',
    isPopular: true,
    features: {
      en: ['Advanced Features', 'Multi-User', 'Role Management', 'Reports & Analytics', 'API Integration', 'AI Chatbot Setup', '1 Year Support'],
      bn: ['অ্যাডভান্সড ফিচার', 'মাল্টি-ইউজার', 'রোল ম্যানেজমেন্ট', 'রিপোর্ট ও অ্যানালিটিক্স', 'API ইন্টিগ্রেশন', 'AI চ্যাটবট সেটআপ', '১ বছর সাপোর্ট'],
    },
  },
  {
    id: 'software-enterprise',
    name: { en: 'Enterprise Software', bn: 'এন্টারপ্রাইজ সফটওয়্যার' },
    description: { en: 'Large scale ERP/POS', bn: 'বড় মাপের ERP/POS' },
    price: 100000,
    billingCycle: { en: '', bn: '' },
    serviceType: 'software_development',
    features: {
      en: ['Full ERP/POS', 'Unlimited Users', 'Multi-Branch', 'Mobile App', 'Custom Modules', 'AI Chatbot Setup', 'Dedicated Support', '1 Year AMC'],
      bn: ['সম্পূর্ণ ERP/POS', 'আনলিমিটেড ইউজার', 'মাল্টি-ব্র্যাঞ্চ', 'মোবাইল অ্যাপ', 'কাস্টম মডিউল', 'AI চ্যাটবট সেটআপ', 'ডেডিকেটেড সাপোর্ট', '১ বছর AMC'],
    },
  },
  // Digital Marketing Plans
  {
    id: 'marketing-starter',
    name: { en: 'Starter Marketing', bn: 'স্টার্টার মার্কেটিং' },
    description: { en: 'Basic digital presence', bn: 'বেসিক ডিজিটাল উপস্থিতি' },
    price: 5000,
    billingCycle: { en: '/month', bn: '/মাস' },
    serviceType: 'digital_marketing',
    features: {
      en: ['Social Media Management', '10 Posts/Month', 'Basic SEO', 'AI Chatbot Setup', 'Monthly Report'],
      bn: ['সোশ্যাল মিডিয়া ম্যানেজমেন্ট', '১০টি পোস্ট/মাস', 'বেসিক SEO', 'AI চ্যাটবট সেটআপ', 'মাসিক রিপোর্ট'],
    },
  },
  {
    id: 'marketing-business',
    name: { en: 'Business Marketing', bn: 'বিজনেস মার্কেটিং' },
    description: { en: 'Growth focused', bn: 'গ্রোথ ফোকাসড' },
    price: 8000,
    billingCycle: { en: '/month', bn: '/মাস' },
    serviceType: 'digital_marketing',
    isPopular: true,
    features: {
      en: ['Social Media Management', '20 Posts/Month', 'Facebook & Google Ads', 'SEO Optimization', 'Content Creation', 'AI Chatbot Setup', 'Weekly Report'],
      bn: ['সোশ্যাল মিডিয়া ম্যানেজমেন্ট', '২০টি পোস্ট/মাস', 'ফেসবুক ও গুগল অ্যাডস', 'SEO অপ্টিমাইজেশন', 'কন্টেন্ট ক্রিয়েশন', 'AI চ্যাটবট সেটআপ', 'সাপ্তাহিক রিপোর্ট'],
    },
  },
  {
    id: 'marketing-premium',
    name: { en: 'Premium Marketing', bn: 'প্রিমিয়াম মার্কেটিং' },
    description: { en: 'Complete solution', bn: 'সম্পূর্ণ সলিউশন' },
    price: 15000,
    billingCycle: { en: '/month', bn: '/মাস' },
    serviceType: 'digital_marketing',
    features: {
      en: ['Full Digital Strategy', 'Unlimited Posts', 'Paid Ads Management', 'Advanced SEO', 'Video Content', 'Influencer Marketing', 'AI Chatbot Setup', 'Daily Report'],
      bn: ['সম্পূর্ণ ডিজিটাল স্ট্র্যাটেজি', 'আনলিমিটেড পোস্ট', 'পেইড অ্যাডস ম্যানেজমেন্ট', 'অ্যাডভান্সড SEO', 'ভিডিও কন্টেন্ট', 'ইনফ্লুয়েন্সার মার্কেটিং', 'AI চ্যাটবট সেটআপ', 'দৈনিক রিপোর্ট'],
    },
  },
];

// FAQ data
const pricingFaqs = [
  {
    question: { en: 'Do you offer payment plans?', bn: 'কিস্তিতে পেমেন্ট করা যায়?' },
    answer: { en: 'Yes, for projects above ৳30,000, we offer 2-3 installment payment options.', bn: 'হ্যাঁ, ৳৩০,০০০ এর উপরে প্রজেক্টে ২-৩ কিস্তিতে পেমেন্ট করা যায়।' }
  },
  {
    question: { en: 'What payment methods do you accept?', bn: 'কোন পেমেন্ট মেথড গ্রহণ করেন?' },
    answer: { en: 'We accept bKash, Nagad, Rocket, Bank Transfer, and Cards.', bn: 'বিকাশ, নগদ, রকেট, ব্যাংক ট্রান্সফার এবং কার্ড পেমেন্ট গ্রহণ করি।' }
  },
  {
    question: { en: 'Is there a refund policy?', bn: 'রিফান্ড পলিসি কি?' },
    answer: { en: 'For hosting: 30-day money-back guarantee. For development: Refund before design approval minus 20% processing fee.', bn: 'হোস্টিং এ ৩০ দিনের মানি-ব্যাক গ্যারান্টি। ডেভেলপমেন্টে ডিজাইন অ্যাপ্রুভাল আগে রিফান্ড সম্ভব (২০% প্রসেসিং ফি কাটা হবে)।' }
  },
  {
    question: { en: 'What is included in support?', bn: 'সাপোর্টে কী কী অন্তর্ভুক্ত?' },
    answer: { en: 'Bug fixes, minor updates, content changes, and technical assistance via WhatsApp/Email.', bn: 'বাগ ফিক্স, ছোট আপডেট, কন্টেন্ট পরিবর্তন এবং WhatsApp/Email এ টেকনিক্যাল সহায়তা।' }
  },
  {
    question: { en: 'Can I upgrade my package later?', bn: 'পরে প্যাকেজ আপগ্রেড করতে পারব?' },
    answer: { en: 'Yes, you can upgrade anytime by paying the difference.', bn: 'হ্যাঁ, পার্থক্য মূল্য দিয়ে যেকোনো সময় আপগ্রেড করা যায়।' }
  },
  {
    question: { en: 'Do you offer custom packages?', bn: 'কাস্টম প্যাকেজ পাওয়া যায়?' },
    answer: { en: 'Absolutely! Contact us for a custom quote based on your specific requirements.', bn: 'অবশ্যই! আপনার প্রয়োজন অনুযায়ী কাস্টম কোটেশনের জন্য যোগাযোগ করুন।' }
  }
];

// Trust badges
const trustBadges = [
  { icon: Shield, label: { en: '100% Secure Payment', bn: '১০০% সিকিউর পেমেন্ট' } },
  { icon: RefreshCw, label: { en: '30-Day Money Back', bn: '৩০ দিনের মানি-ব্যাক' } },
  { icon: Headphones, label: { en: '24/7 Support', bn: '২৪/৭ সাপোর্ট' } },
  { icon: Star, label: { en: '5.0 Rating', bn: '৫.০ রেটিং' } },
];

export default function Pricing() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const basePath = language === 'en' ? '/en' : '/bn';
  const baseUrl = 'https://digiwebdex.com';
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PackageOption | undefined>(undefined);

  // SEO schemas
  const faqSchema = seoService.generateFAQSchema(
    pricingFaqs.map(faq => ({
      question: faq.question[language],
      answer: faq.answer[language]
    }))
  );
  const breadcrumbSchema = seoService.generateBreadcrumbSchema([
    { name: language === 'bn' ? 'হোম' : 'Home', url: baseUrl },
    { name: language === 'bn' ? 'মূল্য তালিকা' : 'Pricing', url: `${baseUrl}${basePath}/pricing` }
  ]);

  const handleOrderClick = (plan: PricingPlan) => {
    const packageOption: PackageOption = {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      features: plan.features,
      isPopular: plan.isPopular,
      serviceType: plan.serviceType,
    };
    setSelectedPlan(packageOption);
    setIsOrderModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const hostingPlans = pricingPlans.filter(p => p.serviceType === 'hosting');
  const webPlans = pricingPlans.filter(p => p.serviceType === 'web_development');
  const softwarePlans = pricingPlans.filter(p => p.serviceType === 'software_development');
  const marketingPlans = pricingPlans.filter(p => p.serviceType === 'digital_marketing');

  return (
    <Layout>
      <SEOHead
        title={language === 'bn' 
          ? 'ওয়েবসাইট তৈরি খরচ বাংলাদেশ ২০২৬ | ওয়েব ডেভেলপমেন্ট মূল্য তালিকা' 
          : 'Website Development Cost Bangladesh 2026 | Web Development Pricing'}
        description={language === 'bn' 
          ? 'বাংলাদেশে ওয়েবসাইট তৈরি খরচ কত? ওয়েব ডেভেলপমেন্ট ৳১৫,০০০ থেকে, সফটওয়্যার ৳৩০,০০০ থেকে, ই-কমার্স ৳৫০,০০০ থেকে। AI চ্যাটবট ও ১ বছর সাপোর্ট সহ।'
          : 'How much does a website cost in Bangladesh? Web development from ৳15,000, software from ৳30,000, e-commerce from ৳50,000. AI chatbot & 1 year support included.'}
        keywords={['website development cost bangladesh', 'ওয়েবসাইট তৈরি খরচ', 'web development price dhaka', 'ওয়েব ডেভেলপমেন্ট মূল্য', 'software development cost', 'সফটওয়্যার ডেভেলপমেন্ট খরচ', 'e-commerce website price', 'ই-কমার্স ওয়েবসাইট দাম', 'ERP software price bangladesh', 'digital marketing cost', 'hosting price bangladesh']}
        canonicalUrl={`${baseUrl}${basePath}/pricing`}
        breadcrumbs={[
          { name: language === 'bn' ? 'হোম' : 'Home', url: `/${language}` },
          { name: language === 'bn' ? 'মূল্য তালিকা' : 'Pricing', url: `/${language}/pricing` },
        ]}
      />
      <MultiSchemaMarkup schemas={[
        { schema: faqSchema, id: 'faq-schema' },
        { schema: breadcrumbSchema, id: 'breadcrumb-schema' }
      ]} />

      {/* Breadcrumb */}
      <div className="bg-muted/30 py-3 border-b border-border/50">
        <div className="container-custom">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={basePath}>{language === 'bn' ? 'হোম' : 'Home'}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{language === 'bn' ? 'মূল্য তালিকা' : 'Pricing'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="py-16 md:py-24">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              💰 {language === 'bn' ? 'স্বচ্ছ মূল্য নীতি' : 'Transparent Pricing'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'bn' ? 'মূল্য তালিকা' : 'Pricing Plans'}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {language === 'bn'
                ? 'কোনো লুকানো খরচ নেই। আপনার প্রয়োজন অনুযায়ী সেরা প্যাকেজ বেছে নিন।'
                : 'No hidden costs. Choose the perfect package for your needs.'}
            </p>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
                <badge.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{badge.label[language]}</span>
              </div>
            ))}
          </div>

          {/* Pricing Tabs */}
          <Tabs defaultValue="hosting" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-12 h-auto p-1">
              <TabsTrigger value="hosting" className="py-3 text-xs sm:text-sm">
                {language === 'bn' ? 'হোস্টিং' : 'Hosting'}
              </TabsTrigger>
              <TabsTrigger value="web" className="py-3 text-xs sm:text-sm">
                {language === 'bn' ? 'ওয়েব' : 'Web'}
              </TabsTrigger>
              <TabsTrigger value="software" className="py-3 text-xs sm:text-sm">
                {language === 'bn' ? 'সফটওয়্যার' : 'Software'}
              </TabsTrigger>
              <TabsTrigger value="marketing" className="py-3 text-xs sm:text-sm">
                {language === 'bn' ? 'মার্কেটিং' : 'Marketing'}
              </TabsTrigger>
            </TabsList>

            {/* Hosting Plans */}
            <TabsContent value="hosting">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold">
                  {language === 'bn' ? 'ওয়েব হোস্টিং প্যাকেজ' : 'Web Hosting Packages'}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {language === 'bn' ? 'LiteSpeed সার্ভার, SSD NVMe স্টোরেজ সহ' : 'With LiteSpeed Server & SSD NVMe Storage'}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {hostingPlans.map((plan) => (
                  <PricingCard
                    key={plan.id}
                    plan={plan}
                    language={language}
                    formatCurrency={formatCurrency}
                    onOrder={() => handleOrderClick(plan)}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Web Development Plans */}
            <TabsContent value="web">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold">
                  {language === 'bn' ? 'ওয়েব ডেভেলপমেন্ট প্যাকেজ' : 'Web Development Packages'}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {language === 'bn' ? 'কাস্টম ডিজাইন, SEO অপ্টিমাইজড' : 'Custom Design, SEO Optimized'}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {webPlans.map((plan) => (
                  <PricingCard
                    key={plan.id}
                    plan={plan}
                    language={language}
                    formatCurrency={formatCurrency}
                    onOrder={() => handleOrderClick(plan)}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Software Plans */}
            <TabsContent value="software">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold">
                  {language === 'bn' ? 'সফটওয়্যার ডেভেলপমেন্ট প্যাকেজ' : 'Software Development Packages'}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {language === 'bn' ? 'ERP, POS, কাস্টম সফটওয়্যার' : 'ERP, POS, Custom Software'}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {softwarePlans.map((plan) => (
                  <PricingCard
                    key={plan.id}
                    plan={plan}
                    language={language}
                    formatCurrency={formatCurrency}
                    onOrder={() => handleOrderClick(plan)}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Marketing Plans */}
            <TabsContent value="marketing">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold">
                  {language === 'bn' ? 'ডিজিটাল মার্কেটিং প্যাকেজ' : 'Digital Marketing Packages'}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {language === 'bn' ? 'সোশ্যাল মিডিয়া, SEO, অ্যাডস' : 'Social Media, SEO, Ads'}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {marketingPlans.map((plan) => (
                  <PricingCard
                    key={plan.id}
                    plan={plan}
                    language={language}
                    formatCurrency={formatCurrency}
                    onOrder={() => handleOrderClick(plan)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* FAQ Section */}
          <section className="mt-24">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                ❓ {language === 'bn' ? 'প্রশ্ন-উত্তর' : 'FAQ'}
              </span>
              <h2 className="text-3xl font-bold">
                {language === 'bn' ? 'সচরাচর জিজ্ঞাসা' : 'Frequently Asked Questions'}
              </h2>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {pricingFaqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`faq-${index}`}
                    className="glass-card border-border/50 px-6 rounded-xl"
                  >
                    <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                      {faq.question[language]}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5">
                      {faq.answer[language]}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* Custom CTA */}
          <section className="mt-20">
            <Card className="glass-card max-w-3xl mx-auto overflow-hidden">
              <div className="md:flex">
                <div className="md:w-2/3 p-8">
                  <h3 className="text-2xl font-bold mb-4">
                    {language === 'bn'
                      ? 'কাস্টম প্রজেক্ট প্রয়োজন?'
                      : 'Need a Custom Project?'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {language === 'bn'
                      ? 'আপনার নির্দিষ্ট প্রয়োজন অনুযায়ী কাস্টম সলিউশনের জন্য আমাদের সাথে কথা বলুন। ফ্রি কনসালটেশন দিচ্ছি।'
                      : 'Talk to us for a custom solution tailored to your specific needs. Free consultation available.'}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button size="lg" className="gradient-button" asChild>
                      <Link to={`${basePath}/contact`}>
                        {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <a href="https://wa.me/8801674533303" target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-2 w-4 h-4" />
                        WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="md:w-1/3 bg-gradient-to-br from-primary to-accent p-8 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Phone className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">+880 1674-533303</p>
                    <p className="text-sm text-white/80">
                      {language === 'bn' ? '২৪/৭ সাপোর্ট' : '24/7 Support'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>

      {/* Easy Order Modal */}
      <EasyOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedPlan(undefined);
        }}
        preselectedPackage={selectedPlan}
      />
    </Layout>
  );
}

function PricingCard({
  plan,
  language,
  formatCurrency,
  onOrder,
}: {
  plan: PricingPlan;
  language: 'en' | 'bn';
  formatCurrency: (amount: number) => string;
  onOrder: () => void;
}) {
  return (
    <Card className={`glass-card relative ${plan.isPopular ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''}`}>
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="gradient-button text-sm px-4 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" />
            {language === 'bn' ? 'জনপ্রিয়' : 'Popular'}
          </span>
        </div>
      )}
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">{plan.name[language]}</CardTitle>
        <CardDescription>{plan.description[language]}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="mb-6">
          <span className="text-4xl font-bold gradient-text">{formatCurrency(plan.price)}</span>
          <span className="text-muted-foreground">{plan.billingCycle[language]}</span>
        </div>

        <ul className="space-y-3 mb-8 text-left">
          {plan.features[language].map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={onOrder}
          className={`w-full ${plan.isPopular ? 'gradient-button' : ''}`}
          variant={plan.isPopular ? 'default' : 'outline'}
          size="lg"
        >
          {language === 'bn' ? 'অর্ডার করুন' : 'Order Now'}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
