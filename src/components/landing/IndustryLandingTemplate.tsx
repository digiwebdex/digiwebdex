import React from 'react';
import { Layout } from '@/components/layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { SchemaMarkup, MultiSchemaMarkup } from '@/components/seo/SchemaMarkup';
import { useLanguage } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, ArrowRight, Star, Phone, MessageCircle, LucideIcon } from 'lucide-react';
import { seoService } from '@/services/seo';

export interface IndustryFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface IndustryPainPoint {
  title: string;
  description: string;
}

export interface IndustrySolution {
  title: string;
  description: string;
}

export interface IndustryPricing {
  startingPrice: number;
  currency?: string;
  label: string;
  features: string[];
}

export interface IndustryFAQ {
  question: string;
  answer: string;
}

export interface IndustryCaseStudy {
  title: string;
  industry: string;
  result: string;
  link: string;
  image?: string;
}

export interface IndustryLandingData {
  slug: string;
  industry: string;
  heroHeadline: string;
  heroSubheadline: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  painPoints: IndustryPainPoint[];
  solution: {
    title: string;
    description: string;
  };
  features: IndustryFeature[];
  pricing: IndustryPricing;
  faqs: IndustryFAQ[];
  caseStudy?: IndustryCaseStudy;
  relatedServices: Array<{
    title: string;
    link: string;
    icon: LucideIcon;
  }>;
}

interface IndustryLandingTemplateProps {
  data: IndustryLandingData;
}

