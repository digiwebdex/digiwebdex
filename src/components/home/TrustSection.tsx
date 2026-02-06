import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Users, FolderCheck, Clock, Shield } from 'lucide-react';

export function TrustSection() {
  const { t } = useLanguage();

  const stats = [
    {
      icon: Users,
      value: '500+',
      label: t.trust.clients,
      suffix: '',
    },
    {
      icon: FolderCheck,
      value: '1000+',
      label: t.trust.projects,
      suffix: '',
    },
    {
      icon: Clock,
      value: '99.9',
      label: t.trust.uptime,
      suffix: '%',
    },
    {
      icon: Shield,
      value: '10+',
      label: t.trust.experience,
      suffix: '',
    },
  ];

  return (
    <section className="py-12 bg-secondary/30">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                {stat.value}
                <span className="text-primary">{stat.suffix}</span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
