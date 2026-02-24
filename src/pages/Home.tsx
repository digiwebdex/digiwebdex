import React from 'react';
import { Layout } from '@/components/layout';
import { 
  HeroSection, 
  ServicesSection, 
  PortfolioCategorySection,
  WhyChooseUsSection, 
  FeaturesSection,
  ProcessSection, 
  TestimonialsSection, 
  CTASection,
  StickyTopBar,
  ClientLogosSection,
  SocialProofSection,
  UrgencyBanner,
  LeadCaptureSection
} from '@/components/home';
import { AffiliateTracker } from '@/components/affiliate';
import { SEOHead } from '@/components/seo/SEOHead';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { seoService } from '@/services/seo';
import { useLanguage } from '@/lib/i18n';

const Home = () => {
  const { language } = useLanguage();
  
  // Generate organization schema
  const orgSchema = seoService.generateOrganizationSchema();
  const localBusinessSchema = seoService.generateLocalBusinessSchema();

  return (
    <Layout>
      <SEOHead
        title={language === 'bn' 
          ? 'Digiwebdex - বাংলাদেশের #১ ওয়েব ডেভেলপমেন্ট ও সফটওয়্যার কোম্পানি | ঢাকা' 
          : 'Digiwebdex - #1 Web Development & Software Company Bangladesh | Dhaka'}
        description={language === 'bn'
          ? 'বাংলাদেশের সেরা ওয়েব ডেভেলপমেন্ট, সফটওয়্যার ডেভেলপমেন্ট, ERP সফটওয়্যার, ই-কমার্স ওয়েবসাইট, ডোমেইন হোস্টিং ও ডিজিটাল মার্কেটিং সেবা। ৫০০+ সফল প্রজেক্ট। সাশ্রয়ী মূল্যে প্রিমিয়াম সার্ভিস।'
          : 'Best web development, software development, ERP software, e-commerce website, domain hosting & digital marketing services in Bangladesh. 500+ successful projects. Premium services at affordable prices.'}
        keywords={['web development bangladesh', 'ওয়েব ডেভেলপমেন্ট বাংলাদেশ', 'software company dhaka', 'সফটওয়্যার কোম্পানি ঢাকা', 'website design bangladesh', 'ওয়েবসাইট ডিজাইন', 'ERP software bangladesh', 'e-commerce website', 'ই-কমার্স ওয়েবসাইট', 'digital marketing bangladesh', 'ডিজিটাল মার্কেটিং', 'domain hosting', 'ডোমেইন হোস্টিং', 'web development company dhaka', 'best web design company bangladesh', 'website development cost bangladesh', 'ওয়েবসাইট তৈরি খরচ']}
      />
      <SchemaMarkup schema={orgSchema} id="organization-schema" />
      <SchemaMarkup schema={localBusinessSchema} id="local-business-schema" />
      <AffiliateTracker />
      
      {/* Sticky Top CTA Bar (desktop only, shows on scroll) */}
      <StickyTopBar />
      
      {/* Hero with benefit-driven headline and CTAs */}
      <HeroSection />
      
      {/* Client Logos Strip */}
      <ClientLogosSection />
      
      {/* Social Proof - Animated Stats + Rating */}
      <SocialProofSection />
      
      {/* 4 Main Services Grid */}
      <ServicesSection />
      
      {/* Urgency Banner with Countdown */}
      <UrgencyBanner />
      
      {/* Why Choose Us - 8 benefits */}
      <WhyChooseUsSection />
      
      {/* Category-Wise Portfolio */}
      <PortfolioCategorySection />
      
      {/* Feature Benefits List */}
      <FeaturesSection />
      
      {/* Work Process Steps */}
      <ProcessSection />
      
      {/* Lead Capture Form */}
      <LeadCaptureSection />
      
      {/* Testimonials Slider */}
      <TestimonialsSection />
      
      {/* Strong Final CTA */}
      <CTASection />
    </Layout>
  );
};

export default Home;
