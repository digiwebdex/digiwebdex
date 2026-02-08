import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Building2, Cpu, Globe, Zap } from 'lucide-react';

export function AboutIntroduction() {
  const { language } = useLanguage();

  const content = {
    bn: {
      sectionTitle: 'আমাদের সম্পর্কে',
      title: 'Digiwebdex কে?',
      paragraphs: [
        'Digiwebdex হলো বাংলাদেশের একটি অগ্রণী ডিজিটাল সার্ভিস প্রোভাইডার যা ২০২০ সাল থেকে ব্যবসায়িক প্রতিষ্ঠানগুলোকে ডিজিটাল যুগে এগিয়ে নিতে সাহায্য করছে।',
        'আমরা একটি SaaS-ভিত্তিক অটোমেশন প্ল্যাটফর্ম পরিচালনা করি যেখানে ডোমেইন রেজিস্ট্রেশন, ওয়েব হোস্টিং, ওয়েবসাইট ডেভেলপমেন্ট, কাস্টম সফটওয়্যার এবং ডিজিটাল মার্কেটিং – সবকিছু একটি প্ল্যাটফর্মে পরিচালিত হয়।',
        'আমাদের লক্ষ্য হলো বাংলাদেশের ছোট-বড় সব ব্যবসাকে আন্তর্জাতিক মানের ডিজিটাল ইনফ্রাস্ট্রাকচার সুবিধা প্রদান করা।',
      ],
      features: [
        { icon: Globe, title: 'সম্পূর্ণ ডিজিটাল সলিউশন', description: 'এক জায়গায় সব সেবা' },
        { icon: Cpu, title: 'SaaS-ভিত্তিক প্ল্যাটফর্ম', description: 'অটোমেটেড সিস্টেম' },
        { icon: Building2, title: 'এন্টারপ্রাইজ গ্রেড', description: 'আন্তর্জাতিক মান' },
        { icon: Zap, title: 'দ্রুত ডেলিভারি', description: 'সময়মত সম্পন্ন' },
      ],
    },
    en: {
      sectionTitle: 'About Us',
      title: 'Who is Digiwebdex?',
      paragraphs: [
        'Digiwebdex is a leading digital service provider in Bangladesh that has been helping businesses advance in the digital age since 2020.',
        'We operate a SaaS-based automation platform where domain registration, web hosting, website development, custom software, and digital marketing - everything is managed on a single platform.',
        'Our goal is to provide international-standard digital infrastructure services to businesses of all sizes in Bangladesh.',
      ],
      features: [
        { icon: Globe, title: 'Complete Digital Solution', description: 'All services in one place' },
        { icon: Cpu, title: 'SaaS-based Platform', description: 'Automated system' },
        { icon: Building2, title: 'Enterprise Grade', description: 'International standards' },
        { icon: Zap, title: 'Fast Delivery', description: 'On-time completion' },
      ],
    },
  };

  const t = content[language];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              {t.sectionTitle}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {t.title}
            </h2>
            <div className="space-y-4">
              {t.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {t.features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-card rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
