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
  PricingSection,
  PortfolioShowcase,
} from '@/components/services';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  Facebook,
  Target,
  PenTool,
  TrendingUp,
  Users,
  BarChart3,
  DollarSign,
  Award,
  Zap,
  LineChart,
  Share2,
} from 'lucide-react';

const DigitalMarketingPage = () => {
  const { language } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  // Service Schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": language === 'bn' ? "ডিজিটাল মার্কেটিং সেবা - বাংলাদেশ" : "Digital Marketing Services - Bangladesh",
    "description": language === 'bn'
      ? "SEO, সোশ্যাল মিডিয়া মার্কেটিং, গুগল অ্যাডস, কনটেন্ট মার্কেটিং সেবা বাংলাদেশে।"
      : "SEO, social media marketing, Google Ads, content marketing services in Bangladesh.",
    "provider": {
      "@type": "Organization",
      "name": "Digiwebdex",
      "url": "https://digiwebdex.com"
    },
    "serviceType": "Digital Marketing",
    "areaServed": {
      "@type": "Country",
      "name": "Bangladesh"
    }
  };

  const breadcrumbs = [
    { name: language === 'bn' ? 'হোম' : 'Home', url: `/${language}` },
    { name: language === 'bn' ? 'সেবাসমূহ' : 'Services', url: `/${language}` },
    { name: language === 'bn' ? 'ডিজিটাল মার্কেটিং' : 'Digital Marketing', url: `/${language}/services/digital-marketing` },
  ];

  // Services
  const services = [
    {
      icon: Search,
      title: language === 'bn' ? 'SEO সার্ভিস' : 'SEO Service',
      description: language === 'bn' 
        ? 'গুগলে আপনার ওয়েবসাইটকে প্রথম পেজে আনুন' 
        : 'Get your website on Google\'s first page',
      features: language === 'bn' 
        ? ['কীওয়ার্ড রিসার্চ', 'অন-পেজ SEO', 'অফ-পেজ SEO', 'টেকনিক্যাল SEO'] 
        : ['Keyword Research', 'On-page SEO', 'Off-page SEO', 'Technical SEO'],
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Facebook,
      title: language === 'bn' ? 'সোশ্যাল মিডিয়া মার্কেটিং' : 'Social Media Marketing',
      description: language === 'bn' 
        ? 'Facebook, Instagram, YouTube-এ ব্র্যান্ড গ্রো করুন' 
        : 'Grow your brand on Facebook, Instagram, YouTube',
      features: language === 'bn' 
        ? ['কনটেন্ট ক্রিয়েশন', 'অ্যাড ক্যাম্পেইন', 'কমিউনিটি ম্যানেজমেন্ট', 'ইনফ্লুয়েন্সার'] 
        : ['Content Creation', 'Ad Campaign', 'Community Management', 'Influencer'],
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Target,
      title: language === 'bn' ? 'গুগল অ্যাডস' : 'Google Ads',
      description: language === 'bn' 
        ? 'PPC অ্যাডভার্টাইজিং দিয়ে ইনস্ট্যান্ট রেজাল্ট' 
        : 'Instant results with PPC advertising',
      features: language === 'bn' 
        ? ['সার্চ অ্যাডস', 'ডিসপ্লে অ্যাডস', 'শপিং অ্যাডস', 'রিমার্কেটিং'] 
        : ['Search Ads', 'Display Ads', 'Shopping Ads', 'Remarketing'],
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: PenTool,
      title: language === 'bn' ? 'কনটেন্ট মার্কেটিং' : 'Content Marketing',
      description: language === 'bn' 
        ? 'ভ্যালুয়েবল কনটেন্ট দিয়ে অডিয়েন্স বিল্ড করুন' 
        : 'Build audience with valuable content',
      features: language === 'bn' 
        ? ['ব্লগ রাইটিং', 'ভিডিও কনটেন্ট', 'ইনফোগ্রাফিক', 'ই-বুক'] 
        : ['Blog Writing', 'Video Content', 'Infographic', 'E-book'],
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  // Growth Stats
  const growthStats = [
    {
      icon: TrendingUp,
      value: '300%',
      label: language === 'bn' ? 'গড় ট্রাফিক বৃদ্ধি' : 'Avg Traffic Growth',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Users,
      value: '50K+',
      label: language === 'bn' ? 'লিড জেনারেট' : 'Leads Generated',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: DollarSign,
      value: '₹10Cr+',
      label: language === 'bn' ? 'ক্লায়েন্ট রেভেনিউ' : 'Client Revenue',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Award,
      value: '200+',
      label: language === 'bn' ? 'সফল ক্যাম্পেইন' : 'Successful Campaigns',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  // Benefits
  const benefits = [
    {
      icon: BarChart3,
      title: language === 'bn' ? 'ডাটা-ড্রিভেন' : 'Data-Driven',
      description: language === 'bn' 
        ? 'সব সিদ্ধান্ত ডাটার উপর ভিত্তি করে' 
        : 'All decisions based on data',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Zap,
      title: language === 'bn' ? 'ROI ফোকাসড' : 'ROI Focused',
      description: language === 'bn' 
        ? 'প্রতিটি টাকার সর্বোচ্চ রিটার্ন' 
        : 'Maximum return on every taka',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: LineChart,
      title: language === 'bn' ? 'ট্রান্সপারেন্ট রিপোর্টিং' : 'Transparent Reporting',
      description: language === 'bn' 
        ? 'মাসিক ডিটেইল রিপোর্ট ও অ্যানালিটিক্স' 
        : 'Monthly detailed reports & analytics',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Share2,
      title: language === 'bn' ? 'মাল্টি-চ্যানেল' : 'Multi-Channel',
      description: language === 'bn' 
        ? 'সব প্ল্যাটফর্মে ইন্টিগ্রেটেড মার্কেটিং' 
        : 'Integrated marketing across all platforms',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  // Pricing Plans
  const pricingPlans = [
    {
      name: language === 'bn' ? 'স্টার্টার' : 'Starter',
      price: '৳3,000',
      period: language === 'bn' ? '/মাস' : '/month',
      description: language === 'bn' ? 'ছোট ব্যবসার জন্য' : 'For small businesses',
      features: [
        language === 'bn' ? 'বেসিক SEO' : 'Basic SEO',
        language === 'bn' ? 'সোশ্যাল মিডিয়া ম্যানেজমেন্ট (2 প্ল্যাটফর্ম)' : 'Social Media Management (2 platforms)',
        language === 'bn' ? '8টি পোস্ট/মাস' : '8 posts/month',
        language === 'bn' ? 'মাসিক রিপোর্ট' : 'Monthly Report',
      ],
      href: `${basePath}/contact`,
      ctaText: language === 'bn' ? 'শুরু করুন' : 'Get Started',
    },
    {
      name: language === 'bn' ? 'গ্রোথ' : 'Growth',
      price: '৳8,000',
      period: language === 'bn' ? '/মাস' : '/month',
      description: language === 'bn' ? 'গ্রোয়িং ব্যবসার জন্য' : 'For growing businesses',
      features: [
        language === 'bn' ? 'অ্যাডভান্সড SEO' : 'Advanced SEO',
        language === 'bn' ? 'সোশ্যাল মিডিয়া (4 প্ল্যাটফর্ম)' : 'Social Media (4 platforms)',
        language === 'bn' ? '16টি পোস্ট/মাস' : '16 posts/month',
        language === 'bn' ? 'গুগল অ্যাডস ম্যানেজমেন্ট' : 'Google Ads Management',
        language === 'bn' ? 'সাপ্তাহিক রিপোর্ট' : 'Weekly Report',
      ],
      popular: true,
      href: `${basePath}/contact`,
      ctaText: language === 'bn' ? 'শুরু করুন' : 'Get Started',
    },
    {
      name: language === 'bn' ? 'এন্টারপ্রাইজ' : 'Enterprise',
      price: '৳20,000',
      period: language === 'bn' ? '/মাস' : '/month',
      description: language === 'bn' ? 'বড় ব্যবসা ও এজেন্সির জন্য' : 'For large businesses & agencies',
      features: [
        language === 'bn' ? 'এন্টারপ্রাইজ SEO' : 'Enterprise SEO',
        language === 'bn' ? 'ফুল ডিজিটাল মার্কেটিং' : 'Full Digital Marketing',
        language === 'bn' ? 'আনলিমিটেড কনটেন্ট' : 'Unlimited Content',
        language === 'bn' ? 'PPC ক্যাম্পেইন' : 'PPC Campaigns',
        language === 'bn' ? 'ডেডিকেটেড ম্যানেজার' : 'Dedicated Manager',
        language === 'bn' ? 'কাস্টম স্ট্র্যাটেজি' : 'Custom Strategy',
      ],
      href: `${basePath}/contact`,
      ctaText: language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us',
    },
  ];

  // Case Results
  const caseResults = [
    {
      title: language === 'bn' ? 'ফ্যাশন ই-কমার্স' : 'Fashion E-commerce',
      category: language === 'bn' ? 'সোশ্যাল মিডিয়া + SEO' : 'Social Media + SEO',
      result: language === 'bn' ? '৪০০% সেলস বৃদ্ধি' : '400% Sales Increase',
      description: language === 'bn' 
        ? 'ফেসবুক অ্যাড ও SEO দিয়ে অনলাইন সেলস বুস্ট' 
        : 'Boosted online sales with Facebook Ads & SEO',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
      gradient: 'from-pink-500/20 to-purple-500/20',
    },
    {
      title: language === 'bn' ? 'রিয়েল এস্টেট' : 'Real Estate',
      category: language === 'bn' ? 'গুগল অ্যাডস' : 'Google Ads',
      result: language === 'bn' ? '১০০+ লিড/মাস' : '100+ Leads/Month',
      description: language === 'bn' 
        ? 'PPC ক্যাম্পেইনে কোয়ালিটি লিড জেনারেশন' 
        : 'Quality lead generation with PPC campaigns',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop',
      gradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      title: language === 'bn' ? 'ট্র্যাভেল এজেন্সি' : 'Travel Agency',
      category: language === 'bn' ? 'কনটেন্ট মার্কেটিং' : 'Content Marketing',
      result: language === 'bn' ? '২৫০% ট্রাফিক বৃদ্ধি' : '250% Traffic Increase',
      description: language === 'bn' 
        ? 'ব্লগ ও ভিডিও কনটেন্ট দিয়ে অর্গানিক গ্রোথ' 
        : 'Organic growth with blog & video content',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop',
      gradient: 'from-green-500/20 to-teal-500/20',
    },
  ];

  // FAQ
  const faqs = [
    {
      question: language === 'bn' ? 'ডিজিটাল মার্কেটিং রেজাল্ট দেখতে কত সময় লাগে?' : 'How long to see digital marketing results?',
      answer: language === 'bn' 
        ? 'SEO-তে ৩-৬ মাস, সোশ্যাল মিডিয়াতে ১-২ মাস এবং পেইড অ্যাডে ইনস্ট্যান্ট রেজাল্ট দেখা যায়।' 
        : 'SEO takes 3-6 months, social media 1-2 months, and paid ads show instant results.',
    },
    {
      question: language === 'bn' ? 'কোন প্ল্যাটফর্মে মার্কেটিং করা উচিত?' : 'Which platform should I market on?',
      answer: language === 'bn' 
        ? 'এটা আপনার টার্গেট অডিয়েন্সের উপর নির্ভর করে। আমরা ফ্রি অডিট করে সেরা প্ল্যাটফর্ম সাজেস্ট করি।' 
        : 'It depends on your target audience. We suggest the best platform after a free audit.',
    },
    {
      question: language === 'bn' ? 'বাজেট কত হওয়া উচিত?' : 'What should be the budget?',
      answer: language === 'bn' 
        ? 'আমাদের প্যাকেজ ৳৩,০০০ থেকে শুরু। অ্যাড স্পেন্ড আলাদা এবং আপনার গোল অনুযায়ী নির্ধারণ করা হয়।' 
        : 'Our packages start from ৳3,000. Ad spend is separate and determined according to your goals.',
    },
    {
      question: language === 'bn' ? 'রিপোর্টিং কিভাবে হয়?' : 'How is reporting done?',
      answer: language === 'bn' 
        ? 'সাপ্তাহিক/মাসিক ডিটেইল রিপোর্ট, রিয়েল-টাইম ড্যাশবোর্ড অ্যাক্সেস এবং মিটিং।' 
        : 'Weekly/monthly detailed reports, real-time dashboard access and meetings.',
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={language === 'bn' 
          ? 'ডিজিটাল মার্কেটিং সেবা বাংলাদেশ | SEO, সোশ্যাল মিডিয়া, গুগল অ্যাডস ঢাকা' 
          : 'Digital Marketing Services Bangladesh | SEO, Social Media, Google Ads Dhaka'}
        description={language === 'bn'
          ? 'বাংলাদেশে সেরা ডিজিটাল মার্কেটিং সেবা। SEO অপ্টিমাইজেশন, ফেসবুক মার্কেটিং, গুগল অ্যাডস ম্যানেজমেন্ট মাত্র ৳৫,০০০/মাস থেকে। ROI ফোকাসড মার্কেটিং।'
          : 'Best digital marketing services in Bangladesh. SEO optimization, Facebook marketing, Google Ads management from ৳5,000/month. ROI-focused marketing.'}
        keywords={['digital marketing bangladesh', 'SEO service dhaka', 'ডিজিটাল মার্কেটিং বাংলাদেশ', 'SEO সেবা ঢাকা', 'social media marketing', 'সোশ্যাল মিডিয়া মার্কেটিং', 'Google Ads bangladesh', 'ফেসবুক মার্কেটিং', 'content marketing', 'digital marketing agency dhaka']}
        breadcrumbs={breadcrumbs}
      />
      <SchemaMarkup schema={serviceSchema} id="marketing-service-schema" />

      {/* Hero Section */}
      <ServiceHero
        badge={language === 'bn' ? '📈 ডিজিটাল মার্কেটিং' : '📈 Digital Marketing'}
        headline={language === 'bn' 
          ? 'ডিজিটাল মার্কেটিং দিয়ে ব্যবসা বৃদ্ধি করুন' 
          : 'Grow Your Business with Digital Marketing'}
        subtext={language === 'bn' 
          ? 'SEO, সোশ্যাল মিডিয়া, গুগল অ্যাডস - সব চ্যানেলে ROI ফোকাসড মার্কেটিং। আপনার ব্যবসাকে অনলাইনে সফল করুন।' 
          : 'ROI-focused marketing across SEO, Social Media, Google Ads. Make your business successful online.'}
        primaryCta={{
          text: language === 'bn' ? 'ফ্রি অডিট' : 'Free Audit',
          href: `${basePath}/contact`,
        }}
        secondaryCta={{
          text: language === 'bn' ? 'কেস স্টাডি' : 'Case Studies',
          href: '#case-studies',
        }}
      />

      {/* Growth Stats */}
      <section className="py-12 bg-secondary/30">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {growthStats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-card border border-transparent hover:border-primary/20 transition-all duration-300"
              >
                <div className={`h-14 w-14 rounded-xl ${stat.bgColor} flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              {language === 'bn' ? '🛠️ সার্ভিস সমূহ' : '🛠️ Services'}
            </span>
            <h2 className="text-3xl font-bold sm:text-4xl">
              {language === 'bn' ? 'আমাদের ডিজিটাল মার্কেটিং সেবা' : 'Our Digital Marketing Services'}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <Card
                key={index}
                className="group glass-card border-transparent hover:border-primary/30 transition-all duration-500 hover:-translate-y-2"
              >
                <CardContent className="p-6">
                  <div className={`h-16 w-16 rounded-2xl ${service.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className={`h-8 w-8 ${service.color}`} />
                  </div>
                  <h3 className="font-bold text-xl mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                  <ul className="space-y-1">
                    {service.features.map((feature, idx) => (
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

      {/* Case Results */}
      <PortfolioShowcase
        badge={language === 'bn' ? '📊 কেস রেজাল্ট' : '📊 Case Results'}
        title={language === 'bn' ? 'আমাদের সাফল্যের গল্প' : 'Our Success Stories'}
        subtitle={language === 'bn' 
          ? 'দেখুন আমরা কিভাবে ক্লায়েন্টদের ROI বাড়িয়েছি' 
          : 'See how we increased client ROI'}
        items={caseResults}
      />

      {/* Benefits */}
      <FeatureGrid
        badge={language === 'bn' ? '✨ কেন আমরা?' : '✨ Why Us?'}
        title={language === 'bn' ? 'আমাদের মার্কেটিং অ্যাপ্রোচ' : 'Our Marketing Approach'}
        subtitle={language === 'bn' 
          ? 'ডাটা-ড্রিভেন স্ট্র্যাটেজি দিয়ে মেজারেবল রেজাল্ট' 
          : 'Measurable results with data-driven strategy'}
        features={benefits}
        columns={4}
      />

      {/* Pricing */}
      <PricingSection
        badge={language === 'bn' ? '💰 প্যাকেজ' : '💰 Packages'}
        title={language === 'bn' ? 'মার্কেটিং প্যাকেজ' : 'Marketing Packages'}
        subtitle={language === 'bn' 
          ? 'আপনার বাজেট ও গোল অনুযায়ী প্যাকেজ বেছে নিন' 
          : 'Choose a package according to your budget & goals'}
        plans={pricingPlans}
      />

      {/* FAQ */}
      <ServiceFAQ
        title={language === 'bn' ? 'ডিজিটাল মার্কেটিং FAQ' : 'Digital Marketing FAQ'}
        faqs={faqs}
        schemaId="marketing-faq-schema"
      />

      {/* Final CTA */}
      <ServiceCTA
        title={language === 'bn' 
          ? 'আপনার বিজনেস গ্রো করুন!' 
          : 'Grow Your Business!'}
        subtitle={language === 'bn' 
          ? 'ফ্রি মার্কেটিং অডিট নিন এবং জানুন কোথায় ইমপ্রুভমেন্ট দরকার।' 
          : 'Get a free marketing audit and learn where improvement is needed.'}
        primaryCta={{
          text: language === 'bn' ? 'ফ্রি অডিট' : 'Free Audit',
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

export default DigitalMarketingPage;
