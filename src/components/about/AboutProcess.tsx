import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { ClipboardList, PenTool, Code, TestTube, Rocket, Headphones } from 'lucide-react';

export function AboutProcess() {
  const { language } = useLanguage();

  const content = {
    bn: {
      sectionTitle: 'আমাদের কাজের প্রক্রিয়া',
      title: 'আমরা কিভাবে কাজ করি',
      subtitle: 'একটি সুসংগঠিত প্রক্রিয়ায় আপনার প্রজেক্ট সম্পন্ন করি',
      steps: [
        {
          step: 1,
          icon: ClipboardList,
          title: 'রিকোয়ারমেন্ট অ্যানালাইসিস',
          description: 'আপনার প্রয়োজন বুঝে সঠিক সলিউশন প্রস্তাব করি',
        },
        {
          step: 2,
          icon: PenTool,
          title: 'পরিকল্পনা',
          description: 'বিস্তারিত রোডম্যাপ এবং টাইমলাইন তৈরি করি',
        },
        {
          step: 3,
          icon: Code,
          title: 'ডেভেলপমেন্ট',
          description: 'দক্ষ টিম দ্বারা প্রজেক্ট নির্মাণ শুরু হয়',
        },
        {
          step: 4,
          icon: TestTube,
          title: 'টেস্টিং',
          description: 'সম্পূর্ণ QA এবং বাগ ফিক্সিং সম্পন্ন করি',
        },
        {
          step: 5,
          icon: Rocket,
          title: 'লঞ্চ',
          description: 'প্রজেক্ট লাইভ করা হয় সফলভাবে',
        },
        {
          step: 6,
          icon: Headphones,
          title: 'সাপোর্ট',
          description: 'লঞ্চের পরেও নিরবচ্ছিন্ন সাপোর্ট প্রদান',
        },
      ],
    },
    en: {
      sectionTitle: 'Our Work Process',
      title: 'How We Work',
      subtitle: 'Complete your project through an organized process',
      steps: [
        {
          step: 1,
          icon: ClipboardList,
          title: 'Requirement Analysis',
          description: 'Understanding your needs and proposing the right solution',
        },
        {
          step: 2,
          icon: PenTool,
          title: 'Planning',
          description: 'Creating detailed roadmap and timeline',
        },
        {
          step: 3,
          icon: Code,
          title: 'Development',
          description: 'Project construction begins by skilled team',
        },
        {
          step: 4,
          icon: TestTube,
          title: 'Testing',
          description: 'Complete QA and bug fixing is done',
        },
        {
          step: 5,
          icon: Rocket,
          title: 'Launch',
          description: 'Project goes live successfully',
        },
        {
          step: 6,
          icon: Headphones,
          title: 'Support',
          description: 'Continuous support after launch',
        },
      ],
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

        {/* Process Steps */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-[8%] right-[8%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-primary/30 z-10">
                  {step.step}
                </div>

                {/* Card */}
                <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 pt-10 text-center hover:border-primary/30 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-2">
                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
