import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Zap, Shield, Clock, HeadphonesIcon, Code2, TrendingUp } from 'lucide-react';

export function WhyChooseUsSection() {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: Zap,
      title: t.whyUs.automation.title,
      description: t.whyUs.automation.description,
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Shield,
      title: t.whyUs.security.title,
      description: t.whyUs.security.description,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Clock,
      title: t.whyUs.fast.title,
      description: t.whyUs.fast.description,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: HeadphonesIcon,
      title: t.whyUs.support.title,
      description: t.whyUs.support.description,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Code2,
      title: t.whyUs.quality.title,
      description: t.whyUs.quality.description,
      gradient: 'from-teal-500 to-cyan-500',
    },
    {
      icon: TrendingUp,
      title: t.whyUs.scalable.title,
      description: t.whyUs.scalable.description,
      gradient: 'from-red-500 to-rose-500',
    },
  ];

  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t.whyUs.badge}
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl">{t.whyUs.title}</h2>
          <p className="mt-4 text-muted-foreground text-lg">{t.whyUs.subtitle}</p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group glass-card p-6 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`h-12 w-12 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
                >
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-semibold text-lg mb-1">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
