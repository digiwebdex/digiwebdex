import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, MessageCircle } from 'lucide-react';

export function CTASection() {
  const { language, t } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <div className="relative overflow-hidden rounded-3xl p-10 sm:p-14 lg:p-20" style={{ background: 'var(--gradient-primary)' }}>
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          </div>

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Content */}
            <div className="text-center lg:text-left text-white max-w-2xl">
              <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl leading-tight">
                {t.cta.title}
              </h2>
              <p className="mt-4 text-lg opacity-90 leading-relaxed">
                {t.cta.subtitle}
              </p>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-6 text-sm opacity-80">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  {language === 'bn' ? 'ফ্রি কনসালটেশন' : 'Free Consultation'}
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  {language === 'bn' ? '২৪/৭ সাপোর্ট' : '24/7 Support'}
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  {language === 'bn' ? '১০০% সন্তুষ্টি' : '100% Satisfaction'}
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="h-14 px-8 bg-white text-primary hover:bg-white/90 font-bold text-lg shadow-xl"
                asChild
              >
                <Link to={`${basePath}/contact`}>
                  {t.cta.button}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-semibold text-lg"
                asChild
              >
                <a href="tel:+8801XXXXXXXXX">
                  <Phone className="mr-2 h-5 w-5" />
                  {language === 'bn' ? 'কল করুন' : 'Call Now'}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
