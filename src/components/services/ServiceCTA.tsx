import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, MessageCircle } from 'lucide-react';

interface ServiceCTAProps {
  title: string;
  subtitle: string;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
    isPhone?: boolean;
  };
}

export function ServiceCTA({ title, subtitle, primaryCta, secondaryCta }: ServiceCTAProps) {
  const { language } = useLanguage();

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <div className="relative overflow-hidden rounded-3xl p-10 sm:p-14 lg:p-20" style={{ background: 'var(--gradient-primary)' }}>
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          </div>

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Content */}
            <div className="text-center lg:text-left text-white max-w-2xl">
              <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl leading-tight">
                {title}
              </h2>
              <p className="mt-4 text-lg opacity-90 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 min-w-[280px]">
              <Button
                size="lg"
                className="h-14 px-8 bg-white text-primary hover:bg-white/90 font-bold text-lg shadow-xl"
                asChild
              >
                <Link to={primaryCta.href}>
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {primaryCta.text}
                </Link>
              </Button>
              {secondaryCta && (
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-semibold text-lg"
                  asChild
                >
                  {secondaryCta.isPhone ? (
                    <a href={secondaryCta.href}>
                      <Phone className="mr-2 h-5 w-5" />
                      {secondaryCta.text}
                    </a>
                  ) : (
                    <Link to={secondaryCta.href}>
                      <ArrowRight className="mr-2 h-5 w-5" />
                      {secondaryCta.text}
                    </Link>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
