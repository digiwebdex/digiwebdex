import React from 'react';
import { Layout } from '@/components/layout';
import { SEOHead, SchemaMarkup } from '@/components/seo';
import { useLanguage } from '@/lib/i18n';
import {
  AboutHero,
  AboutIntroduction,
  AboutMissionVision,
  AboutServices,
  AboutWhyChoose,
  AboutProcess,
  AboutTrust,
  AboutCTA,
} from '@/components/about';

export default function About() {
  const { language } = useLanguage();

  const seoContent = {
    bn: {
      title: 'আমাদের সম্পর্কে - Digiwebdex',
      description: 'Digiwebdex বাংলাদেশের অগ্রণী ডিজিটাল সার্ভিস প্রোভাইডার। ডোমেইন, হোস্টিং, ওয়েবসাইট, সফটওয়্যার ও ডিজিটাল মার্কেটিং সেবা।',
      keywords: ['ডিজিওয়েবডেক্স', 'ওয়েব ডেভেলপমেন্ট বাংলাদেশ', 'ডিজিটাল মার্কেটিং ঢাকা', 'সফটওয়্যার কোম্পানি'],
    },
    en: {
      title: 'About Us - Digiwebdex',
      description: 'Digiwebdex is a leading digital service provider in Bangladesh. Domain, hosting, website, software & digital marketing services.',
      keywords: ['Digiwebdex', 'web development Bangladesh', 'digital marketing Dhaka', 'software company'],
    },
  };

  const seo = seoContent[language];

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: language === 'bn' ? 'হোম' : 'Home',
        item: `https://digiwebdex.com/${language}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: language === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us',
        item: `https://digiwebdex.com/${language}/about-us`,
      },
    ],
  };

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Digiwebdex',
    url: 'https://digiwebdex.com',
    logo: 'https://digiwebdex.com/logo.png',
    description: seo.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'House No. 49 Shekhertek',
      addressLocality: 'Mohammadpur',
      addressRegion: 'Dhaka',
      addressCountry: 'BD',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+880-1674-533303',
      contactType: 'customer service',
      availableLanguage: ['Bengali', 'English'],
    },
    sameAs: [
      'https://facebook.com/digiwebdex',
      'https://linkedin.com/company/digiwebdex',
    ],
  };

  return (
    <Layout>
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonicalUrl={`https://digiwebdex.com/${language}/about-us`}
        ogType="website"
      />
      <SchemaMarkup schema={breadcrumbSchema} id="breadcrumb-schema" />
      <SchemaMarkup schema={organizationSchema} id="organization-schema" />

      <main>
        <AboutHero />
        <AboutIntroduction />
        <AboutMissionVision />
        <AboutServices />
        <AboutWhyChoose />
        <AboutProcess />
        <AboutTrust />
        <AboutCTA />
      </main>
    </Layout>
  );
}
