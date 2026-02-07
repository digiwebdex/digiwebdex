import React from 'react';
import { Layout } from '@/components/layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { 
  LandingHero, 
  LandingFeatures, 
  LandingProcess,
  LandingTrust, 
  LandingFAQ, 
  LandingCTA,
  generateFAQSchema,
  type Feature,
  type ProcessStep,
  type TrustItem,
  type FAQItem
} from '@/components/landing/sections';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  ShoppingCart, 
  Newspaper, 
  Briefcase,
  FileText,
  Smartphone,
  Search,
  Palette,
  DollarSign,
  Users,
  Lightbulb,
  Code2,
  Rocket,
  CheckCircle,
  Award,
  Zap
} from 'lucide-react';
import alhadasImg from '@/assets/portfolio/alhadas-construction.jpg';
import primelawyersImg from '@/assets/portfolio/primelawyersbd.jpg';
import titasbuildImg from '@/assets/portfolio/titasbuild.jpg';
import gatebdImg from '@/assets/portfolio/gatebdgroup.jpg';

const WebDesignDhaka: React.FC = () => {
  // SEO Data
  const seoData = {
    title: 'ঢাকার সেরা ওয়েব ডিজাইন ও ডেভেলপমেন্ট কোম্পানি | DigiWebDex',
    description: 'ঢাকা, বাংলাদেশে প্রফেশনাল ও SEO-ফ্রেন্ডলি ওয়েবসাইট তৈরি করি। কর্পোরেট, ই-কমার্স, নিউজ পোর্টাল ও পোর্টফোলিও ওয়েবসাইট ডিজাইন। সাশ্রয়ী মূল্যে মডার্ন UI/UX।',
    keywords: ['web design dhaka', 'web development company bangladesh', 'ওয়েব ডিজাইন ঢাকা', 'website design bangladesh', 'ওয়েবসাইট তৈরি', 'best web designer dhaka']
  };

  // Services Offered
  const services: Feature[] = [
    {
      icon: Briefcase,
      title: 'কর্পোরেট ওয়েবসাইট',
      description: 'প্রফেশনাল কর্পোরেট ওয়েবসাইট যা আপনার ব্যবসার ব্র্যান্ড ভ্যালু বাড়াবে।'
    },
    {
      icon: ShoppingCart,
      title: 'ই-কমার্স ওয়েবসাইট',
      description: 'অনলাইনে পণ্য বিক্রির জন্য সম্পূর্ণ ফিচার সমৃদ্ধ অনলাইন স্টোর।'
    },
    {
      icon: Newspaper,
      title: 'নিউজ পোর্টাল',
      description: 'দ্রুত লোডিং ও SEO অপটিমাইজড সংবাদ পোর্টাল ও ম্যাগাজিন সাইট।'
    },
    {
      icon: FileText,
      title: 'পোর্টফোলিও ওয়েবসাইট',
      description: 'আপনার কাজ ও দক্ষতা প্রদর্শনের জন্য স্টাইলিশ পোর্টফোলিও সাইট।'
    },
    {
      icon: Rocket,
      title: 'ল্যান্ডিং পেজ',
      description: 'কনভার্সন ফোকাসড ল্যান্ডিং পেজ যা আপনার সেলস বাড়াবে।'
    },
    {
      icon: Globe,
      title: 'কাস্টম ওয়েব অ্যাপ',
      description: 'আপনার ব্যবসার নির্দিষ্ট চাহিদা অনুযায়ী কাস্টম ওয়েব অ্যাপ্লিকেশন।'
    }
  ];

  // Why Choose Us
  const whyChooseUs: Feature[] = [
    {
      icon: Palette,
      title: 'মডার্ন UI/UX',
      description: 'আধুনিক ও ইউজার-ফ্রেন্ডলি ইন্টারফেস ডিজাইন যা ভিজিটরদের আকৃষ্ট করে।'
    },
    {
      icon: Smartphone,
      title: 'মোবাইল রেস্পন্সিভ',
      description: 'সব ধরনের ডিভাইসে পারফেক্টলি কাজ করে এমন রেস্পন্সিভ ডিজাইন।'
    },
    {
      icon: Search,
      title: 'SEO অপটিমাইজড',
      description: 'গুগলে র‍্যাংক করার জন্য সম্পূর্ণ SEO ফ্রেন্ডলি স্ট্রাকচার।'
    },
    {
      icon: DollarSign,
      title: 'সাশ্রয়ী মূল্য',
      description: 'বাজেট ফ্রেন্ডলি প্যাকেজ যা সব ধরনের ব্যবসার জন্য উপযুক্ত।'
    }
  ];

  // Process Steps
  const processSteps: ProcessStep[] = [
    {
      step: 1,
      icon: Lightbulb,
      title: 'প্ল্যানিং',
      description: 'আপনার ব্যবসা ও লক্ষ্য বুঝে স্ট্র্যাটেজি তৈরি'
    },
    {
      step: 2,
      icon: Palette,
      title: 'ডিজাইন',
      description: 'আকর্ষণীয় ও ইউজার-ফ্রেন্ডলি UI/UX ডিজাইন'
    },
    {
      step: 3,
      icon: Code2,
      title: 'ডেভেলপমেন্ট',
      description: 'ক্লিন কোড ও বেস্ট প্র্যাকটিস অনুসারে ডেভেলপমেন্ট'
    },
    {
      step: 4,
      icon: Rocket,
      title: 'লঞ্চ',
      description: 'টেস্টিং শেষে সাইট লাইভ ও সাপোর্ট'
    }
  ];

  // Trust Items
  const trustItems: TrustItem[] = [
    { icon: Users, value: '500+', label: 'সন্তুষ্ট ক্লায়েন্ট' },
    { icon: Globe, value: '800+', label: 'ওয়েবসাইট ডেলিভার' },
    { icon: Award, value: '10+', label: 'বছরের অভিজ্ঞতা' },
    { icon: Zap, value: '100%', label: 'অন-টাইম ডেলিভারি' }
  ];

  // FAQ Items
  const faqs: FAQItem[] = [
    {
      question: 'একটি ওয়েবসাইট তৈরি করতে কত সময় লাগে?',
      answer: 'সাধারণত ৭-১৪ দিনের মধ্যে একটি স্ট্যান্ডার্ড ওয়েবসাইট ডেলিভার করা হয়। জটিল প্রজেক্টের ক্ষেত্রে ২-৪ সপ্তাহ সময় লাগতে পারে। প্রজেক্ট শুরুর আগে সঠিক টাইমলাইন জানানো হয়।'
    },
    {
      question: 'ওয়েবসাইট তৈরির খরচ কত?',
      answer: 'সিম্পল ওয়েবসাইট ১৫,০০০ টাকা থেকে শুরু। ই-কমার্স সাইট ৩০,০০০-৭৫,০০০ টাকা এবং কাস্টম ওয়েব অ্যাপ্লিকেশন ৫০,০০০+ টাকা হয়। আপনার রিকোয়ারমেন্ট অনুযায়ী সঠিক কোটেশন দেওয়া হয়।'
    },
    {
      question: 'ওয়েবসাইট তৈরির পর কি সাপোর্ট পাবো?',
      answer: 'হ্যাঁ! প্রতিটি প্রজেক্টে ৩ মাসের ফ্রি সাপোর্ট দেওয়া হয়। এরপর বার্ষিক মেইনটেনেন্স প্যাকেজ নিতে পারবেন সাশ্রয়ী মূল্যে।'
    },
    {
      question: 'কি কি পেমেন্ট মেথড আছে?',
      answer: 'বিকাশ, নগদ, রকেট এবং ব্যাংক ট্রান্সফার সব মেথডে পেমেন্ট করা যায়। বড় প্রজেক্টে মাইলস্টোন বেসড পেমেন্ট অপশন আছে।'
    },
    {
      question: 'আমি কি নিজে কন্টেন্ট আপডেট করতে পারব?',
      answer: 'অবশ্যই! আমরা ইউজার-ফ্রেন্ডলি CMS দিয়ে সাইট তৈরি করি যাতে আপনি সহজে টেক্সট, ছবি ও প্রোডাক্ট আপডেট করতে পারেন। প্রয়োজনে ফ্রি ট্রেনিংও দেওয়া হয়।'
    },
    {
      question: 'ডোমেইন ও হোস্টিং কি আপনারা দেন?',
      answer: 'হ্যাঁ, আমরা ডোমেইন রেজিস্ট্রেশন ও প্রিমিয়াম হোস্টিং সার্ভিস দিই। কম্বো প্যাকেজে নিলে বাড়তি ডিসকাউন্ট পাবেন।'
    }
  ];

  // Portfolio Items
  const portfolioItems = [
    { image: alhadasImg, title: 'Alhadas Construction', type: 'কর্পোরেট' },
    { image: primelawyersImg, title: 'Prime Lawyers BD', type: 'প্রফেশনাল' },
    { image: titasbuildImg, title: 'Titas Build', type: 'কনস্ট্রাকশন' },
    { image: gatebdImg, title: 'Gate BD Group', type: 'কর্পোরেট' }
  ];

  // Schema Markup
  const faqSchema = generateFAQSchema(faqs);
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "DigiWebDex - Web Design Company Dhaka",
    "image": "https://digiwebdex.com/logo.png",
    "url": "https://digiwebdex.com",
    "telephone": "+8801700000000",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Dhaka",
      "addressLocality": "Dhaka",
      "addressRegion": "Dhaka",
      "addressCountry": "BD"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 23.8103,
      "longitude": 90.4125
    },
    "areaServed": {
      "@type": "City",
      "name": "Dhaka"
    },
    "priceRange": "৳৳"
  };

  return (
    <Layout>
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonicalUrl="https://digiwebdex.com/bn/web-design-company-in-dhaka"
      />
      <SchemaMarkup schema={faqSchema} id="faq-schema" />
      <SchemaMarkup schema={localBusinessSchema} id="local-business-schema" />

      {/* Hero Section */}
      <LandingHero
        headline="ঢাকার সেরা ওয়েব ডিজাইন ও ডেভেলপমেন্ট কোম্পানি"
        subheadline="প্রফেশনাল ও SEO-ফ্রেন্ডলি ওয়েবসাইট তৈরি করি। আপনার ব্যবসাকে অনলাইনে নিয়ে আসুন আধুনিক ওয়েবসাইট দিয়ে।"
        ctaButtons={[
          { label: 'ফ্রি কনসাল্টেশন', href: '/bn/contact' },
          { label: 'পোর্টফোলিও দেখুন', href: '#portfolio', variant: 'secondary' }
        ]}
        backgroundVariant="mesh"
      />

      {/* Services Section */}
      <LandingFeatures
        title="আমাদের সার্ভিসসমূহ"
        subtitle="সব ধরনের ওয়েবসাইট ও ওয়েব অ্যাপ্লিকেশন তৈরি করি প্রফেশনাল কোয়ালিটিতে।"
        features={services}
        columns={3}
        variant="glass"
      />

      {/* Why Choose Us */}
      <LandingFeatures
        title="কেন DigiWebDex বেছে নেবেন?"
        subtitle="আমাদের কাজের মান ও সার্ভিস অন্যদের থেকে আলাদা।"
        features={whyChooseUs}
        columns={4}
        variant="cards"
      />

      {/* Process Timeline */}
      <LandingProcess
        title="আমাদের কাজের প্রক্রিয়া"
        subtitle="সিস্টেম্যাটিক অ্যাপ্রোচে আমরা আপনার প্রজেক্ট সম্পন্ন করি"
        steps={processSteps}
      />

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              আমাদের সাম্প্রতিক কাজ
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              আমাদের তৈরি কিছু সফল প্রজেক্ট দেখুন
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portfolioItems.map((item, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="text-primary text-sm font-medium">{item.type}</span>
                  <h3 className="text-white text-lg font-semibold">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link 
              to="/bn" 
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              সব পোর্টফোলিও দেখুন →
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <LandingTrust
        title="ক্লায়েন্টদের বিশ্বাস আমাদের শক্তি"
        items={trustItems}
        variant="badges"
      />

      {/* FAQ Section */}
      <LandingFAQ
        title="সচরাচর জিজ্ঞাসা"
        subtitle="ওয়েবসাইট তৈরি সম্পর্কে কমন প্রশ্নের উত্তর"
        faqs={faqs}
      />

      {/* Internal Links */}
      <section className="py-12 bg-muted/30">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-center mb-8">সম্পর্কিত সেবা</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link to="/bn/services/domain-hosting" className="p-6 bg-card/50 rounded-xl border border-border/50 hover:border-primary/30 transition-all text-center group">
              <Globe className="w-10 h-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">ডোমেইন ও হোস্টিং</h3>
              <p className="text-sm text-muted-foreground mt-2">সাশ্রয়ী মূল্যে প্রিমিয়াম হোস্টিং</p>
            </Link>
            <Link to="/bn/best-hosting-in-bangladesh" className="p-6 bg-card/50 rounded-xl border border-border/50 hover:border-primary/30 transition-all text-center group">
              <Zap className="w-10 h-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">সেরা হোস্টিং</h3>
              <p className="text-sm text-muted-foreground mt-2">LiteSpeed সার্ভার হোস্টিং</p>
            </Link>
            <Link to="/bn/pricing" className="p-6 bg-card/50 rounded-xl border border-border/50 hover:border-primary/30 transition-all text-center group">
              <DollarSign className="w-10 h-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">মূল্য তালিকা</h3>
              <p className="text-sm text-muted-foreground mt-2">সব সেবার দাম দেখুন</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <LandingCTA
        title="আপনার ড্রিম ওয়েবসাইট তৈরি করুন আজই"
        subtitle="ফ্রি কনসাল্টেশনে আপনার প্রজেক্ট নিয়ে আলোচনা করুন।"
        primaryCta={{ label: 'ফ্রি কনসাল্টেশন নিন', href: '/bn/contact' }}
        secondaryCta={{ label: 'অর্ডার করুন', href: '/bn/dashboard/orders' }}
        variant="gradient"
      />
    </Layout>
  );
};

export default WebDesignDhaka;
