import React from 'react';
import { Layout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { SEOHead } from '@/components/seo/SEOHead';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import {
  ServiceHero,
  ServiceFAQ,
  ServiceCTA,
  FeatureGrid,
  ProcessTimeline,
  PortfolioShowcase,
} from '@/components/services';
import { Card, CardContent } from '@/components/ui/card';
import {
  Database,
  ShoppingCart,
  Package,
  Settings,
  Cloud,
  Shield,
  Users,
  BarChart3,
  MessageSquare,
  FileSearch,
  Code,
  Rocket,
  Smartphone,
  Cog,
  Building2,
  Truck,
} from 'lucide-react';

const SoftwareDevelopmentPage = () => {
  const { language } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  // Service Schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": language === 'bn' ? "সফটওয়্যার ডেভেলপমেন্ট সেবা - বাংলাদেশ" : "Software Development Services - Bangladesh",
    "description": language === 'bn'
      ? "কাস্টম সফটওয়্যার, ERP, POS, ইনভেন্টরি ম্যানেজমেন্ট সফটওয়্যার ডেভেলপমেন্ট সেবা বাংলাদেশে।"
      : "Custom software, ERP, POS, inventory management software development services in Bangladesh.",
    "provider": {
      "@type": "Organization",
      "name": "Digiwebdex",
      "url": "https://digiwebdex.com"
    },
    "serviceType": "Software Development",
    "areaServed": {
      "@type": "Country",
      "name": "Bangladesh"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Software Development Packages",
      "itemListElement": [
        {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Starter Software"}, "price": "30000", "priceCurrency": "BDT"},
        {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Business Software"}, "price": "60000", "priceCurrency": "BDT"},
        {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Enterprise ERP/POS"}, "price": "100000", "priceCurrency": "BDT"}
      ]
    }
  };

  const breadcrumbs = [
    { name: language === 'bn' ? 'হোম' : 'Home', url: `/${language}` },
    { name: language === 'bn' ? 'সেবাসমূহ' : 'Services', url: `/${language}` },
    { name: language === 'bn' ? 'সফটওয়্যার ডেভেলপমেন্ট' : 'Software Development', url: `/${language}/services/software-development` },
  ];

  // Software Solutions
  const softwareSolutions = [
    {
      icon: Database,
      title: language === 'bn' ? 'ERP সলিউশন' : 'ERP Solution',
      description: language === 'bn' 
        ? 'সম্পূর্ণ এন্টারপ্রাইজ রিসোর্স প্ল্যানিং সিস্টেম' 
        : 'Complete Enterprise Resource Planning System',
      features: language === 'bn' 
        ? ['HR ম্যানেজমেন্ট', 'অ্যাকাউন্টিং', 'প্রোডাকশন', 'সেলস'] 
        : ['HR Management', 'Accounting', 'Production', 'Sales'],
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: ShoppingCart,
      title: language === 'bn' ? 'POS সিস্টেম' : 'POS System',
      description: language === 'bn' 
        ? 'রিটেইল ও রেস্টুরেন্টের জন্য পয়েন্ট অব সেল' 
        : 'Point of Sale for retail and restaurants',
      features: language === 'bn' 
        ? ['বিলিং', 'ইনভেন্টরি', 'রিপোর্টিং', 'মাল্টি-ব্র্যাঞ্চ'] 
        : ['Billing', 'Inventory', 'Reporting', 'Multi-branch'],
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Package,
      title: language === 'bn' ? 'ইনভেন্টরি ম্যানেজমেন্ট' : 'Inventory Management',
      description: language === 'bn' 
        ? 'স্টক ট্র্যাকিং ও ওয়্যারহাউস ম্যানেজমেন্ট' 
        : 'Stock tracking and warehouse management',
      features: language === 'bn' 
        ? ['স্টক ট্র্যাকিং', 'বারকোড', 'পারচেজ অর্ডার', 'অ্যালার্ট'] 
        : ['Stock Tracking', 'Barcode', 'Purchase Order', 'Alerts'],
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Cog,
      title: language === 'bn' ? 'কাস্টম অটোমেশন' : 'Custom Automation',
      description: language === 'bn' 
        ? 'আপনার ব্যবসার জন্য কাস্টম সফটওয়্যার সলিউশন' 
        : 'Custom software solution for your business',
      features: language === 'bn' 
        ? ['ওয়ার্কফ্লো', 'API ইন্টিগ্রেশন', 'রিপোর্টিং', 'অটোমেশন'] 
        : ['Workflow', 'API Integration', 'Reporting', 'Automation'],
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  // Benefits
  const benefits = [
    {
      icon: Cloud,
      title: language === 'bn' ? 'ক্লাউড বেসড' : 'Cloud Based',
      description: language === 'bn' 
        ? 'যেকোনো জায়গা থেকে অ্যাক্সেস করুন' 
        : 'Access from anywhere',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      icon: Shield,
      title: language === 'bn' ? 'সিকিউর ডাটা' : 'Secure Data',
      description: language === 'bn' 
        ? 'এন্ড-টু-এন্ড এনক্রিপশন ও ব্যাকআপ' 
        : 'End-to-end encryption & backup',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Users,
      title: language === 'bn' ? 'মাল্টি-ইউজার' : 'Multi-User',
      description: language === 'bn' 
        ? 'একাধিক ইউজার ও রোল ম্যানেজমেন্ট' 
        : 'Multiple users & role management',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: BarChart3,
      title: language === 'bn' ? 'অ্যানালিটিক্স' : 'Analytics',
      description: language === 'bn' 
        ? 'রিয়েল-টাইম রিপোর্ট ও ড্যাশবোর্ড' 
        : 'Real-time reports & dashboard',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Smartphone,
      title: language === 'bn' ? 'মোবাইল অ্যাপ' : 'Mobile App',
      description: language === 'bn' 
        ? 'Android ও iOS অ্যাপ সাপোর্ট' 
        : 'Android & iOS app support',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      icon: Settings,
      title: language === 'bn' ? 'স্কেলেবল' : 'Scalable',
      description: language === 'bn' 
        ? 'ব্যবসা বাড়লে সিস্টেমও বাড়বে' 
        : 'System grows with your business',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  // Process Steps
  const processSteps = [
    {
      icon: MessageSquare,
      number: '01',
      title: language === 'bn' ? 'বিশ্লেষণ' : 'Analysis',
      description: language === 'bn' 
        ? 'বিজনেস প্রসেস বিশ্লেষণ ও রিকোয়ারমেন্ট ডকুমেন্ট' 
        : 'Business process analysis & requirement document',
    },
    {
      icon: FileSearch,
      number: '02',
      title: language === 'bn' ? 'ডিজাইন' : 'Design',
      description: language === 'bn' 
        ? 'সিস্টেম আর্কিটেকচার ও UI/UX ডিজাইন' 
        : 'System architecture & UI/UX design',
    },
    {
      icon: Code,
      number: '03',
      title: language === 'bn' ? 'ডেভেলপমেন্ট' : 'Development',
      description: language === 'bn' 
        ? 'অ্যাজাইল মেথডে স্প্রিন্ট ভিত্তিক ডেভেলপমেন্ট' 
        : 'Sprint-based development in Agile method',
    },
    {
      icon: Rocket,
      number: '04',
      title: language === 'bn' ? 'ডেপ্লয়মেন্ট' : 'Deployment',
      description: language === 'bn' 
        ? 'টেস্টিং, ট্রেনিং ও গো-লাইভ সাপোর্ট' 
        : 'Testing, training & go-live support',
    },
  ];

  // Case Studies
  const caseStudies = [
    {
      title: language === 'bn' ? 'ফ্যাক্টরি ERP' : 'Factory ERP',
      category: language === 'bn' ? 'ERP সলিউশন' : 'ERP Solution',
      result: language === 'bn' ? '৪০% দক্ষতা বৃদ্ধি' : '40% Efficiency Increase',
      description: language === 'bn' 
        ? 'গার্মেন্টস ফ্যাক্টরির জন্য সম্পূর্ণ ERP সিস্টেম' 
        : 'Complete ERP system for garments factory',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
      gradient: 'from-blue-500/20 to-purple-500/20',
    },
    {
      title: language === 'bn' ? 'রিটেইল POS' : 'Retail POS',
      category: language === 'bn' ? 'POS সিস্টেম' : 'POS System',
      result: language === 'bn' ? '৫০+ আউটলেট' : '50+ Outlets',
      description: language === 'bn' 
        ? 'মাল্টি-ব্র্যাঞ্চ রিটেইল চেইনের জন্য POS' 
        : 'POS for multi-branch retail chain',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
      gradient: 'from-green-500/20 to-teal-500/20',
    },
    {
      title: language === 'bn' ? 'লজিস্টিক ম্যানেজমেন্ট' : 'Logistics Management',
      category: language === 'bn' ? 'কাস্টম সফটওয়্যার' : 'Custom Software',
      result: language === 'bn' ? '১০০% ট্র্যাকিং' : '100% Tracking',
      description: language === 'bn' 
        ? 'ডেলিভারি ও ফ্লিট ম্যানেজমেন্ট সিস্টেম' 
        : 'Delivery & fleet management system',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop',
      gradient: 'from-orange-500/20 to-red-500/20',
    },
  ];

  // FAQ
  const faqs = [
    {
      question: language === 'bn' ? 'সফটওয়্যার তৈরি করতে কত সময় লাগে?' : 'How long does software development take?',
      answer: language === 'bn' 
        ? 'প্রজেক্টের জটিলতা অনুযায়ী ২-৬ মাস সময় লাগে। ছোট প্রজেক্ট ২-৩ মাস, মিড-সাইজ ৩-৪ মাস এবং এন্টারপ্রাইজ ৪-৬ মাস।' 
        : 'It takes 2-6 months depending on complexity. Small projects 2-3 months, mid-size 3-4 months, and enterprise 4-6 months.',
    },
    {
      question: language === 'bn' ? 'সফটওয়্যার কি কাস্টমাইজ করা যাবে?' : 'Can the software be customized?',
      answer: language === 'bn' 
        ? 'হ্যাঁ, আমরা সম্পূর্ণ কাস্টম সফটওয়্যার তৈরি করি। আপনার বিজনেস প্রসেস অনুযায়ী ফিচার ডিজাইন করা হয়।' 
        : 'Yes, we build completely custom software. Features are designed according to your business process.',
    },
    {
      question: language === 'bn' ? 'ট্রেনিং দেওয়া হবে?' : 'Will training be provided?',
      answer: language === 'bn' 
        ? 'হ্যাঁ, সম্পূর্ণ ইউজার ট্রেনিং, ডকুমেন্টেশন এবং ভিডিও টিউটোরিয়াল দেওয়া হয়।' 
        : 'Yes, complete user training, documentation, and video tutorials are provided.',
    },
    {
      question: language === 'bn' ? 'সাপোর্ট ও মেইনটেন্যান্স কিভাবে?' : 'How is support & maintenance?',
      answer: language === 'bn' 
        ? 'ডেলিভারির পর ৬ মাস ফ্রি সাপোর্ট। পরে AMC (Annual Maintenance Contract) এ চলমান সাপোর্ট নিতে পারবেন।' 
        : '6 months free support after delivery. Later you can take ongoing support via AMC (Annual Maintenance Contract).',
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={language === 'bn' 
          ? 'সফটওয়্যার ডেভেলপমেন্ট বাংলাদেশ | ERP, POS, কাস্টম সফটওয়্যার ঢাকা' 
          : 'Software Development Bangladesh | ERP, POS, Custom Software Dhaka'}
        description={language === 'bn'
          ? 'বাংলাদেশে সেরা সফটওয়্যার ডেভেলপমেন্ট কোম্পানি। ERP সফটওয়্যার ৳৩০,০০০ থেকে, POS সিস্টেম, কাস্টম বিজনেস অটোমেশন। ১ বছর সাপোর্ট ও মেইনটেন্যান্স সহ।'
          : 'Best software development company in Bangladesh. ERP software from ৳30,000, POS systems, custom business automation. 1 year support & maintenance included.'}
        keywords={['software development bangladesh', 'ERP software bangladesh', 'ERP সফটওয়্যার বাংলাদেশ', 'POS software dhaka', 'POS সফটওয়্যার', 'custom software', 'কাস্টম সফটওয়্যার', 'inventory management software', 'সফটওয়্যার কোম্পানি ঢাকা', 'business automation', 'software company bangladesh']}
        breadcrumbs={breadcrumbs}
      />
      <SchemaMarkup schema={serviceSchema} id="software-service-schema" />

      {/* Hero Section */}
      <ServiceHero
        badge={language === 'bn' ? '⚙️ সফটওয়্যার ডেভেলপমেন্ট' : '⚙️ Software Development'}
        headline={language === 'bn' 
          ? 'কাস্টম সফটওয়্যার ও ERP সলিউশন' 
          : 'Custom Software & ERP Solutions'}
        subtext={language === 'bn' 
          ? 'আপনার ব্যবসার প্রসেস অটোমেট করুন। ERP, POS, ইনভেন্টরি থেকে শুরু করে যেকোনো কাস্টম সফটওয়্যার।' 
          : 'Automate your business processes. From ERP, POS, Inventory to any custom software.'}
        primaryCta={{
          text: language === 'bn' ? 'ফ্রি কনসাল্টেশন' : 'Free Consultation',
          href: `${basePath}/contact`,
        }}
        secondaryCta={{
          text: language === 'bn' ? 'কেস স্টাডি দেখুন' : 'View Case Studies',
          href: '#case-studies',
        }}
        stats={[
          { value: '100+', label: language === 'bn' ? 'সফটওয়্যার ডেলিভারি' : 'Software Delivered' },
          { value: '50+', label: language === 'bn' ? 'এন্টারপ্রাইজ ক্লায়েন্ট' : 'Enterprise Clients' },
          { value: '99%', label: language === 'bn' ? 'সন্তুষ্টি হার' : 'Satisfaction Rate' },
        ]}
      />

      {/* Software Solutions */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              {language === 'bn' ? '🛠️ সলিউশন' : '🛠️ Solutions'}
            </span>
            <h2 className="text-3xl font-bold sm:text-4xl">
              {language === 'bn' ? 'আমাদের সফটওয়্যার সলিউশন' : 'Our Software Solutions'}
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              {language === 'bn' 
                ? 'ব্যবসার সব প্রয়োজনে সম্পূর্ণ সফটওয়্যার সলিউশন' 
                : 'Complete software solutions for all business needs'}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {softwareSolutions.map((solution, index) => (
              <Card
                key={index}
                className="group glass-card border-transparent hover:border-primary/30 transition-all duration-500 hover:-translate-y-2"
              >
                <CardContent className="p-6">
                  <div className={`h-16 w-16 rounded-2xl ${solution.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <solution.icon className={`h-8 w-8 ${solution.color}`} />
                  </div>
                  <h3 className="font-bold text-xl mb-2">{solution.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{solution.description}</p>
                  <ul className="space-y-1">
                    {solution.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <FeatureGrid
        badge={language === 'bn' ? '✨ সুবিধাসমূহ' : '✨ Benefits'}
        title={language === 'bn' ? 'আমাদের সফটওয়্যারের সুবিধা' : 'Benefits of Our Software'}
        subtitle={language === 'bn' 
          ? 'এন্টারপ্রাইজ-গ্রেড ফিচার সাশ্রয়ী মূল্যে' 
          : 'Enterprise-grade features at affordable prices'}
        features={benefits}
        columns={3}
      />

      {/* Process */}
      <ProcessTimeline
        badge={language === 'bn' ? '📋 ডেভেলপমেন্ট প্রসেস' : '📋 Development Process'}
        title={language === 'bn' ? 'সফটওয়্যার ডেভেলপমেন্ট প্রসেস' : 'Software Development Process'}
        subtitle={language === 'bn' 
          ? 'অ্যাজাইল মেথডে স্বচ্ছ ও দক্ষ ডেভেলপমেন্ট' 
          : 'Transparent & efficient development in Agile method'}
        steps={processSteps}
      />

      {/* Case Studies */}
      <PortfolioShowcase
        badge={language === 'bn' ? '📊 কেস স্টাডি' : '📊 Case Studies'}
        title={language === 'bn' ? 'সফল প্রজেক্ট' : 'Successful Projects'}
        subtitle={language === 'bn' 
          ? 'দেখুন আমরা কিভাবে ব্যবসাগুলোকে ট্রান্সফর্ম করেছি' 
          : 'See how we transformed businesses'}
        items={caseStudies}
      />

      {/* FAQ */}
      <ServiceFAQ
        title={language === 'bn' ? 'সফটওয়্যার ডেভেলপমেন্ট FAQ' : 'Software Development FAQ'}
        faqs={faqs}
        schemaId="software-faq-schema"
      />

      {/* Final CTA */}
      <ServiceCTA
        title={language === 'bn' 
          ? 'আপনার ব্যবসা অটোমেট করুন!' 
          : 'Automate Your Business!'}
        subtitle={language === 'bn' 
          ? 'ফ্রি বিজনেস অ্যানালিসিস নিন এবং জানুন কিভাবে সফটওয়্যার আপনার ব্যবসা বদলে দিতে পারে।' 
          : 'Get free business analysis and learn how software can transform your business.'}
        primaryCta={{
          text: language === 'bn' ? 'ফ্রি অ্যানালিসিস' : 'Free Analysis',
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

export default SoftwareDevelopmentPage;