export function IndustryLandingTemplate({ data }: IndustryLandingTemplateProps) {
  const { language } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';
  const baseUrl = 'https://digiwebdex.com';
  const pageUrl = `${baseUrl}${basePath}/${data.slug}`;

  // Generate schemas
  const faqSchema = seoService.generateFAQSchema(data.faqs);
  const breadcrumbSchema = seoService.generateBreadcrumbSchema([
    { name: language === 'bn' ? 'হোম' : 'Home', url: baseUrl },
    { name: language === 'bn' ? 'সেবাসমূহ' : 'Services', url: `${baseUrl}${basePath}/services/web-development` },
    { name: data.industry, url: pageUrl }
  ]);
  const serviceSchema = seoService.generateServiceSchema({
    name: data.metaTitle,
    description: data.metaDescription,
    serviceType: 'Web Development',
    areaServed: 'Bangladesh'
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Layout>
      <SEOHead
        title={data.metaTitle}
        description={data.metaDescription}
        keywords={data.keywords}
        canonicalUrl={pageUrl}
      />
      <MultiSchemaMarkup schemas={[
        { schema: faqSchema, id: 'faq-schema' },
        { schema: breadcrumbSchema, id: 'breadcrumb-schema' },
        { schema: serviceSchema, id: 'service-schema' }
      ]} />

      {/* Breadcrumb */}
      <div className="bg-muted/30 py-3 border-b border-border/50">
        <div className="container-custom">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={basePath}>{language === 'bn' ? 'হোম' : 'Home'}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`${basePath}/services/web-development`}>
                    {language === 'bn' ? 'ওয়েব ডেভেলপমেন্ট' : 'Web Development'}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{data.industry}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0" style={{ background: 'var(--gradient-mesh)' }} />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              {data.industry}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {data.heroHeadline}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {data.heroSubheadline}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button size="lg" className="gradient-button text-lg px-8" asChild>
                <Link to={`${basePath}/contact`}>
                  {language === 'bn' ? 'ফ্রি কনসালটেশন নিন' : 'Get Free Consultation'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <a href="https://wa.me/8801674533303" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 w-5 h-5" />
                  WhatsApp
                </a>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>{language === 'bn' ? '১০০+ সফল প্রজেক্ট' : '100+ Successful Projects'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{language === 'bn' ? '৫.০ রেটিং' : '5.0 Rating'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>{language === 'bn' ? '২৪/৭ সাপোর্ট' : '24/7 Support'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-4">
              {language === 'bn' ? '❌ সমস্যা' : '❌ Challenges'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'bn' 
                ? `${data.industry} ওয়েবসাইটে সাধারণ সমস্যা`
                : `Common ${data.industry} Website Problems`}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {data.painPoints.map((point, index) => (
              <Card key={index} className="glass-card border-destructive/20 hover:border-destructive/40">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{point.title}</h3>
                  <p className="text-muted-foreground text-sm">{point.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              ✅ Digiwebdex {language === 'bn' ? 'সমাধান' : 'Solution'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{data.solution.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{data.solution.description}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.features.map((feature, index) => (
              <Card key={index} className="glass-card group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study Block */}
      {data.caseStudy && (
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container-custom">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                📊 {language === 'bn' ? 'সফলতার গল্প' : 'Success Story'}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold">
                {language === 'bn' ? 'আমাদের কাজ দেখুন' : 'See Our Work'}
              </h2>
            </div>

            <Card className="glass-card max-w-3xl mx-auto overflow-hidden">
              <CardContent className="p-0">
                <div className="md:flex">
                  {data.caseStudy.image && (
                    <div className="md:w-2/5">
                      <img 
                        src={data.caseStudy.image} 
                        alt={data.caseStudy.title}
                        className="w-full h-48 md:h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className={`p-8 ${data.caseStudy.image ? 'md:w-3/5' : 'w-full'}`}>
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">
                      {data.caseStudy.industry}
                    </span>
                    <h3 className="text-xl font-bold mt-2 mb-3">{data.caseStudy.title}</h3>
                    <p className="text-muted-foreground mb-6">{data.caseStudy.result}</p>
                    <Button variant="outline" asChild>
                      <Link to={data.caseStudy.link}>
                        {language === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Pricing Block */}
      <section className="py-16 md:py-20" id="pricing">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              💰 {language === 'bn' ? 'মূল্য' : 'Pricing'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'bn' ? 'সাশ্রয়ী মূল্যে প্রিমিয়াম সেবা' : 'Premium Service at Affordable Price'}
            </h2>
          </div>

          <Card className="glass-card max-w-xl mx-auto border-primary/30 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-accent p-4 text-center">
              <span className="text-white font-medium">
                {data.pricing.label}
              </span>
            </div>
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <span className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'শুরু হচ্ছে' : 'Starting from'}
                </span>
                <div className="text-5xl font-bold gradient-text mt-2">
                  {formatPrice(data.pricing.startingPrice)}
                </div>
              </div>

              <ul className="space-y-3 text-left mb-8">
                {data.pricing.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button size="lg" className="w-full gradient-button text-lg" asChild>
                <Link to={`${basePath}/contact`}>
                  {language === 'bn' ? 'কোটেশন নিন' : 'Get Quote'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-muted/30" id="faq">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              ❓ {language === 'bn' ? 'সাধারণ প্রশ্ন' : 'FAQ'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">
              {language === 'bn' ? 'সচরাচর জিজ্ঞাসা' : 'Frequently Asked Questions'}
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {data.faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="glass-card border-border/50 px-6 rounded-xl"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-12 bg-muted/30 border-t border-border/50">
        <div className="container-custom">
          <h2 className="text-xl font-bold text-center mb-8">
            {language === 'bn' ? 'সম্পর্কিত সেবা' : 'Related Services'}
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {data.relatedServices.map((service, index) => (
              <Link 
                key={index}
                to={service.link} 
                className="p-6 glass-card text-center group"
              >
                <service.icon className="w-10 h-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold">{service.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-accent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container-custom relative z-10 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'bn' 
              ? 'আজই আপনার প্রজেক্ট শুরু করুন'
              : 'Start Your Project Today'}
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            {language === 'bn'
              ? 'ফ্রি কনসালটেশনের জন্য এখনই যোগাযোগ করুন। আমরা ২৪ ঘণ্টার মধ্যে রেসপন্স করি।'
              : 'Contact us for a free consultation. We respond within 24 hours.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 bg-white text-primary hover:bg-white/90" asChild>
              <Link to={`${basePath}/contact`}>
                {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white/10" asChild>
              <Link to={`${basePath}/pricing`}>
                {language === 'bn' ? 'মূল্য দেখুন' : 'View Pricing'}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
