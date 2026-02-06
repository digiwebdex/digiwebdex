import React from 'react';
import { Layout } from '@/components/layout';
import { HeroSection, ServicesSection, FeaturesSection, CTASection } from '@/components/home';
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
          ? 'ডোমেইন, হোস্টিং এবং ওয়েব ডেভেলপমেন্ট সেবা' 
          : 'Domain, Hosting & Web Development Services'}
        description={language === 'bn'
          ? 'বাংলাদেশের সেরা ডোমেইন রেজিস্ট্রেশন, ওয়েব হোস্টিং, ওয়েব ডেভেলপমেন্ট এবং ডিজিটাল মার্কেটিং সেবা। সাশ্রয়ী মূল্যে সেরা সার্ভিস।'
          : 'Best domain registration, web hosting, web development, and digital marketing services in Bangladesh. Best prices guaranteed.'}
        keywords={['domain', 'hosting', 'web development', 'digital marketing', 'Bangladesh', 'Dhaka']}
      />
      <SchemaMarkup schema={orgSchema} id="organization-schema" />
      <SchemaMarkup schema={localBusinessSchema} id="local-business-schema" />
      <AffiliateTracker />
      <HeroSection />
      <ServicesSection />
      <FeaturesSection />
      <CTASection />
    </Layout>
  );
};

export default Home;
