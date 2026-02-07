import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CTAButton {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
}

interface LandingHeroProps {
  headline: string;
  subheadline: string;
  ctaButtons: CTAButton[];
  backgroundVariant?: 'mesh' | 'gradient' | 'orbs';
}

export function LandingHero({ 
  headline, 
  subheadline, 
  ctaButtons,
  backgroundVariant = 'mesh'
}: LandingHeroProps) {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      {backgroundVariant === 'mesh' && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5" />
      )}
      {backgroundVariant === 'orbs' && (
        <>
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--muted)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="container-custom relative z-10 text-center py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4" />
          <span>Trusted by 500+ businesses</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground max-w-4xl mx-auto leading-tight mb-6 animate-fade-in">
          {headline}
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in">
          {subheadline}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
          {ctaButtons.map((cta, index) => (
            <Link key={index} to={cta.href}>
              <Button
                size="lg"
                className={cn(
                  "text-lg px-8 py-6 rounded-xl transition-all duration-300",
                  cta.variant === 'secondary' 
                    ? "bg-background border-2 border-primary/20 text-foreground hover:bg-primary/5 hover:border-primary/40"
                    : "bg-gradient-to-r from-primary to-purple-600 text-white hover:opacity-90 shadow-lg shadow-primary/25"
                )}
              >
                {cta.label}
                {cta.variant !== 'secondary' && <ArrowRight className="ml-2 w-5 h-5" />}
              </Button>
            </Link>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-muted-foreground animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span>99.9% Uptime</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span>24/7 Support</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span>Bangladesh Based</span>
          </div>
        </div>
      </div>
    </section>
  );
}
