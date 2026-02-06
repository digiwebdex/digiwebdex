import React from 'react';
import { LucideIcon, Check } from 'lucide-react';

interface ProcessStep {
  icon: LucideIcon;
  number: string;
  title: string;
  description: string;
}

interface ProcessTimelineProps {
  badge?: string;
  title: string;
  subtitle?: string;
  steps: ProcessStep[];
}

export function ProcessTimeline({ badge, title, subtitle, steps }: ProcessTimelineProps) {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
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

        {/* Timeline */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

          <div className={`grid gap-8 lg:grid-cols-${Math.min(steps.length, 4)}`}>
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center text-center animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Number Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-primary-foreground bg-primary px-3 py-1 rounded-full z-10">
                  {step.number}
                </div>

                {/* Icon Circle */}
                <div className="relative z-10 h-24 w-24 rounded-2xl bg-card border-2 border-primary/20 flex items-center justify-center mb-6 shadow-lg group hover:border-primary hover:shadow-xl transition-all duration-300">
                  <step.icon className="h-10 w-10 text-primary" />
                  
                  {/* Check mark */}
                  <div className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
