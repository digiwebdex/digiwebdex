import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LandingCTAProps {
  title: string;
  subtitle?: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  variant?: 'gradient' | 'solid' | 'glass';
}

export function LandingCTA({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  variant = 'gradient'
}: LandingCTAProps) {
  return (
    <section id="contact-cta" className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className={cn(
        "absolute inset-0",
        variant === 'gradient' && "bg-gradient-to-br from-primary via-primary/90 to-purple-600",
        variant === 'solid' && "bg-primary",
        variant === 'glass' && "bg-card/80 backdrop-blur-xl border-y border-border"
      )} />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Title */}
          <h2 className={cn(
            "text-3xl md:text-4xl lg:text-5xl font-bold mb-6",
            variant === 'glass' ? "text-foreground" : "text-white"
          )}>
            {title}
          </h2>
          
          {/* Subtitle */}
          {subtitle && (
            <p className={cn(
              "text-lg md:text-xl mb-10",
              variant === 'glass' ? "text-muted-foreground" : "text-white/80"
            )}>
              {subtitle}
            </p>
          )}
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={primaryCta.href}>
              <Button
                size="lg"
                className={cn(
                  "text-lg px-8 py-6 rounded-xl shadow-xl transition-all duration-300 hover:scale-105",
                  variant === 'glass' 
                    ? "bg-gradient-to-r from-primary to-purple-600 text-white"
                    : "bg-white text-primary hover:bg-white/90"
                )}
              >
                {primaryCta.label}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            {secondaryCta && (
              <Link to={secondaryCta.href}>
                <Button
                  size="lg"
                  variant="outline"
                  className={cn(
                    "text-lg px-8 py-6 rounded-xl transition-all duration-300",
                    variant === 'glass'
                      ? "border-border hover:bg-muted"
                      : "border-white/30 text-white hover:bg-white/10 bg-transparent"
                  )}
                >
                  <Phone className="mr-2 w-5 h-5" />
                  {secondaryCta.label}
                </Button>
              </Link>
            )}
          </div>
          
          {/* WhatsApp Quick Link */}
          <div className="mt-8">
            <a 
              href="https://wa.me/8801700000000" 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-2 text-sm font-medium transition-colors",
                variant === 'glass' ? "text-muted-foreground hover:text-primary" : "text-white/70 hover:text-white"
              )}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp এ সরাসরি কথা বলুন
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
