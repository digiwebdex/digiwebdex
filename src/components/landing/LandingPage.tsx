import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { SchemaMarkup, MultiSchemaMarkup } from '@/components/seo/SchemaMarkup';
import { seoService } from '@/services/seo';
import { useLanguage } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';

interface LandingPage {
  id: string;
  slug: string;
  page_type: string;
  title_bn: string;
  title_en: string;
  meta_title_bn: string | null;
  meta_title_en: string | null;
  meta_description_bn: string | null;
  meta_description_en: string | null;
  h1_bn: string | null;
  h1_en: string | null;
  content_bn: string | null;
  content_en: string | null;
  hero_image_url: string | null;
  location: string | null;
  service_type: string | null;
  keywords: string[] | null;
  schema_markup: Record<string, unknown> | null;
  faq_items: Array<{ question: string; answer: string }> | null;
  internal_links: Array<{ title: string; url: string }> | null;
  og_image: string | null;
  canonical_url: string | null;
}

export function LandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);

  const basePath = language === 'en' ? '/en' : '/bn';
  const baseUrl = 'https://digiwebdex.com';

  useEffect(() => {
    async function fetchPage() {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await seoService.getLandingPage(slug);
        setPage(data as LandingPage | null);
        
        if (data) {
          seoService.trackPageView('landing_pages', (data as LandingPage).id);
        }
      } catch (error) {
        console.error('Failed to fetch landing page:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-12">
          <Skeleton className="h-[400px] w-full mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!page) {
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {language === 'bn' ? 'পেজ পাওয়া যায়নি' : 'Page not found'}
          </h1>
          <Link to={basePath}>
            <Button>{language === 'bn' ? 'হোমে ফিরে যান' : 'Go Home'}</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const title = language === 'bn' ? page.title_bn : page.title_en;
  const h1 = language === 'bn' ? page.h1_bn : page.h1_en;
  const content = language === 'bn' ? page.content_bn : page.content_en;
  const metaTitle = language === 'bn' ? page.meta_title_bn : page.meta_title_en;
  const metaDescription = language === 'bn' ? page.meta_description_bn : page.meta_description_en;

  const pageUrl = `${baseUrl}${basePath}/${page.slug}`;

  // Generate schemas
  const schemas: Array<{ schema: Record<string, unknown>; id: string }> = [];

  // Add service schema if applicable
  if (page.service_type) {
    const serviceSchema = seoService.generateServiceSchema({
      name: title,
      description: metaDescription || '',
      serviceType: page.service_type,
      areaServed: page.location || 'Bangladesh'
    });
    schemas.push({ schema: serviceSchema, id: 'service-schema' });
  }

  // Add FAQ schema if present
  if (page.faq_items && page.faq_items.length > 0) {
    const faqSchema = seoService.generateFAQSchema(page.faq_items);
    schemas.push({ schema: faqSchema, id: 'faq-schema' });
  }

  // Add custom schema if present
  if (page.schema_markup) {
    schemas.push({ schema: page.schema_markup, id: 'custom-schema' });
  }

  // Add breadcrumb
  const breadcrumbSchema = seoService.generateBreadcrumbSchema([
    { name: language === 'bn' ? 'হোম' : 'Home', url: baseUrl },
    { name: title, url: pageUrl }
  ]);
  schemas.push({ schema: breadcrumbSchema, id: 'breadcrumb-schema' });

  return (
    <Layout>
      <SEOHead
        title={metaTitle || title}
        description={metaDescription || ''}
        keywords={page.keywords || []}
        ogImage={page.og_image || page.hero_image_url || undefined}
        canonicalUrl={page.canonical_url || pageUrl}
      />
      <MultiSchemaMarkup schemas={schemas} />

      {/* Hero Section */}
      {page.hero_image_url && (
        <section className="relative h-[400px] md:h-[500px] bg-muted">
          <img 
            src={page.hero_image_url} 
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 container-custom">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              {h1 || title}
            </h1>
          </div>
        </section>
      )}

      <div className="container-custom py-12">
        {/* Title if no hero */}
        {!page.hero_image_url && (
          <h1 className="text-3xl md:text-5xl font-bold mb-8">
            {h1 || title}
          </h1>
        )}

        {/* Main Content */}
        {content && (
          <div 
            className="prose prose-lg dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}

        {/* FAQ Section */}
        {page.faq_items && page.faq_items.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              {language === 'bn' ? 'সচরাচর জিজ্ঞাসা' : 'Frequently Asked Questions'}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {page.faq_items.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {/* Internal Links */}
        {page.internal_links && page.internal_links.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              {language === 'bn' ? 'সম্পর্কিত পেজ' : 'Related Pages'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {page.internal_links.map((link, index) => (
                <Link key={index} to={link.url}>
                  <div className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    {link.title}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-muted rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {language === 'bn' ? 'আজই শুরু করুন' : 'Get Started Today'}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {language === 'bn' 
              ? 'আমাদের সাথে যোগাযোগ করুন এবং আপনার প্রজেক্ট নিয়ে আলোচনা করুন।'
              : 'Contact us and discuss your project with our team.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={`${basePath}/contact`}>
              <Button size="lg" className="gradient-button">
                {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
              </Button>
            </Link>
            <Link to={`${basePath}/pricing`}>
              <Button size="lg" variant="outline">
                {language === 'bn' ? 'মূল্য দেখুন' : 'View Pricing'}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
