import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Code, Smartphone, TrendingUp, PenTool, ArrowRight } from 'lucide-react';

const serviceIcons = {
  domainHosting: Globe,
  webDev: Code,
  softwareDev: Smartphone,
  digitalMarketing: TrendingUp,
  graphics: PenTool,
};

export function ServicesSection() {
  const { language, t } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  const services = [
    {
      key: 'domainHosting',
      icon: serviceIcons.domainHosting,
      title: t.services.domainHosting.title,
      description: t.services.domainHosting.description,
      price: language === 'bn' ? '৳৯৯' : '৳99',
      priceLabel: language === 'bn' ? '/মাস থেকে' : '/mo from',
      href: `${basePath}/services/domain-hosting`,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
    },
    {
      key: 'webDev',
      icon: serviceIcons.webDev,
      title: t.services.webDev.title,
      description: t.services.webDev.description,
      price: language === 'bn' ? '৳৫,০০০' : '৳5,000',
      priceLabel: language === 'bn' ? ' থেকে' : ' from',
      href: `${basePath}/services/web-development`,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
    },
    {
      key: 'softwareDev',
      icon: serviceIcons.softwareDev,
      title: t.services.softwareDev.title,
      description: t.services.softwareDev.description,
      price: language === 'bn' ? '৳২০,০০০' : '৳20,000',
      priceLabel: language === 'bn' ? ' থেকে' : ' from',
      href: `${basePath}/services/software-development`,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/10 to-red-500/10',
    },
    {
      key: 'digitalMarketing',
      icon: serviceIcons.digitalMarketing,
      title: t.services.digitalMarketing.title,
      description: t.services.digitalMarketing.description,
      price: language === 'bn' ? '৳৩,০০০' : '৳3,000',
      priceLabel: language === 'bn' ? '/মাস থেকে' : '/mo from',
      href: `${basePath}/services/digital-marketing`,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
    },
    {
      key: 'graphics',
      icon: serviceIcons.graphics,
      title: t.services.graphics.title,
      description: t.services.graphics.description,
      price: language === 'bn' ? '৳৫০০' : '৳500',
      priceLabel: language === 'bn' ? ' থেকে' : ' from',
      href: `${basePath}/services/graphics-design`,
      gradient: 'from-pink-500 to-rose-500',
      bgGradient: 'from-pink-500/10 to-rose-500/10',
    },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t.services.badge}
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">{t.services.title}</h2>
          <p className="mt-4 text-muted-foreground text-lg">{t.services.subtitle}</p>
        </div>

        {/* Services Grid - 5 items */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {services.map((service, index) => (
            <Card
              key={service.key}
              className={`group glass-card border-transparent hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl overflow-hidden`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <CardContent className="relative p-6 flex flex-col h-full">
                {/* Icon */}
                <div
                  className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}
                >
                  <service.icon className="h-7 w-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 flex-grow line-clamp-2">{service.description}</p>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-2xl font-bold text-primary">{service.price}</span>
                  <span className="text-sm text-muted-foreground">{service.priceLabel}</span>
                </div>

                {/* Link */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between p-0 h-auto text-primary hover:text-primary/80 hover:bg-transparent group/btn"
                  asChild
                >
                  <Link to={service.href}>
                    {t.services.learnMore}
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
