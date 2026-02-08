import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Globe, Code, Cpu, TrendingUp, ArrowRight } from 'lucide-react';

export function AboutServices() {
  const { language } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  const content = {
    bn: {
      sectionTitle: 'আমাদের সেবাসমূহ',
      title: 'আমরা যা অফার করি',
      subtitle: 'আপনার ব্যবসার জন্য সম্পূর্ণ ডিজিটাল সলিউশন',
      services: [
        {
          icon: Globe,
          title: 'ডোমেইন ও হোস্টিং',
          description: 'দ্রুত, নিরাপদ এবং নির্ভরযোগ্য ওয়েব হোস্টিং সেবা। ৯৯.৯% আপটাইম গ্যারান্টি সহ প্রিমিয়াম হোস্টিং।',
          link: '/services/domain-hosting',
        },
        {
          icon: Code,
          title: 'ওয়েবসাইট ডেভেলপমেন্ট',
          description: 'আধুনিক, রেস্পন্সিভ এবং এসইও-অপ্টিমাইজড ওয়েবসাইট তৈরি। কর্পোরেট থেকে ই-কমার্স সব ধরনের ওয়েবসাইট।',
          link: '/services/web-development',
        },
        {
          icon: Cpu,
          title: 'কাস্টম সফটওয়্যার / ERP',
          description: 'আপনার ব্যবসার প্রয়োজন অনুযায়ী কাস্টম সফটওয়্যার সলিউশন। POS, HRM, Inventory এবং ERP সিস্টেম।',
          link: '/services/software-development',
        },
        {
          icon: TrendingUp,
          title: 'ডিজিটাল মার্কেটিং',
          description: 'এসইও, সোশ্যাল মিডিয়া মার্কেটিং, গুগল অ্যাডস এবং ফেসবুক মার্কেটিং সেবা।',
          link: '/services/digital-marketing',
        },
      ],
      viewDetails: 'বিস্তারিত দেখুন',
    },
    en: {
      sectionTitle: 'Our Services',
      title: 'What We Offer',
      subtitle: 'Complete digital solutions for your business',
      services: [
        {
          icon: Globe,
          title: 'Domain & Hosting',
          description: 'Fast, secure, and reliable web hosting services. Premium hosting with 99.9% uptime guarantee.',
          link: '/services/domain-hosting',
        },
        {
          icon: Code,
          title: 'Website Development',
          description: 'Modern, responsive, and SEO-optimized website development. Corporate to e-commerce, all types of websites.',
          link: '/services/web-development',
        },
        {
          icon: Cpu,
          title: 'Custom Software / ERP',
          description: 'Custom software solutions tailored to your business needs. POS, HRM, Inventory, and ERP systems.',
          link: '/services/software-development',
        },
        {
          icon: TrendingUp,
          title: 'Digital Marketing',
          description: 'SEO, social media marketing, Google Ads, and Facebook marketing services.',
          link: '/services/digital-marketing',
        },
      ],
      viewDetails: 'View Details',
    },
  };

  const t = content[language];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t.sectionTitle}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {t.services.map((service, index) => (
            <div
              key={index}
              className="p-8 bg-card rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-start gap-6">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <service.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{service.description}</p>
                  <Button asChild variant="link" className="p-0 h-auto text-primary group/btn">
                    <Link to={`${basePath}${service.link}`}>
                      {t.viewDetails}
                      <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
