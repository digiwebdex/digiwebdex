import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { CheckCircle2, Award, Users, Shield, Headphones, Clock } from 'lucide-react';

export function AboutWhyChoose() {
  const { language } = useLanguage();

  const content = {
    bn: {
      sectionTitle: 'কেন আমাদের বেছে নেবেন?',
      title: 'আমাদের বিশেষত্ব',
      subtitle: 'আমরা শুধু সেবা প্রদান করি না, আমরা আপনার সাফল্যের অংশীদার হই',
      points: [
        { icon: Award, text: '৫০০+ সফল প্রজেক্ট সম্পন্ন' },
        { icon: Users, text: '১০০+ সন্তুষ্ট ক্লায়েন্ট' },
        { icon: CheckCircle2, text: 'সম্পূর্ণ অটোমেটেড সিস্টেম' },
        { icon: Shield, text: 'সুরক্ষিত পেমেন্ট গেটওয়ে' },
        { icon: Headphones, text: '২৪/৭ ডেডিকেটেড সাপোর্ট' },
        { icon: Clock, text: 'সময়মত ডেলিভারি গ্যারান্টি' },
      ],
      stats: [
        { value: '৫০০+', label: 'প্রজেক্ট' },
        { value: '১০০+', label: 'ক্লায়েন্ট' },
        { value: '৯৯.৯%', label: 'আপটাইম' },
        { value: '২৪/৭', label: 'সাপোর্ট' },
      ],
    },
    en: {
      sectionTitle: 'Why Choose Us?',
      title: 'Our Specialties',
      subtitle: "We don't just provide services, we become partners in your success",
      points: [
        { icon: Award, text: '500+ Successful Projects Completed' },
        { icon: Users, text: '100+ Happy Clients' },
        { icon: CheckCircle2, text: 'Fully Automated System' },
        { icon: Shield, text: 'Secure Payment Gateway' },
        { icon: Headphones, text: '24/7 Dedicated Support' },
        { icon: Clock, text: 'On-time Delivery Guarantee' },
      ],
      stats: [
        { value: '500+', label: 'Projects' },
        { value: '100+', label: 'Clients' },
        { value: '99.9%', label: 'Uptime' },
        { value: '24/7', label: 'Support' },
      ],
    },
  };

  const t = content[language];

  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              {t.sectionTitle}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t.title}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t.subtitle}
            </p>

            {/* Points Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {t.points.map((point, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <point.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{point.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Stats */}
          <div className="grid grid-cols-2 gap-6">
            {t.stats.map((stat, index) => (
              <div
                key={index}
                className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-border/50 text-center hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
