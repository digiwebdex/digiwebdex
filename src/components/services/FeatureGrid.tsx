import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: string;
  bgColor?: string;
}

interface FeatureGridProps {
  badge?: string;
  title: string;
  subtitle?: string;
  features: Feature[];
  columns?: 3 | 4;
  variant?: 'default' | 'cards';
}

export function FeatureGrid({
  badge,
  title,
  subtitle,
  features,
  columns = 4,
  variant = 'default',
}: FeatureGridProps) {
  const gridCols = columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4';

  return (
    <section className="section-padding bg-background">
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

        {/* Features Grid */}
        <div className={`grid gap-6 sm:grid-cols-2 ${gridCols}`}>
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group p-6 rounded-2xl transition-all duration-300 animate-fade-in ${
                variant === 'cards'
                  ? 'glass-card border-transparent hover:border-primary/20 hover:shadow-lg'
                  : 'bg-card border border-transparent hover:border-primary/20 hover:shadow-lg'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Icon */}
              <div
                className={`h-14 w-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${
                  feature.bgColor || 'bg-primary/10'
                }`}
              >
                <feature.icon className={`h-7 w-7 ${feature.color || 'text-primary'}`} />
              </div>

              {/* Content */}
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
