import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { MessageSquare, FileSearch, Code, Rocket, Check } from 'lucide-react';

export function ProcessSection() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: MessageSquare,
      number: '01',
      title: t.process.consultation.title,
      description: t.process.consultation.description,
    },
    {
      icon: FileSearch,
      number: '02',
      title: t.process.planning.title,
      description: t.process.planning.description,
    },
    {
      icon: Code,
      number: '03',
      title: t.process.development.title,
      description: t.process.development.description,
    },
    {
      icon: Rocket,
      number: '04',
      title: t.process.launch.title,
      description: t.process.launch.description,
    },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t.process.badge}
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl">{t.process.title}</h2>
          <p className="mt-4 text-muted-foreground text-lg">{t.process.subtitle}</p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2" />

          <div className="grid gap-8 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center text-center animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Number Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {step.number}
                </div>

                {/* Icon Circle */}
                <div className="relative z-10 h-20 w-20 rounded-2xl bg-background border-2 border-primary/20 flex items-center justify-center mb-6 shadow-lg group hover:border-primary transition-colors duration-300">
                  <step.icon className="h-8 w-8 text-primary" />
                  
                  {/* Check mark for completed feel */}
                  <div className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
