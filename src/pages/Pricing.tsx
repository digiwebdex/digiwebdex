import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EasyOrderModal, PackageOption } from '@/components/order/EasyOrderModal';

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
  {
    id: 'hosting-basic',
    name: { en: 'Starter Hosting', bn: 'স্টার্টার হোস্টিং' },
    description: { en: 'Perfect for personal websites', bn: 'ব্যক্তিগত ওয়েবসাইটের জন্য উপযুক্ত' },
    price: 4800,
    billingCycle: { en: '/year', bn: '/বছর' },
    serviceType: 'hosting',
    features: {
      en: ['1 GB SSD Storage', '10 GB Bandwidth', '1 Email Account', 'Free SSL Certificate', 'cPanel Access'],
      bn: ['১ জিবি SSD স্টোরেজ', '১০ জিবি ব্যান্ডউইথ', '১টি ইমেইল অ্যাকাউন্ট', 'ফ্রি SSL সার্টিফিকেট', 'cPanel অ্যাক্সেস'],
    },
  },
  {
    id: 'hosting-business',
    name: { en: 'Business Hosting', bn: 'বিজনেস হোস্টিং' },
    description: { en: 'For growing businesses', bn: 'বর্ধনশীল ব্যবসার জন্য' },
    price: 9900,
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
      en: ['Unlimited SSD Storage', 'Unlimited Bandwidth', 'Unlimited Email', 'Free Domain', 'Dedicated IP', 'Premium Support', 'Malware Scan'],
      bn: ['আনলিমিটেড SSD স্টোরেজ', 'আনলিমিটেড ব্যান্ডউইথ', 'আনলিমিটেড ইমেইল', 'ফ্রি ডোমেইন', 'ডেডিকেটেড IP', 'প্রিমিয়াম সাপোর্ট', 'ম্যালওয়্যার স্ক্যান'],
    },
  },
  {
    id: 'web-starter',
    name: { en: 'Starter Website', bn: 'স্টার্টার ওয়েবসাইট' },
    description: { en: 'Simple business website', bn: 'সাধারণ বিজনেস ওয়েবসাইট' },
    price: 15000,
    billingCycle: { en: '', bn: '' },
    serviceType: 'web_development',
    features: {
      en: ['5 Pages', 'Responsive Design', 'Contact Form', 'SEO Optimized', '1 Month Support'],
      bn: ['৫টি পেজ', 'রেসপন্সিভ ডিজাইন', 'কন্টাক্ট ফর্ম', 'SEO অপ্টিমাইজড', '১ মাস সাপোর্ট'],
    },
  },
  {
    id: 'web-business',
    name: { en: 'Business Website', bn: 'বিজনেস ওয়েবসাইট' },
    description: { en: 'Professional business presence', bn: 'প্রফেশনাল বিজনেস উপস্থিতি' },
    price: 30000,
    billingCycle: { en: '', bn: '' },
    serviceType: 'web_development',
    isPopular: true,
    features: {
      en: ['15 Pages', 'Custom Design', 'Blog Section', 'Admin Panel', 'SEO Optimized', '3 Months Support'],
      bn: ['১৫টি পেজ', 'কাস্টম ডিজাইন', 'ব্লগ সেকশন', 'অ্যাডমিন প্যানেল', 'SEO অপ্টিমাইজড', '৩ মাস সাপোর্ট'],
    },
  },
  {
    id: 'web-ecommerce',
    name: { en: 'E-commerce Website', bn: 'ই-কমার্স ওয়েবসাইট' },
    description: { en: 'Full online store', bn: 'সম্পূর্ণ অনলাইন স্টোর' },
    price: 50000,
    billingCycle: { en: '', bn: '' },
    serviceType: 'web_development',
    features: {
      en: ['Unlimited Products', 'Payment Gateway', 'Order Management', 'Inventory System', 'Admin Dashboard', '6 Months Support'],
      bn: ['আনলিমিটেড প্রোডাক্ট', 'পেমেন্ট গেটওয়ে', 'অর্ডার ম্যানেজমেন্ট', 'ইনভেন্টরি সিস্টেম', 'অ্যাডমিন ড্যাশবোর্ড', '৬ মাস সাপোর্ট'],
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
      en: ['Basic Features', 'Single User', 'Cloud Hosting', 'Mobile Responsive', '3 Months Support'],
      bn: ['বেসিক ফিচার', 'সিঙ্গেল ইউজার', 'ক্লাউড হোস্টিং', 'মোবাইল রেসপন্সিভ', '৩ মাস সাপোর্ট'],
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
      en: ['Advanced Features', 'Multi-User', 'Role Management', 'Reports & Analytics', 'API Integration', '6 Months Support'],
      bn: ['অ্যাডভান্সড ফিচার', 'মাল্টি-ইউজার', 'রোল ম্যানেজমেন্ট', 'রিপোর্ট ও অ্যানালিটিক্স', 'API ইন্টিগ্রেশন', '৬ মাস সাপোর্ট'],
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
      en: ['Full ERP/POS', 'Unlimited Users', 'Multi-Branch', 'Mobile App', 'Custom Modules', 'Dedicated Support', '1 Year AMC'],
      bn: ['সম্পূর্ণ ERP/POS', 'আনলিমিটেড ইউজার', 'মাল্টি-ব্র্যাঞ্চ', 'মোবাইল অ্যাপ', 'কাস্টম মডিউল', 'ডেডিকেটেড সাপোর্ট', '১ বছর AMC'],
    },
  },
];

