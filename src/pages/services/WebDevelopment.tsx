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
  Code,
  ShoppingCart,
  Briefcase,
  Newspaper,
  Palette,
  Smartphone,
  Search,
  Zap,
  MessageSquare,
  FileSearch,
  Rocket,
  Layers,
  Globe,
  Shield,
} from 'lucide-react';

const WebDevelopmentPage = () => {
  const { language } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  // Service Schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": language === 'bn' ? "ওয়েব ডেভেলপমেন্ট সেবা" : "Web Development Services",
    "provider": {
      "@type": "Organization",
      "name": "Digiwebdex"
    },
    "serviceType": "Web Development",
    "areaServed": "Bangladesh",
  };

  // Website Types
  const websiteTypes = [
    {
      icon: Briefcase,
      title: language === 'bn' ? 'স্টার্টার ওয়েবসাইট' : 'Starter Website',
      description: language === 'bn' 
        ? '৫ পেজ, রেসপন্সিভ ডিজাইন, কন্টাক্ট ফর্ম, SEO অপ্টিমাইজড' 
        : '5 pages, responsive design, contact form, SEO optimized',
      price: language === 'bn' ? '৳১৫,০০০' : '৳15,000',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: ShoppingCart,
      title: language === 'bn' ? 'বিজনেস ওয়েবসাইট' : 'Business Website',
      description: language === 'bn' 
        ? '১৫ পেজ, কাস্টম ডিজাইন, ব্লগ, অ্যাডমিন প্যানেল' 
        : '15 pages, custom design, blog, admin panel',
      price: language === 'bn' ? '৳৩০,০০০' : '৳30,000',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Palette,
      title: language === 'bn' ? 'ই-কমার্স ওয়েবসাইট' : 'E-commerce Website',
      description: language === 'bn' 
        ? 'আনলিমিটেড প্রোডাক্ট, পেমেন্ট গেটওয়ে, অর্ডার ম্যানেজমেন্ট' 
        : 'Unlimited products, payment gateway, order management',
      price: language === 'bn' ? '৳৫০,০০০' : '৳50,000',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Newspaper,
      title: language === 'bn' ? 'কাস্টম প্রজেক্ট' : 'Custom Project',
      description: language === 'bn' 
        ? 'আপনার প্রয়োজন অনুযায়ী কাস্টম সলিউশন' 
        : 'Custom solution based on your requirements',
      price: language === 'bn' ? 'কোটেশন নিন' : 'Get Quote',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  // Tech Stack
  const techStack = [
    {
      icon: Code,
      title: 'React / Next.js',
      description: language === 'bn' 
        ? 'মডার্ন ফ্রন্টএন্ড ফ্রেমওয়ার্ক' 
        : 'Modern frontend framework',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      icon: Layers,
      title: 'Node.js / PHP',
      description: language === 'bn' 
        ? 'শক্তিশালী ব্যাকএন্ড টেকনোলজি' 
        : 'Powerful backend technology',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Globe,
      title: 'WordPress / Laravel',
      description: language === 'bn' 
        ? 'জনপ্রিয় CMS ও ফ্রেমওয়ার্ক' 
        : 'Popular CMS & framework',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Smartphone,
      title: language === 'bn' ? 'রেসপন্সিভ ডিজাইন' : 'Responsive Design',
      description: language === 'bn' 
        ? 'সব ডিভাইসে পারফেক্ট ডিসপ্লে' 
        : 'Perfect display on all devices',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Search,
      title: language === 'bn' ? 'SEO অপ্টিমাইজড' : 'SEO Optimized',
      description: language === 'bn' 
        ? 'সার্চ ইঞ্জিনে ভালো র‍্যাংকিং' 
        : 'Good ranking in search engines',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: Shield,
      title: language === 'bn' ? 'সিকিউর কোড' : 'Secure Code',
      description: language === 'bn' 
        ? 'সিকিউরিটি বেস্ট প্র্যাকটিস' 
        : 'Security best practices',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  // Process Steps
  const processSteps = [
    {
      icon: MessageSquare,
      number: '01',
      title: language === 'bn' ? 'রিকোয়ারমেন্ট' : 'Requirements',
      description: language === 'bn' 
        ? 'আপনার প্রয়োজন বুঝে ডিটেইল প্ল্যান তৈরি' 
        : 'Understanding your needs and creating detailed plan',
    },
    {
      icon: FileSearch,
      number: '02',
      title: language === 'bn' ? 'ডিজাইন' : 'Design',
      description: language === 'bn' 
        ? 'UI/UX ডিজাইন ও প্রোটোটাইপ তৈরি' 
        : 'UI/UX design and prototype creation',
    },
    {
      icon: Code,
      number: '03',
      title: language === 'bn' ? 'ডেভেলপমেন্ট' : 'Development',
      description: language === 'bn' 
        ? 'ক্লিন কোড দিয়ে ওয়েবসাইট ডেভেলপ' 
        : 'Website development with clean code',
    },
    {
      icon: Rocket,
      number: '04',
      title: language === 'bn' ? 'লঞ্চ' : 'Launch',
      description: language === 'bn' 
        ? 'টেস্টিং, লঞ্চ ও অনগোয়িং সাপোর্ট' 
        : 'Testing, launch and ongoing support',
    },
  ];

  // Portfolio Items
  const portfolioItems = [
    {
      title: language === 'bn' ? 'শপবিডি ই-কমার্স' : 'ShopBD E-commerce',
      category: language === 'bn' ? 'ই-কমার্স' : 'E-commerce',
      result: language === 'bn' ? '৩০০% বিক্রি বৃদ্ধি' : '300% Sales Increase',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
      gradient: 'from-blue-500/20 to-purple-500/20',
    },
    {
      title: language === 'bn' ? 'টেকস্টার্ট কর্পোরেট' : 'TechStart Corporate',
      category: language === 'bn' ? 'কর্পোরেট' : 'Corporate',
      result: language === 'bn' ? '২০০+ লিড/মাস' : '200+ Leads/Month',
      image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop',
      gradient: 'from-green-500/20 to-teal-500/20',
    },
    {
      title: language === 'bn' ? 'নিউজবাংলা পোর্টাল' : 'NewsBangla Portal',
      category: language === 'bn' ? 'নিউজ পোর্টাল' : 'News Portal',
      result: language === 'bn' ? '৫০K+ ডেইলি ভিজিটর' : '50K+ Daily Visitors',
      image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop',
      gradient: 'from-orange-500/20 to-red-500/20',
    },
  ];

  // FAQ
  const faqs = [
    {
      question: language === 'bn' ? 'ওয়েবসাইট বানাতে কত সময় লাগে?' : 'How long does it take to build a website?',
      answer: language === 'bn' 
        ? 'সাধারণ ওয়েবসাইট ৭-১৪ দিন, ই-কমার্স ১৫-৩০ দিন এবং কাস্টম প্রজেক্ট ৩০-৬০ দিন সময় নেয়।' 
        : 'Simple websites take 7-14 days, e-commerce 15-30 days, and custom projects 30-60 days.',
    },
    {
      question: language === 'bn' ? 'পেমেন্ট কিভাবে করতে হয়?' : 'How do I make payment?',
      answer: language === 'bn' 
        ? 'প্রজেক্ট শুরুতে ৫০% অগ্রিম এবং ডেলিভারির পর বাকি ৫০%। bKash, Nagad, ব্যাংক ট্রান্সফার সব মাধ্যমে পেমেন্ট করা যায়।' 
        : '50% advance at project start and remaining 50% after delivery. Payment via bKash, Nagad, Bank transfer.',
    },
    {
      question: language === 'bn' ? 'সোর্স কোড কি দেবেন?' : 'Will you provide source code?',
      answer: language === 'bn' 
        ? 'হ্যাঁ, প্রজেক্ট সম্পন্ন হলে সম্পূর্ণ সোর্স কোড ও ফাইল আপনাকে দিয়ে দেওয়া হবে।' 
        : 'Yes, complete source code and files will be provided after project completion.',
    },
    {
      question: language === 'bn' ? 'পরে পরিবর্তন করা যাবে?' : 'Can I make changes later?',
      answer: language === 'bn' 
        ? 'হ্যাঁ, ডেলিভারির পর ৩০ দিন ফ্রি সাপোর্ট ও মাইনর চেঞ্জ। পরে AMC প্ল্যানে সাপোর্ট নিতে পারবেন।' 
        : 'Yes, 30 days free support and minor changes after delivery. Later you can take AMC plan.',
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={language === 'bn' 
          ? 'ওয়েব ডেভেলপমেন্ট সেবা | Digiwebdex - প্রফেশনাল ওয়েবসাইট তৈরি' 
          : 'Web Development Services | Digiwebdex - Professional Website Development'}
        description={language === 'bn'
          ? 'আপনার ব্যবসার জন্য প্রফেশনাল ওয়েবসাইট তৈরি করুন। কর্পোরেট, ই-কমার্স, পোর্টফোলিও, নিউজ পোর্টাল - সব ধরনের ওয়েবসাইট ডেভেলপমেন্ট সেবা।'
          : 'Create professional websites for your business. Corporate, e-commerce, portfolio, news portal - all types of web development services.'}
        keywords={['web development', 'website design', 'e-commerce', 'corporate website', 'ওয়েব ডেভেলপমেন্ট', 'ওয়েবসাইট']}
      />
      <SchemaMarkup schema={serviceSchema} id="webdev-service-schema" />

      {/* Hero Section */}
      <ServiceHero
        badge={language === 'bn' ? '💻 ওয়েব ডেভেলপমেন্ট' : '💻 Web Development'}
        headline={language === 'bn' 
          ? 'আপনার ব্যবসার জন্য প্রফেশনাল ওয়েবসাইট তৈরি করুন' 
          : 'Create Professional Websites for Your Business'}
        subtext={language === 'bn' 
          ? 'মডার্ন ডিজাইন, রেসপন্সিভ লেআউট, SEO ফ্রেন্ডলি। আপনার ব্র্যান্ডকে অনলাইনে তুলে ধরুন।' 
          : 'Modern design, responsive layout, SEO friendly. Showcase your brand online.'}
        primaryCta={{
          text: language === 'bn' ? 'ফ্রি কনসাল্টেশন' : 'Free Consultation',
          href: `${basePath}/contact`,
        }}
        secondaryCta={{
          text: language === 'bn' ? 'পোর্টফোলিও দেখুন' : 'View Portfolio',
          href: '#portfolio',
        }}
        stats={[
          { value: '500+', label: language === 'bn' ? 'ওয়েবসাইট ডেলিভারি' : 'Websites Delivered' },
          { value: '100%', label: language === 'bn' ? 'ক্লায়েন্ট সন্তুষ্টি' : 'Client Satisfaction' },
          { value: '5+', label: language === 'bn' ? 'বছরের অভিজ্ঞতা' : 'Years Experience' },
        ]}
      />

      {/* Website Types */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              {language === 'bn' ? '🌐 ওয়েবসাইট ক্যাটাগরি' : '🌐 Website Categories'}
            </span>
            <h2 className="text-3xl font-bold sm:text-4xl">
              {language === 'bn' ? 'যেকোনো ধরনের ওয়েবসাইট' : 'Any Type of Website'}
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              {language === 'bn' 
                ? 'আপনার প্রয়োজন অনুযায়ী যেকোনো ধরনের ওয়েবসাইট তৈরি করি' 
                : 'We create any type of website according to your needs'}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {websiteTypes.map((type, index) => (
              <Card
                key={index}
                className="group glass-card border-transparent hover:border-primary/30 transition-all duration-500 hover:-translate-y-2"
              >
                <CardContent className="p-6">
                  <div className={`h-16 w-16 rounded-2xl ${type.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <type.icon className={`h-8 w-8 ${type.color}`} />
                  </div>
                  <h3 className="font-bold text-xl mb-2">{type.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{type.description}</p>
                  <p className="text-primary font-bold">{type.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <ProcessTimeline
        badge={language === 'bn' ? '📋 কাজের ধাপ' : '📋 Work Process'}
        title={language === 'bn' ? 'আমরা যেভাবে কাজ করি' : 'How We Work'}
        subtitle={language === 'bn' 
          ? 'সহজ ও স্বচ্ছ প্রক্রিয়ায় আপনার ওয়েবসাইট তৈরি' 
          : 'Creating your website through a simple & transparent process'}
        steps={processSteps}
      />

      {/* Portfolio */}
      <PortfolioShowcase
        badge={language === 'bn' ? '💼 পোর্টফোলিও' : '💼 Portfolio'}
        title={language === 'bn' ? 'আমাদের সাম্প্রতিক কাজ' : 'Our Recent Work'}
        subtitle={language === 'bn' 
          ? 'দেখুন আমরা কিভাবে ক্লায়েন্টদের সাফল্যে সাহায্য করেছি' 
          : 'See how we helped clients achieve success'}
        items={portfolioItems}
        viewAllHref={`${basePath}/portfolio`}
        viewAllText={language === 'bn' ? 'সব প্রজেক্ট দেখুন' : 'View All Projects'}
      />

      {/* Tech Stack */}
      <FeatureGrid
        badge={language === 'bn' ? '🔧 টেকনোলজি' : '🔧 Technology'}
        title={language === 'bn' ? 'আমরা যে টেকনোলজি ব্যবহার করি' : 'Technologies We Use'}
        subtitle={language === 'bn' 
          ? 'লেটেস্ট ও মডার্ন টেকনোলজি দিয়ে ওয়েবসাইট তৈরি' 
          : 'Building websites with latest & modern technology'}
        features={techStack}
        columns={3}
      />

      {/* FAQ */}
      <ServiceFAQ
        title={language === 'bn' ? 'ওয়েব ডেভেলপমেন্ট FAQ' : 'Web Development FAQ'}
        faqs={faqs}
        schemaId="webdev-faq-schema"
      />

      {/* Final CTA */}
      <ServiceCTA
        title={language === 'bn' 
          ? 'আপনার ড্রিম ওয়েবসাইট তৈরি করুন!' 
          : 'Build Your Dream Website!'}
        subtitle={language === 'bn' 
          ? 'ফ্রি কনসাল্টেশন নিন এবং জানুন কিভাবে আপনার ব্যবসাকে অনলাইনে সফল করা যায়।' 
          : 'Get free consultation and learn how to make your business successful online.'}
        primaryCta={{
          text: language === 'bn' ? 'ফ্রি কনসাল্টেশন' : 'Free Consultation',
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

export default WebDevelopmentPage;
