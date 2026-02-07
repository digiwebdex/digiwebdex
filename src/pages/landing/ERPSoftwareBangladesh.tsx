import React from 'react';
import { Layout } from '@/components/layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { 
  LandingHero, 
  LandingModules,
  LandingFeatures, 
  LandingTrust, 
  LandingFAQ, 
  LandingCTA,
  generateFAQSchema,
  type Module,
  type Feature,
  type TrustItem,
  type FAQItem
} from '@/components/landing/sections';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart,
  Package,
  Calculator,
  Users,
  BarChart3,
  Cloud,
  UserCheck,
  Shield,
  Clock,
  Building2,
  Factory,
  Store,
  Stethoscope,
  GraduationCap,
  Award,
  Zap,
  CheckCircle
} from 'lucide-react';

const ERPSoftwareBangladesh: React.FC = () => {
  // SEO Data
  const seoData = {
    title: 'বাংলাদেশের আধুনিক ERP সফটওয়্যার সলিউশন | DigiWebDex',
    description: 'আপনার ব্যবসা অটোমেশন করুন স্মার্ট ERP দিয়ে। সেলস, ইনভেন্টরি, অ্যাকাউন্টস, HR ও রিপোর্টিং - সব এক জায়গায়। ক্লাউড বেসড বাংলাদেশী ERP সফটওয়্যার।',
    keywords: ['erp software bangladesh', 'erp bd', 'ইআরপি সফটওয়্যার', 'business automation bangladesh', 'inventory management software bd', 'accounting software bangladesh']
  };

  // ERP Modules
  const erpModules: Module[] = [
    {
      icon: ShoppingCart,
      title: 'সেলস ও বিলিং',
      description: 'সম্পূর্ণ সেলস ম্যানেজমেন্ট সিস্টেম দিয়ে বিক্রয় ট্র্যাক করুন।',
      features: ['POS Integration', 'Invoice Generation', 'Credit Management', 'Sales Analytics']
    },
    {
      icon: Package,
      title: 'ইনভেন্টরি',
      description: 'রিয়েল-টাইম স্টক ট্র্যাকিং ও ওয়্যারহাউস ম্যানেজমেন্ট।',
      features: ['Stock Tracking', 'Multi-warehouse', 'Barcode Support', 'Low Stock Alerts']
    },
    {
      icon: Calculator,
      title: 'অ্যাকাউন্টস',
      description: 'সম্পূর্ণ হিসাব-নিকাশ ও ফাইন্যান্সিয়াল রিপোর্টিং।',
      features: ['General Ledger', 'Bank Reconciliation', 'Tax Management', 'Financial Reports']
    },
    {
      icon: Users,
      title: 'HR ম্যানেজমেন্ট',
      description: 'কর্মী ব্যবস্থাপনা, অ্যাটেনডেন্স ও পেরোল সিস্টেম।',
      features: ['Employee Database', 'Attendance Tracking', 'Payroll Processing', 'Leave Management']
    },
    {
      icon: BarChart3,
      title: 'রিপোর্টিং ড্যাশবোর্ড',
      description: 'রিয়েল-টাইম বিজনেস ইনসাইট ও অ্যানালিটিক্স।',
      features: ['Custom Reports', 'Visual Charts', 'Export Options', 'Scheduled Reports']
    },
    {
      icon: Cloud,
      title: 'ক্লাউড অ্যাক্সেস',
      description: 'যেকোনো জায়গা থেকে যেকোনো ডিভাইসে অ্যাক্সেস।',
      features: ['Web Access', 'Mobile App', 'Offline Mode', 'Auto Sync']
    }
  ];

  // Benefits
  const benefits: Feature[] = [
    {
      icon: Cloud,
      title: 'ক্লাউড বেসড',
      description: 'কোনো ইনস্টলেশন দরকার নেই। ব্রাউজার থেকেই কাজ করুন যেকোনো জায়গা থেকে।'
    },
    {
      icon: UserCheck,
      title: 'মাল্টি-ইউজার অ্যাক্সেস',
      description: 'টিমের সবাই একসাথে কাজ করতে পারে রোল বেসড পারমিশন সিস্টেমে।'
    },
    {
      icon: Shield,
      title: 'সিকিউর ডাটাবেস',
      description: 'এন্টারপ্রাইজ গ্রেড সিকিউরিটি দিয়ে আপনার ডাটা সম্পূর্ণ সুরক্ষিত।'
    },
    {
      icon: Clock,
      title: 'রিয়েল-টাইম রিপোর্টিং',
      description: 'লাইভ ড্যাশবোর্ডে দেখুন ব্যবসার সব তথ্য এক নজরে।'
    }
  ];

  // Who Needs ERP
  const whoNeedsErp: Feature[] = [
    {
      icon: Store,
      title: 'রিটেইল ব্যবসা',
      description: 'দোকান, সুপারশপ, শোরুম ও চেইন স্টোরের জন্য আদর্শ ERP সলিউশন।'
    },
    {
      icon: Factory,
      title: 'ম্যানুফ্যাকচারিং',
      description: 'কারখানা ও প্রোডাকশন ইউনিটের সম্পূর্ণ অপারেশন ম্যানেজমেন্ট।'
    },
    {
      icon: Building2,
      title: 'ট্রেডিং কোম্পানি',
      description: 'আমদানি-রপ্তানি ও হোলসেল ব্যবসার জন্য কমপ্লিট সিস্টেম।'
    },
    {
      icon: Stethoscope,
      title: 'হেলথকেয়ার',
      description: 'হাসপাতাল, ক্লিনিক ও ফার্মেসির জন্য স্পেশালাইজড ERP।'
    },
    {
      icon: GraduationCap,
      title: 'শিক্ষা প্রতিষ্ঠান',
      description: 'স্কুল, কলেজ ও ট্রেনিং সেন্টারের ম্যানেজমেন্ট সিস্টেম।'
    },
    {
      icon: Building2,
      title: 'সার্ভিস ইন্ডাস্ট্রি',
      description: 'কনসাল্টেন্সি, এজেন্সি ও সার্ভিস প্রোভাইডারদের জন্য।'
    }
  ];

  // Trust Items
  const trustItems: TrustItem[] = [
    { icon: Users, value: '200+', label: 'অ্যাক্টিভ ক্লায়েন্ট' },
    { icon: Package, value: '1M+', label: 'ট্রানজ্যাকশন প্রসেস' },
    { icon: Award, value: '99.9%', label: 'আপটাইম গ্যারান্টি' },
    { icon: Zap, value: '24/7', label: 'সাপোর্ট সার্ভিস' }
  ];

  // FAQ Items
  const faqs: FAQItem[] = [
    {
      question: 'ERP সফটওয়্যার ইমপ্লিমেন্ট করতে কত সময় লাগে?',
      answer: 'সাধারণত ২-৪ সপ্তাহের মধ্যে বেসিক সেটআপ সম্পন্ন হয়। ডাটা মাইগ্রেশন ও কাস্টমাইজেশনের উপর নির্ভর করে সম্পূর্ণ ইমপ্লিমেন্টেশনে ১-২ মাস সময় লাগতে পারে।'
    },
    {
      question: 'ERP এর দাম কত?',
      answer: 'আমাদের ERP সফটওয়্যার মডিউল বেসড প্রাইসিং অনুসরণ করে। বেসিক প্যাকেজ ৩০,০০০ টাকা থেকে শুরু এবং এন্টারপ্রাইজ সলিউশন ১,০০,০০০+ টাকা হতে পারে। ফ্রি কনসাল্টেশনে সঠিক কোটেশন জানানো হয়।'
    },
    {
      question: 'ট্রেনিং কি দেওয়া হয়?',
      answer: 'হ্যাঁ, প্রতিটি ইমপ্লিমেন্টেশনে কমপ্রিহেন্সিভ ট্রেনিং দেওয়া হয়। অনসাইট বা অনলাইন উভয় অপশন আছে। ভিডিও টিউটোরিয়াল ও ডকুমেন্টেশনও প্রোভাইড করা হয়।'
    },
    {
      question: 'মোবাইল থেকে অ্যাক্সেস করা যাবে?',
      answer: 'অবশ্যই! আমাদের ERP সম্পূর্ণ মোবাইল রেস্পন্সিভ এবং ডেডিকেটেড মোবাইল অ্যাপও আছে। অফলাইন মোডেও কাজ করতে পারবেন।'
    },
    {
      question: 'ডাটা সিকিউরিটি কিভাবে নিশ্চিত করা হয়?',
      answer: 'এন্টারপ্রাইজ গ্রেড এনক্রিপশন, SSL সার্টিফিকেট, রোল বেসড অ্যাক্সেস কন্ট্রোল এবং ডেইলি অটোমেটেড ব্যাকআপ দিয়ে আপনার ডাটা সম্পূর্ণ সুরক্ষিত।'
    },
    {
      question: 'এক্সিস্টিং সিস্টেম থেকে ডাটা মাইগ্রেট করা যাবে?',
      answer: 'হ্যাঁ, আমরা এক্সেল, অন্যান্য সফটওয়্যার বা ম্যানুয়াল ডাটা থেকে সম্পূর্ণ ডাটা মাইগ্রেশন সার্ভিস দিই বিনামূল্যে।'
    }
  ];

  // Case Results
  const caseResults = [
    { metric: '40%', label: 'অপারেশনাল কস্ট কমেছে' },
    { metric: '60%', label: 'ম্যানুয়াল এরর কমেছে' },
    { metric: '3x', label: 'রিপোর্টিং স্পিড বেড়েছে' },
    { metric: '50%', label: 'সময় সাশ্রয় হয়েছে' }
  ];

  // Schema Markup
  const faqSchema = generateFAQSchema(faqs);
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DigiWebDex ERP Software",
    "operatingSystem": "Web, Android, iOS",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "30000",
      "priceCurrency": "BDT"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    },
    "provider": {
      "@type": "Organization",
      "name": "DigiWebDex",
      "url": "https://digiwebdex.com"
    }
  };

  return (
    <Layout>
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonicalUrl="https://digiwebdex.com/bn/erp-software-bangladesh"
      />
      <SchemaMarkup schema={faqSchema} id="faq-schema" />
      <SchemaMarkup schema={softwareSchema} id="software-schema" />

      {/* Hero Section */}
      <LandingHero
        headline="বাংলাদেশের আধুনিক ERP সফটওয়্যার সলিউশন"
        subheadline="আপনার ব্যবসা অটোমেশন করুন স্মার্ট ERP দিয়ে। সেলস, ইনভেন্টরি, অ্যাকাউন্টস সব এক জায়গায়।"
        ctaButtons={[
          { label: 'ডেমো নিন', href: '/bn/contact' },
          { label: 'আলোচনা করুন', href: '/bn/contact', variant: 'secondary' }
        ]}
        backgroundVariant="orbs"
      />

      {/* ERP Modules */}
      <LandingModules
        title="ERP মডিউলসমূহ"
        subtitle="আপনার ব্যবসার সব অপারেশন এক প্ল্যাটফর্মে ম্যানেজ করুন"
        modules={erpModules}
      />

      {/* Benefits */}
      <LandingFeatures
        title="ERP এর সুবিধাসমূহ"
        subtitle="কেন আপনার ব্যবসার জন্য ERP দরকার"
        features={benefits}
        columns={4}
        variant="cards"
      />

      {/* Case Results */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              আমাদের ক্লায়েন্টদের ফলাফল
            </h2>
            <p className="text-lg text-muted-foreground">
              ERP ইমপ্লিমেন্টেশনের পর ব্যবসায় যে পরিবর্তন এসেছে
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {caseResults.map((result, index) => (
              <div key={index} className="text-center p-6 bg-card/50 rounded-2xl border border-border/50">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {result.metric}
                </div>
                <div className="text-muted-foreground">
                  {result.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Needs ERP */}
      <LandingFeatures
        title="কাদের জন্য ERP?"
        subtitle="বিভিন্ন ইন্ডাস্ট্রির জন্য কাস্টমাইজড সলিউশন"
        features={whoNeedsErp}
        columns={3}
        variant="glass"
      />

      {/* Trust Section */}
      <LandingTrust
        title="আমাদের ট্র্যাক রেকর্ড"
        items={trustItems}
        variant="badges"
      />

      {/* FAQ Section */}
      <LandingFAQ
        title="সচরাচর জিজ্ঞাসা"
        subtitle="ERP সম্পর্কে আপনার প্রশ্নের উত্তর"
        faqs={faqs}
      />

      {/* Internal Links */}
      <section className="py-12 bg-muted/30">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-center mb-8">সম্পর্কিত সেবা</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link to="/bn/services/software-development" className="p-6 bg-card/50 rounded-xl border border-border/50 hover:border-primary/30 transition-all text-center group">
              <Package className="w-10 h-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">কাস্টম সফটওয়্যার</h3>
              <p className="text-sm text-muted-foreground mt-2">আপনার চাহিদা অনুযায়ী সফটওয়্যার</p>
            </Link>
            <Link to="/bn/web-design-company-in-dhaka" className="p-6 bg-card/50 rounded-xl border border-border/50 hover:border-primary/30 transition-all text-center group">
              <Building2 className="w-10 h-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">ওয়েব ডিজাইন</h3>
              <p className="text-sm text-muted-foreground mt-2">কর্পোরেট ওয়েবসাইট তৈরি</p>
            </Link>
            <Link to="/bn/contact" className="p-6 bg-card/50 rounded-xl border border-border/50 hover:border-primary/30 transition-all text-center group">
              <Zap className="w-10 h-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">ফ্রি কনসাল্টেশন</h3>
              <p className="text-sm text-muted-foreground mt-2">আপনার প্রজেক্ট নিয়ে কথা বলুন</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <LandingCTA
        title="আপনার ব্যবসাকে ডিজিটাল করুন"
        subtitle="ফ্রি ডেমো নিন এবং দেখুন কিভাবে ERP আপনার ব্যবসা বদলে দিতে পারে।"
        primaryCta={{ label: 'ফ্রি ডেমো নিন', href: '/bn/contact' }}
        secondaryCta={{ label: 'কথা বলুন', href: '/bn/contact' }}
        variant="gradient"
      />
    </Layout>
  );
};

export default ERPSoftwareBangladesh;
