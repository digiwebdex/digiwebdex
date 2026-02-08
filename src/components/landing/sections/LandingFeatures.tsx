import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface LandingFeaturesProps {
  title: string;
  subtitle?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
  variant?: 'cards' | 'minimal' | 'glass';
}

export function LandingFeatures({
  title,
  subtitle,
  features,
  columns = 3,
  variant = 'glass'
}: LandingFeaturesProps) {
  return (
    <section id="features" className="py-20 relative">
      <div className="container-custom">
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

        {/* Features Grid */}
        <div className={cn(
          "grid gap-6",
          columns === 2 && "md:grid-cols-2",
          columns === 3 && "md:grid-cols-2 lg:grid-cols-3",
          columns === 4 && "md:grid-cols-2 lg:grid-cols-4"
        )}>
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "group p-6 rounded-2xl transition-all duration-300",
                variant === 'glass' && "bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5",
                variant === 'cards' && "bg-card border border-border hover:border-primary/50 hover:-translate-y-1 shadow-sm hover:shadow-xl",
                variant === 'minimal' && "hover:bg-muted/50"
              )}
            >
              {/* Icon */}
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-colors",
                "bg-gradient-to-br from-primary/10 to-purple-500/10 group-hover:from-primary/20 group-hover:to-purple-500/20"
              )}>
                <feature.icon className="w-7 h-7 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
