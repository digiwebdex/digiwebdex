import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';

interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
  href: string;
  ctaText: string;
}

interface PricingSectionProps {
  badge?: string;
  title: string;
  subtitle?: string;
  plans: PricingPlan[];
}

export function PricingSection({ badge, title, subtitle, plans }: PricingSectionProps) {
  const { language } = useLanguage();

  return (
    <section className="section-padding bg-background" id="pricing">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          {badge && (
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              {badge}
            </span>
          )}
          <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
          {subtitle && (
            <p className="mt-4 text-muted-foreground text-lg">{subtitle}</p>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-2 ${
                plan.popular
                  ? 'border-primary shadow-xl shadow-primary/10 scale-105'
                  : 'glass-card border-transparent hover:border-primary/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    <Star className="h-3 w-3 fill-current" />
                    {language === 'bn' ? 'জনপ্রিয়' : 'Popular'}
                  </span>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div>
                  <span className="text-4xl font-extrabold gradient-text">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={`w-full h-12 ${plan.popular ? 'gradient-button' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link to={plan.href}>{plan.ctaText}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
