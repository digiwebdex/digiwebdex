import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

interface ServiceHeroProps {
  badge: string;
  headline: string;
  subtext: string;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  stats?: Array<{
    value: string;
    label: string;
  }>;
  children?: React.ReactNode;
}

export function ServiceHero({
  badge,
  headline,
  subtext,
  primaryCta,
  secondaryCta,
  stats,
  children,
}: ServiceHeroProps) {
  return (
    <section className="relative overflow-hidden py-20 md:py-28" style={{ background: 'var(--gradient-hero)' }}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/20 to-accent/10 blur-3xl" />
        <div className="absolute top-1/2 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-accent/15 to-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-muted-foreground shadow-sm">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>{badge}</span>
          </div>

          {/* Headline */}
          <h1 className="animate-slide-up text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
            {headline}
          </h1>

          {/* Subtext */}
          <p className="animate-slide-up delay-100 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto mb-10">
            {subtext}
          </p>

          {/* CTAs */}
          <div className="animate-slide-up delay-200 flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="gradient-button h-14 px-10 text-lg shadow-lg shadow-primary/25" asChild>
              <Link to={primaryCta.href}>
                {primaryCta.text}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            {secondaryCta && (
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg bg-background/80 backdrop-blur-sm" asChild>
                <Link to={secondaryCta.href}>
                  <Play className="mr-2 h-5 w-5" />
                  {secondaryCta.text}
                </Link>
              </Button>
            )}
          </div>

          {/* Stats */}
          {stats && stats.length > 0 && (
            <div className="animate-slide-up delay-300 flex flex-wrap justify-center gap-8 md:gap-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Additional content (like search box) */}
          {children && (
            <div className="animate-slide-up delay-400 mt-12">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
