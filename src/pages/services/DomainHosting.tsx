import React from 'react';
import { Layout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { SEOHead } from '@/components/seo/SEOHead';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { DomainSearchBox } from '@/components/home/DomainSearchBox';
import {
  ServiceHero,
  ServiceFAQ,
  ServiceCTA,
  FeatureGrid,
  PricingSection,
} from '@/components/services';
import {
  Server,
  Shield,
  Zap,
  Clock,
  HardDrive,
  Globe,
  Lock,
  Headphones,
  Database,
  RefreshCw,
  Mail,
  Settings,
} from 'lucide-react';

const DomainHostingPage = () => {
  const { language } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  // Service Schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": language === 'bn' ? "ডোমেইন এবং হোস্টিং সেবা" : "Domain & Hosting Services",
    "provider": {
      "@type": "Organization",
      "name": "Digiwebdex"
    },
    "serviceType": "Web Hosting",
    "areaServed": "Bangladesh",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Hosting Plans",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Starter Hosting"
          },
          "price": "3500",
          "priceCurrency": "BDT"
        }
      ]
    }
  };

  // Hosting Features
  const hostingFeatures = [
    {
      icon: HardDrive,
      title: language === 'bn' ? 'SSD স্টোরেজ' : 'SSD Storage',
      description: language === 'bn' 
        ? 'সুপার ফাস্ট SSD ড্রাইভে আপনার ওয়েবসাইট হোস্ট করুন' 
        : 'Host your website on super fast SSD drives',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Lock,
      title: language === 'bn' ? 'ফ্রি SSL' : 'Free SSL',
      description: language === 'bn' 
        ? 'সব প্ল্যানে বিনামূল্যে SSL সার্টিফিকেট' 
        : 'Free SSL certificate with all plans',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Settings,
      title: language === 'bn' ? 'cPanel কন্ট্রোল' : 'cPanel Control',
      description: language === 'bn' 
        ? 'সহজ cPanel দিয়ে হোস্টিং ম্যানেজ করুন' 
        : 'Manage hosting easily with cPanel',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: RefreshCw,
      title: language === 'bn' ? 'ডেইলি ব্যাকআপ' : 'Daily Backup',
      description: language === 'bn' 
        ? 'প্রতিদিন অটোমেটিক ব্যাকআপ নেওয়া হয়' 
        : 'Automatic daily backup of your data',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: Zap,
      title: language === 'bn' ? '99.9% আপটাইম' : '99.9% Uptime',
      description: language === 'bn' 
        ? 'গ্যারান্টিড আপটাইম সার্ভার পারফরম্যান্স' 
        : 'Guaranteed uptime server performance',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: Headphones,
      title: language === 'bn' ? '২৪/৭ সাপোর্ট' : '24/7 Support',
      description: language === 'bn' 
        ? 'যেকোনো সমস্যায় সার্বক্ষণিক সাপোর্ট' 
        : 'Round-the-clock support for any issues',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      icon: Mail,
      title: language === 'bn' ? 'ইমেইল হোস্টিং' : 'Email Hosting',
      description: language === 'bn' 
        ? 'প্রফেশনাল ইমেইল @yourdomain.com' 
        : 'Professional email @yourdomain.com',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      icon: Database,
      title: language === 'bn' ? 'MySQL ডাটাবেস' : 'MySQL Database',
      description: language === 'bn' 
        ? 'আনলিমিটেড MySQL ডাটাবেস সাপোর্ট' 
        : 'Unlimited MySQL database support',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
  ];

  // Hosting Plans
  const hostingPlans = [
    {
      name: language === 'bn' ? 'স্টার্টার' : 'Starter',
      price: '৳3,500',
      period: language === 'bn' ? '/বছর' : '/year',
      description: language === 'bn' ? 'ব্যক্তিগত ওয়েবসাইটের জন্য পারফেক্ট' : 'Perfect for personal websites',
      features: [
        language === 'bn' ? '5GB SSD স্টোরেজ' : '5GB SSD Storage',
        language === 'bn' ? '50GB ব্যান্ডউইথ' : '50GB Bandwidth',
        language === 'bn' ? '5টি ইমেইল অ্যাকাউন্ট' : '5 Email Accounts',
        language === 'bn' ? 'ফ্রি SSL' : 'Free SSL',
        language === 'bn' ? 'cPanel অ্যাক্সেস' : 'cPanel Access',
      ],
      href: `${basePath}/contact`,
      ctaText: language === 'bn' ? 'শুরু করুন' : 'Get Started',
    },
    {
      name: language === 'bn' ? 'বিজনেস' : 'Business',
      price: '৳5,900',
      period: language === 'bn' ? '/বছর' : '/year',
      description: language === 'bn' ? 'ছোট ব্যবসার জন্য আদর্শ' : 'Ideal for small businesses',
      features: [
        language === 'bn' ? '10GB SSD স্টোরেজ' : '10GB SSD Storage',
        language === 'bn' ? 'আনলিমিটেড ব্যান্ডউইথ' : 'Unlimited Bandwidth',
        language === 'bn' ? '10টি ইমেইল অ্যাকাউন্ট' : '10 Email Accounts',
        language === 'bn' ? 'ফ্রি SSL ও CDN' : 'Free SSL & CDN',
        language === 'bn' ? 'ডেইলি ব্যাকআপ' : 'Daily Backup',
        language === 'bn' ? 'প্রায়োরিটি সাপোর্ট' : 'Priority Support',
      ],
      popular: true,
      href: `${basePath}/contact`,
      ctaText: language === 'bn' ? 'শুরু করুন' : 'Get Started',
    },
    {
      name: language === 'bn' ? 'প্রিমিয়াম' : 'Premium',
      price: '৳14,500',
      period: language === 'bn' ? '/বছর' : '/year',
      description: language === 'bn' ? 'বড় ব্যবসা ও উচ্চ ট্রাফিকের জন্য' : 'For large businesses & high traffic',
      features: [
        language === 'bn' ? '20GB SSD স্টোরেজ' : '20GB SSD Storage',
        language === 'bn' ? 'আনলিমিটেড ব্যান্ডউইথ' : 'Unlimited Bandwidth',
        language === 'bn' ? 'আনলিমিটেড ইমেইল' : 'Unlimited Emails',
        language === 'bn' ? 'ফ্রি ডোমেইন' : 'Free Domain',
        language === 'bn' ? 'ডেডিকেটেড IP' : 'Dedicated IP',
        language === 'bn' ? 'প্রিমিয়াম সাপোর্ট' : 'Premium Support',
        language === 'bn' ? 'ম্যালওয়্যার স্ক্যান' : 'Malware Scan',
      ],
      href: `${basePath}/contact`,
      ctaText: language === 'bn' ? 'শুরু করুন' : 'Get Started',
    },
  ];

  // Why Choose Us
  const whyChooseUs = [
    {
      icon: Server,
      title: language === 'bn' ? 'দ্রুত সার্ভার' : 'Fast Servers',
      description: language === 'bn' 
        ? 'লেটেস্ট হার্ডওয়্যার ও SSD দিয়ে সুপারফাস্ট স্পিড' 
        : 'Superfast speed with latest hardware & SSD',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Shield,
      title: language === 'bn' ? 'সিকিউরড হোস্টিং' : 'Secured Hosting',
      description: language === 'bn' 
        ? 'ফায়ারওয়াল ও DDoS প্রোটেকশন সহ' 
        : 'With Firewall & DDoS Protection',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Clock,
      title: language === 'bn' ? '99.9% আপটাইম' : '99.9% Uptime',
      description: language === 'bn' 
        ? 'আপনার ওয়েবসাইট সবসময় অনলাইন থাকবে' 
        : 'Your website will always stay online',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Globe,
      title: language === 'bn' ? 'গ্লোবাল CDN' : 'Global CDN',
      description: language === 'bn' 
        ? 'বিশ্বব্যাপী দ্রুত কনটেন্ট ডেলিভারি' 
        : 'Fast content delivery worldwide',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  // FAQ
  const faqs = [
    {
      question: language === 'bn' ? 'হোস্টিং কিনতে কী কী লাগবে?' : 'What do I need to buy hosting?',
      answer: language === 'bn' 
        ? 'শুধু আপনার ডোমেইন নেম দরকার। ডোমেইন না থাকলে আমাদের কাছ থেকে রেজিস্টার করতে পারবেন।' 
        : 'You just need a domain name. If you don\'t have one, you can register from us.',
    },
    {
      question: language === 'bn' ? 'SSL সার্টিফিকেট কি ফ্রি?' : 'Is SSL certificate free?',
      answer: language === 'bn' 
        ? 'হ্যাঁ, সব হোস্টিং প্ল্যানে Let\'s Encrypt SSL সার্টিফিকেট বিনামূল্যে দেওয়া হয়।' 
        : 'Yes, Let\'s Encrypt SSL certificate is provided free with all hosting plans.',
    },
    {
      question: language === 'bn' ? 'ব্যাকআপ কিভাবে কাজ করে?' : 'How does backup work?',
      answer: language === 'bn' 
        ? 'আমরা প্রতিদিন অটোমেটিক ব্যাকআপ নেই এবং ৭ দিন পর্যন্ত সংরক্ষণ করি। যেকোনো সময় রিস্টোর করতে পারবেন।' 
        : 'We take automatic daily backups and store for up to 7 days. You can restore anytime.',
    },
    {
      question: language === 'bn' ? 'অন্য হোস্টিং থেকে মাইগ্রেশন করবেন?' : 'Do you migrate from other hosting?',
      answer: language === 'bn' 
        ? 'হ্যাঁ, আমরা বিনামূল্যে আপনার সাইট অন্য হোস্টিং থেকে মাইগ্রেট করে দেই।' 
        : 'Yes, we migrate your site from other hosting for free.',
    },
    {
      question: language === 'bn' ? 'রিফান্ড পলিসি কী?' : 'What is the refund policy?',
      answer: language === 'bn' 
        ? '৩০ দিনের মানি-ব্যাক গ্যারান্টি। সন্তুষ্ট না হলে পুরো টাকা ফেরত।' 
        : '30-day money-back guarantee. Full refund if not satisfied.',
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={language === 'bn' 
          ? 'ডোমেইন ও হোস্টিং সেবা | Digiwebdex - বাংলাদেশের সেরা হোস্টিং' 
          : 'Domain & Hosting Services | Digiwebdex - Best Hosting in Bangladesh'}
        description={language === 'bn'
          ? 'নিরাপদ ও দ্রুত ডোমেইন এবং হোস্টিং সলিউশন। 99.9% আপটাইম, ফ্রি SSL, cPanel, ডেইলি ব্যাকআপ সহ সাশ্রয়ী মূল্যে প্রিমিয়াম হোস্টিং।'
          : 'Secure & fast domain and hosting solutions. 99.9% uptime, free SSL, cPanel, daily backup with premium hosting at affordable prices.'}
        keywords={['domain', 'hosting', 'web hosting', 'Bangladesh hosting', 'SSD hosting', 'cPanel', 'SSL', 'ডোমেইন', 'হোস্টিং']}
      />
      <SchemaMarkup schema={serviceSchema} id="service-schema" />

      {/* Hero Section */}
      <ServiceHero
        badge={language === 'bn' ? '🌐 ডোমেইন ও হোস্টিং' : '🌐 Domain & Hosting'}
        headline={language === 'bn' 
          ? 'নিরাপদ ও দ্রুত ডোমেইন এবং হোস্টিং সলিউশন' 
          : 'Secure & Fast Domain and Hosting Solution'}
        subtext={language === 'bn' 
          ? 'নির্ভরযোগ্য সার্ভার, 99.9% আপটাইম, ফুল টেকনিক্যাল সাপোর্ট। আপনার অনলাইন প্রেজেন্স শুরু করুন আজই।' 
          : 'Reliable servers, 99.9% uptime, full technical support. Start your online presence today.'}
        primaryCta={{
          text: language === 'bn' ? 'হোস্টিং প্ল্যান দেখুন' : 'View Hosting Plans',
          href: '#pricing',
        }}
        secondaryCta={{
          text: language === 'bn' ? 'ফ্রি পরামর্শ' : 'Free Consultation',
          href: `${basePath}/contact`,
        }}
        stats={[
          { value: '99.9%', label: language === 'bn' ? 'আপটাইম গ্যারান্টি' : 'Uptime Guarantee' },
          { value: '500+', label: language === 'bn' ? 'সন্তুষ্ট ক্লায়েন্ট' : 'Happy Clients' },
          { value: '24/7', label: language === 'bn' ? 'সাপোর্ট' : 'Support' },
        ]}
      >
        {/* Domain Search Box */}
        <div className="w-full max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground mb-4 font-medium">
            {language === 'bn' ? '🔍 আপনার পছন্দের ডোমেইন খুঁজুন' : '🔍 Search for your perfect domain'}
          </p>
          <DomainSearchBox />
        </div>
      </ServiceHero>

      {/* Hosting Features */}
      <FeatureGrid
        badge={language === 'bn' ? '⚡ হোস্টিং ফিচার্স' : '⚡ Hosting Features'}
        title={language === 'bn' ? 'প্রিমিয়াম হোস্টিং ফিচার্স' : 'Premium Hosting Features'}
        subtitle={language === 'bn' 
          ? 'আমাদের সব হোস্টিং প্ল্যানে যা যা পাবেন' 
          : 'What you get with all our hosting plans'}
        features={hostingFeatures}
        columns={4}
      />

      {/* Hosting Plans */}
      <PricingSection
        badge={language === 'bn' ? '💰 প্যাকেজ সমূহ' : '💰 Packages'}
        title={language === 'bn' ? 'হোস্টিং প্ল্যান বেছে নিন' : 'Choose Your Hosting Plan'}
        subtitle={language === 'bn' 
          ? 'আপনার প্রয়োজন অনুযায়ী সেরা প্ল্যান নির্বাচন করুন' 
          : 'Select the best plan according to your needs'}
        plans={hostingPlans}
      />

      {/* Why Choose Us */}
      <FeatureGrid
        badge={language === 'bn' ? '🏆 কেন আমরা?' : '🏆 Why Us?'}
        title={language === 'bn' ? 'কেন Digiwebdex হোস্টিং বেছে নেবেন?' : 'Why Choose Digiwebdex Hosting?'}
        subtitle={language === 'bn' 
          ? 'আমরা শুধু হোস্টিং দেই না, আপনার সাফল্যের অংশীদার হই' 
          : 'We don\'t just provide hosting, we become your success partner'}
        features={whyChooseUs}
        columns={4}
      />

      {/* FAQ */}
      <ServiceFAQ
        title={language === 'bn' ? 'হোস্টিং সম্পর্কে জিজ্ঞাসা' : 'Hosting FAQ'}
        faqs={faqs}
        schemaId="hosting-faq-schema"
      />

      {/* Final CTA */}
      <ServiceCTA
        title={language === 'bn' 
          ? 'আজই আপনার ওয়েবসাইট হোস্ট করুন!' 
          : 'Host Your Website Today!'}
        subtitle={language === 'bn' 
          ? 'ফ্রি মাইগ্রেশন, ফ্রি SSL, ৩০ দিনের মানি-ব্যাক গ্যারান্টি।' 
          : 'Free migration, free SSL, 30-day money-back guarantee.'}
        primaryCta={{
          text: language === 'bn' ? 'এখনই শুরু করুন' : 'Get Started Now',
          href: `${basePath}/contact`,
        }}
        secondaryCta={{
          text: language === 'bn' ? 'কল করুন' : 'Call Us',
          href: 'tel:+8801XXXXXXXXX',
          isPhone: true,
        }}
      />
    </Layout>
  );
};

export default DomainHostingPage;
