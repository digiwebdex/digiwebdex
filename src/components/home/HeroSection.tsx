import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Play } from 'lucide-react';
import { DomainSearchBox } from './DomainSearchBox';

export function HeroSection() {
  const { language, t } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center" style={{ background: 'var(--gradient-hero)' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-float" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-accent/15 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-primary/10 blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.4)_70%)]" />
      </div>

      <div className="container-custom relative z-10">
        <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
          {/* Badge */}
          <div className="animate-fade-in mb-8 inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>{t.hero.badge}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          </div>

          {/* Main Headline */}
          <h1 className="animate-slide-up text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-5xl leading-tight">
            {t.hero.title}{' '}
            <span className="relative">
              <span className="gradient-text">{t.hero.titleHighlight}</span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="animate-slide-up delay-100 mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl md:text-2xl leading-relaxed">
            {t.hero.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="animate-slide-up delay-200 mt-10 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="gradient-button h-14 px-10 text-lg shadow-lg shadow-primary/25" asChild>
              <Link to={`${basePath}/pricing`}>
                {t.hero.cta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg bg-background/80 backdrop-blur-sm" asChild>
              <Link to={`${basePath}/contact`}>
                <Play className="mr-2 h-5 w-5" />
                {t.hero.ctaSecondary}
              </Link>
            </Button>
          </div>

          {/* Domain Search Box */}
          <div className="animate-slide-up delay-300 mt-16 w-full max-w-2xl">
            <p className="text-sm text-muted-foreground mb-4">{t.domainSearch.title}</p>
            <DomainSearchBox />
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0,64 C480,120 960,0 1440,64 L1440,120 L0,120 Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
}
