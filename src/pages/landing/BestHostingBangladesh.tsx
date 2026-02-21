import React from 'react';
import { Layout } from '@/components/layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { 
  LandingHero, 
  LandingFeatures, 
  LandingPricing, 
  LandingTrust, 
  LandingFAQ, 
  LandingCTA,
  generateFAQSchema,
  type Feature,
  type PricingPlan,
  type TrustItem,
  type FAQItem
} from '@/components/landing/sections';
import { Link } from 'react-router-dom';
import { 
  Server, 
  Shield, 
  Zap, 
  HardDrive, 
  Lock, 
  Clock, 
  Headphones, 
  Globe,
  Award,
  RefreshCw
} from 'lucide-react';

const BestHostingBangladesh: React.FC = () => {
  // SEO Data
  const seoData = {
    title: 'বাংলাদেশের সেরা ওয়েব হোস্টিং সেবা | DigiWebDex',
    description: 'দ্রুত, নিরাপদ এবং 99.9% আপটাইম নিশ্চিত ওয়েব হোস্টিং সার্ভিস। LiteSpeed সার্ভার, SSD NVMe স্টোরেজ, ফ্রি SSL এবং ২৪/৭ বাংলা সাপোর্ট সহ সেরা হোস্টিং প্যাকেজ।',
    keywords: ['best hosting bangladesh', 'web hosting bd', 'সেরা হোস্টিং', 'বাংলাদেশ হোস্টিং', 'cheap hosting bangladesh', 'litespeed hosting bd']
  };

  // Features Data
  const features: Feature[] = [
    {
      icon: Zap,
      title: 'LiteSpeed সার্ভার',
      description: 'Apache এর চেয়ে ১০ গুণ দ্রুত LiteSpeed ওয়েব সার্ভার ব্যবহার করে আমাদের হোস্টিং সার্ভিস।'
    },
    {
      icon: HardDrive,
      title: 'SSD NVMe স্টোরেজ',
      description: 'সাধারণ HDD এর চেয়ে ৪০ গুণ দ্রুত NVMe SSD স্টোরেজ দিয়ে আপনার ওয়েবসাইট লোড হবে মুহূর্তে।'
    },
    {
      icon: Lock,
      title: 'ফ্রি SSL সার্টিফিকেট',
      description: 'প্রতিটি ডোমেইনে বিনামূল্যে SSL সার্টিফিকেট দিয়ে আপনার ওয়েবসাইট সম্পূর্ণ নিরাপদ।'
    },
    {
      icon: RefreshCw,
      title: 'ডেইলি ব্যাকআপ',
      description: 'প্রতিদিন স্বয়ংক্রিয় ব্যাকআপ হয় যেন আপনার ডাটা সবসময় সুরক্ষিত থাকে।'
    },
    {
      icon: Headphones,
      title: 'বাংলা সাপোর্ট',
      description: '২৪/৭ বাংলায় টেকনিক্যাল সাপোর্ট পাবেন। যেকোনো সমস্যায় আমরা আছি আপনার পাশে।'
    },
    {
      icon: Shield,
      title: 'DDoS Protection',
      description: 'এন্টারপ্রাইজ লেভেল DDoS প্রোটেকশন দিয়ে আপনার ওয়েবসাইট সাইবার আক্রমণ থেকে সুরক্ষিত।'
    }
  ];

  // Pricing Plans
  const plans: PricingPlan[] = [
    {
      name: 'Starter',
      price: '৳৩,৫০০',
      period: 'বছর',
      description: 'ছোট ওয়েবসাইট বা ব্লগের জন্য উপযুক্ত',
      features: [
        '5 GB SSD NVMe Storage',
        '50 GB Bandwidth',
        '1 ওয়েবসাইট হোস্ট',
        '5 Email Accounts',
        'Free SSL Certificate',
        'Daily Backup'
      ],
      ctaLabel: 'অর্ডার করুন',
      ctaHref: '/bn/dashboard/orders'
    },
    {
      name: 'Business',
      price: '৳৫,৯০০',
      period: 'বছর',
      description: 'ব্যবসায়িক ওয়েবসাইটের জন্য আদর্শ',
      features: [
        '10 GB SSD NVMe Storage',
        'Unlimited Bandwidth',
        '5 ওয়েবসাইট হোস্ট',
        'Unlimited Email',
        'Free SSL Certificate',
        'Daily Backup',
        'LiteSpeed Cache'
      ],
      ctaLabel: 'অর্ডার করুন',
      ctaHref: '/bn/dashboard/orders',
      isPopular: true
    },
    {
      name: 'Premium',
      price: '৳৯৯৯',
      period: 'মাস',
      description: 'বড় ই-কমার্স বা কর্পোরেট সাইটের জন্য',
      features: [
        '20 GB SSD NVMe Storage',
        'Unlimited Bandwidth',
        'Unlimited ওয়েবসাইট',
        'Unlimited Email',
        'Free SSL Certificate',
        'Daily Backup',
        'LiteSpeed Cache',
        'Priority Support'
      ],
      ctaLabel: 'অর্ডার করুন',
      ctaHref: '/bn/dashboard/orders'
    }
  ];

  // Trust Items
  const trustItems: TrustItem[] = [
    { icon: Award, value: '99.9%', label: 'আপটাইম গ্যারান্টি' },
    { icon: Shield, value: '100%', label: 'নিরাপদ ইনফ্রাস্ট্রাকচার' },
    { icon: Zap, value: '< 1s', label: 'ফাস্ট অ্যাক্টিভেশন' },
    { icon: Headphones, value: '24/7', label: 'বাংলা সাপোর্ট' }
  ];

  // FAQ Items
  const faqs: FAQItem[] = [
    {
      question: 'হোস্টিং অ্যাক্টিভ হতে কতক্ষণ লাগে?',
      answer: 'পেমেন্ট ভেরিফিকেশনের পর ১ ঘণ্টার মধ্যে আপনার হোস্টিং অ্যাকাউন্ট অ্যাক্টিভ হয়ে যায়। বেশিরভাগ ক্ষেত্রে ১৫-৩০ মিনিটের মধ্যেই অ্যাক্টিভেশন সম্পন্ন হয়।'
    },
    {
      question: 'কোন পেমেন্ট মেথড গ্রহণ করা হয়?',
      answer: 'আমরা বিকাশ, নগদ, রকেট এবং ব্যাংক ট্রান্সফার সহ সব জনপ্রিয় পেমেন্ট মেথড গ্রহণ করি। অনলাইন পেমেন্টও করতে পারবেন।'
    },
    {
      question: 'হোস্টিং এ কত জিবি স্টোরেজ পাবো?',
      answer: 'আমাদের প্যাকেজ অনুযায়ী ৫ জিবি থেকে ৫০ জিবি পর্যন্ত SSD NVMe স্টোরেজ পাবেন। বড় প্রজেক্টের জন্য কাস্টম প্যাকেজও পাওয়া যায়।'
    },
    {
      question: 'ব্যাকআপ কিভাবে করা হয়?',
      answer: 'আমরা প্রতিদিন স্বয়ংক্রিয়ভাবে আপনার ওয়েবসাইটের সম্পূর্ণ ব্যাকআপ রাখি। শেষ ৭ দিনের ব্যাকআপ সংরক্ষিত থাকে যেকোনো সময় রিস্টোর করার জন্য।'
    },
    {
      question: 'অন্য হোস্টিং থেকে মাইগ্রেশন করতে পারব?',
      answer: 'হ্যাঁ, বিনামূল্যে! আমাদের টেকনিক্যাল টিম আপনার বর্তমান হোস্টিং থেকে সম্পূর্ণ ওয়েবসাইট মাইগ্রেট করে দেবে কোনো ডাউনটাইম ছাড়াই।'
    },
    {
      question: 'রিফান্ড পলিসি কি?',
      answer: 'আমরা ৩০ দিনের মানি-ব্যাক গ্যারান্টি দিই। যদি আমাদের সার্ভিসে সন্তুষ্ট না হন, পুরো টাকা ফেরত পাবেন।'
    }
  ];

  // Schema Markup
  const faqSchema = generateFAQSchema(faqs);
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Web Hosting Service Bangladesh",
    "provider": {
      "@type": "Organization",
      "name": "DigiWebDex",
      "url": "https://digiwebdex.com"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Bangladesh"
    },
    "description": seoData.description,
    "serviceType": "Web Hosting"
  };

  return (
    <Layout>
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonicalUrl="https://digiwebdex.com/bn/best-hosting-in-bangladesh"
      />
      <SchemaMarkup schema={faqSchema} id="faq-schema" />
      <SchemaMarkup schema={serviceSchema} id="service-schema" />

      {/* Hero Section */}
      <LandingHero
        headline="বাংলাদেশের সেরা ওয়েব হোস্টিং সেবা"
        subheadline="দ্রুত, নিরাপদ এবং 99.9% আপটাইম নিশ্চিত সার্ভার সলিউশন। LiteSpeed সার্ভার ও SSD NVMe স্টোরেজ সহ প্রিমিয়াম হোস্টিং।"
        ctaButtons={[
          { label: 'হোস্টিং প্ল্যান দেখুন', href: '#pricing' },
          { label: 'এখনই অর্ডার করুন', href: '/bn/dashboard/orders', variant: 'secondary' }
        ]}
        backgroundVariant="orbs"
      />

      {/* Why Best Section */}
      <LandingFeatures
        title="কেন আমাদের হোস্টিং সেরা?"
        subtitle="প্রিমিয়াম ফিচার ও টপ-ক্লাস ইনফ্রাস্ট্রাকচার দিয়ে আমরা বাংলাদেশে সেরা হোস্টিং অভিজ্ঞতা দিচ্ছি।"
        features={features}
        columns={3}
        variant="glass"
      />

      {/* Trust Section */}
      <LandingTrust
        title="আমাদের উপর বিশ্বাস রাখুন"
        items={trustItems}
        variant="badges"
      />

      {/* Pricing Section */}
      <div id="pricing">
        <LandingPricing
          title="হোস্টিং প্যাকেজ তুলনা"
          subtitle="আপনার প্রয়োজন অনুযায়ী সঠিক প্ল্যান বেছে নিন"
          plans={plans}
        />
      </div>

      {/* FAQ Section */}
      <LandingFAQ
        title="সচরাচর জিজ্ঞাসা"
        subtitle="হোস্টিং সম্পর্কে আপনার প্রশ্নের উত্তর"
        faqs={faqs}
      />

      {/* Internal Links */}
      <section className="py-12 bg-muted/30">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-center mb-8">সম্পর্কিত সেবা</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link to="/bn/services/domain-hosting" className="p-6 bg-card/50 rounded-xl border border-border/50 hover:border-primary/30 transition-all text-center group">
              <Globe className="w-10 h-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">ডোমেইন রেজিস্ট্রেশন</h3>
              <p className="text-sm text-muted-foreground mt-2">সাশ্রয়ী মূল্যে .com, .bd ডোমেইন</p>
            </Link>
            <Link to="/bn/services/web-development" className="p-6 bg-card/50 rounded-xl border border-border/50 hover:border-primary/30 transition-all text-center group">
              <Server className="w-10 h-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">ওয়েব ডেভেলপমেন্ট</h3>
              <p className="text-sm text-muted-foreground mt-2">প্রফেশনাল ওয়েবসাইট তৈরি</p>
            </Link>
            <Link to="/bn/pricing" className="p-6 bg-card/50 rounded-xl border border-border/50 hover:border-primary/30 transition-all text-center group">
              <Zap className="w-10 h-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">সকল প্যাকেজ</h3>
              <p className="text-sm text-muted-foreground mt-2">সব সেবার দাম দেখুন</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <LandingCTA
        title="এখনই আপনার ওয়েবসাইট শুরু করুন"
        subtitle="৩০ দিনের মানি-ব্যাক গ্যারান্টি সহ রিস্ক-ফ্রি ট্রায়াল নিন।"
        primaryCta={{ label: 'হোস্টিং অর্ডার করুন', href: '/bn/dashboard/orders' }}
        secondaryCta={{ label: 'কথা বলুন', href: '/bn/contact' }}
        variant="gradient"
      />
    </Layout>
  );
};

export default BestHostingBangladesh;