export default function Pricing() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const basePath = language === 'en' ? '/en' : '/bn';
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PackageOption | undefined>(undefined);

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

  return (
    <Layout>
      <div className="py-16 md:py-24">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'bn' ? 'মূল্য তালিকা' : 'Pricing Plans'}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {language === 'bn'
                ? 'আপনার প্রয়োজন অনুযায়ী সেরা প্যাকেজ বেছে নিন'
                : 'Choose the perfect package for your needs'}
            </p>
          </div>

          {/* Hosting Plans */}
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              {language === 'bn' ? 'ওয়েব হোস্টিং' : 'Web Hosting'}
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {hostingPlans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  language={language}
                  formatCurrency={formatCurrency}
                  basePath={basePath}
                  isLoggedIn={!!user}
                  onOrder={() => handleOrderClick(plan)}
                />
              ))}
            </div>
          </div>

          {/* Web Development Plans */}
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              {language === 'bn' ? 'ওয়েব ডেভেলপমেন্ট' : 'Web Development'}
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {webPlans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  language={language}
                  formatCurrency={formatCurrency}
                  basePath={basePath}
                  isLoggedIn={!!user}
                  onOrder={() => handleOrderClick(plan)}
                />
              ))}
            </div>
          </div>

          {/* Software Development Plans */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              {language === 'bn' ? 'সফটওয়্যার ডেভেলপমেন্ট' : 'Software Development'}
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {softwarePlans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  language={language}
                  formatCurrency={formatCurrency}
                  basePath={basePath}
                  isLoggedIn={!!user}
                  onOrder={() => handleOrderClick(plan)}
                />
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 text-center">
            <Card className="glass-card max-w-2xl mx-auto">
              <CardContent className="py-8">
                <h3 className="text-2xl font-bold mb-4">
                  {language === 'bn'
                    ? 'কাস্টম প্রজেক্ট প্রয়োজন?'
                    : 'Need a Custom Project?'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {language === 'bn'
                    ? 'আপনার প্রয়োজন অনুযায়ী কাস্টম সলিউশনের জন্য আমাদের সাথে যোগাযোগ করুন'
                    : 'Contact us for a custom solution tailored to your specific needs'}
                </p>
                <Button asChild size="lg" className="gradient-button">
                  <Link to={`${basePath}/contact`}>
                    {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
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
  basePath,
  isLoggedIn,
  onOrder,
}: {
  plan: PricingPlan;
  language: 'en' | 'bn';
  formatCurrency: (amount: number) => string;
  basePath: string;
  isLoggedIn: boolean;
  onOrder: () => void;
}) {
  return (
    <Card className={`glass-card relative ${plan.isPopular ? 'border-primary shadow-lg scale-105' : ''}`}>
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="gradient-button text-sm px-4 py-1 rounded-full">
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
          <span className="text-4xl font-bold">{formatCurrency(plan.price)}</span>
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
        >
          {language === 'bn' ? 'অর্ডার করুন' : 'Order Now'}
        </Button>
      </CardContent>
    </Card>
  );
}
