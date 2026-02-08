import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle } from 'lucide-react';

export function AboutHero() {
  const { language } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  const content = {
    bn: {
      headline: 'Digiwebdex – আপনার ডিজিটাল গ্রোথ পার্টনার',
      subheadline: 'ডোমেইন, হোস্টিং, ওয়েবসাইট, সফটওয়্যার ও ডিজিটাল মার্কেটিং – সব এক জায়গায়।',
      ctaConsultation: 'ফ্রি কনসাল্টেশন নিন',
      ctaServices: 'আমাদের সেবাসমূহ দেখুন',
    },
    en: {
      headline: 'Digiwebdex – Your Digital Growth Partner',
      subheadline: 'Domain, Hosting, Website, Software & Digital Marketing – All in one place.',
      ctaConsultation: 'Get Free Consultation',
      ctaServices: 'View Our Services',
    },
  };

  const t = content[language];

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Decorative Circles */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {language === 'bn' ? 'বাংলাদেশের বিশ্বস্ত ডিজিটাল পার্টনার' : "Bangladesh's Trusted Digital Partner"}
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            {t.headline}
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            {t.subheadline}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gradient-button text-lg px-8 py-6">
              <Link to={`${basePath}/contact`}>
                <MessageCircle className="w-5 h-5 mr-2" />
                {t.ctaConsultation}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 group">
              <Link to={`${basePath}/pricing`}>
                {t.ctaServices}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
