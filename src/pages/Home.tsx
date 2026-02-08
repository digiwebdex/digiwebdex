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
          ? 'Digiwebdex - বাংলাদেশের সেরা ডিজিটাল এজেন্সি | ডোমেইন, হোস্টিং, ওয়েব ডেভেলপমেন্ট' 
          : 'Digiwebdex - Bangladesh\'s Premier Digital Agency | Domain, Hosting, Web Development'}
        description={language === 'bn'
          ? 'Digiwebdex - বাংলাদেশের সেরা ডোমেইন রেজিস্ট্রেশন, ওয়েব হোস্টিং, ওয়েব ডেভেলপমেন্ট, সফটওয়্যার ডেভেলপমেন্ট এবং ডিজিটাল মার্কেটিং সেবা। সাশ্রয়ী মূল্যে প্রিমিয়াম সার্ভিস।'
          : 'Digiwebdex - Best domain registration, web hosting, web development, software development, and digital marketing services in Bangladesh. Premium services at affordable prices.'}
        keywords={['domain', 'hosting', 'web development', 'software development', 'digital marketing', 'Bangladesh', 'Dhaka', 'Digiwebdex', 'ডোমেইন', 'হোস্টিং', 'ওয়েব ডেভেলপমেন্ট']}
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
