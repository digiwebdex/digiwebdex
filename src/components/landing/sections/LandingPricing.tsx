import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  isPopular?: boolean;
}

interface LandingPricingProps {
  title: string;
  subtitle?: string;
  plans: PricingPlan[];
}

export function LandingPricing({ title, subtitle, plans }: LandingPricingProps) {
  return (
    <section className="py-20 relative bg-muted/30">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container-custom relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "relative rounded-2xl p-8 transition-all duration-300",
                plan.isPopular 
                  ? "bg-gradient-to-br from-primary/10 to-purple-500/10 border-2 border-primary/50 shadow-xl shadow-primary/10 scale-105"
                  : "bg-card border border-border hover:border-primary/30 hover:shadow-lg"
              )}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-purple-600 text-white text-sm font-medium rounded-full flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  <span>Most Popular</span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {plan.name}
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground ml-1">/{plan.period}</span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link to={plan.ctaHref} className="block">
                <Button
                  className={cn(
                    "w-full py-6 rounded-xl text-lg transition-all",
                    plan.isPopular
                      ? "bg-gradient-to-r from-primary to-purple-600 text-white hover:opacity-90 shadow-lg shadow-primary/25"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  {plan.ctaLabel}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
