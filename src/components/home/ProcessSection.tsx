import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { MessageCircle, FileSearch, Code2, Rocket, ArrowRight } from 'lucide-react';

export function ProcessSection() {
  const { language } = useLanguage();

  const steps = [
    {
      icon: MessageCircle,
      number: '01',
      title: language === 'bn' ? 'আলোচনা' : 'Discussion',
      description: language === 'bn'
        ? 'আপনার প্রয়োজন এবং লক্ষ্য বুঝতে বিনামূল্যে পরামর্শ'
        : 'Free consultation to understand your needs and goals',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FileSearch,
      number: '02',
      title: language === 'bn' ? 'প্ল্যানিং' : 'Planning',
      description: language === 'bn'
        ? 'বিস্তারিত রোডম্যাপ এবং প্রজেক্ট প্ল্যান তৈরি'
        : 'Create detailed roadmap and project plan',
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: Code2,
      number: '03',
      title: language === 'bn' ? 'ডেভেলপমেন্ট' : 'Development',
      description: language === 'bn'
        ? 'এক্সপার্ট টিম দিয়ে প্রজেক্ট ডেভেলপমেন্ট'
        : 'Project development with expert team',
      color: 'from-orange-500 to-amber-500',
    },
    {
      icon: Rocket,
      number: '04',
      title: language === 'bn' ? 'লঞ্চ' : 'Launch',
      description: language === 'bn'
        ? 'টেস্টিং এবং সফল ডেলিভারি নিশ্চিত করা'
        : 'Testing and ensuring successful delivery',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section className="section-padding relative overflow-visible">
      {/* Enhanced Background */}
      <div className="absolute inset-0 mesh-gradient opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.08)_0%,transparent_60%)]" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl animate-bounce-slow" />
      <div className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-accent/10 blur-3xl animate-bounce-slow" style={{ animationDelay: '1.5s' }} />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-premium text-primary text-sm font-semibold mb-6 animate-fade-in">
            <span>🔄</span>
            {language === 'bn' ? 'কাজের প্রক্রিয়া' : 'Work Process'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-slide-up">
            {language === 'bn' ? (
              <>আমরা কীভাবে <span className="gradient-text">কাজ করি</span></>
            ) : (
              <>How We <span className="gradient-text">Work</span></>
            )}
          </h2>
          <p className="text-lg text-muted-foreground animate-slide-up delay-100">
            {language === 'bn'
              ? 'আমাদের প্রমাণিত ৪ ধাপের প্রক্রিয়া দিয়ে আপনার প্রজেক্ট সফলভাবে সম্পন্ন করি'
              : 'We successfully complete your project with our proven 4-step process'}
          </p>
        </div>

        {/* Process Steps with enhanced visuals */}
        <div className="relative">
          {/* Connection Line - Desktop with gradient */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary/50 -translate-y-1/2 rounded-full opacity-30" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 pt-6">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="relative animate-slide-up"
                style={{ animationDelay: `${index * 150 + 200}ms` }}
              >
                {/* Arrow Between Steps - Desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-4 w-8 h-8 items-center justify-center z-10">
                    <ArrowRight className="w-5 h-5 text-primary/60" />
                  </div>
                )}

                <div className="group glass-premium p-8 text-center hover:border-primary/40 transition-all duration-500 h-full card-shine">
                  {/* Step Number with glow */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className={`inline-block px-5 py-1.5 rounded-full text-sm font-bold text-white bg-gradient-to-r ${step.color} shadow-xl`}>
                      {step.number}
                    </span>
                  </div>

                  {/* Icon with enhanced effects */}
                  <div className={`w-20 h-20 mx-auto mt-6 mb-6 rounded-2xl bg-gradient-to-br ${step.color} p-5 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:shadow-2xl`}>
                    <step.icon className="w-full h-full text-white drop-shadow-lg" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Message with enhanced styling */}
        <div className="mt-16 text-center animate-slide-up delay-700">
          <div className="inline-flex items-center gap-4 px-8 py-5 rounded-2xl glass-premium">
            <span className="text-3xl">⏱️</span>
            <div className="text-left">
              <p className="font-bold text-lg text-foreground">
                {language === 'bn' ? 'গড় ডেলিভারি সময়: ৭-১৪ দিন' : 'Average Delivery: 7-14 Days'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'bn' ? 'প্রজেক্টের জটিলতা অনুযায়ী' : 'Depending on project complexity'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
