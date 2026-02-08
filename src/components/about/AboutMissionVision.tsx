import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Target, Eye, Rocket } from 'lucide-react';

export function AboutMissionVision() {
  const { language } = useLanguage();

  const content = {
    bn: {
      sectionTitle: 'আমাদের লক্ষ্য ও উদ্দেশ্য',
      mission: {
        title: 'আমাদের মিশন',
        description: 'বাংলাদেশের প্রতিটি ব্যবসাকে সাশ্রয়ী মূল্যে প্রিমিয়াম মানের ডিজিটাল সেবা প্রদান করা এবং তাদের অনলাইন উপস্থিতি শক্তিশালী করতে সাহায্য করা।',
      },
      vision: {
        title: 'আমাদের ভিশন',
        description: 'বাংলাদেশের সর্বাধিক বিশ্বস্ত এবং নির্ভরযোগ্য ডিজিটাল সার্ভিস প্ল্যাটফর্ম হিসেবে নিজেদের প্রতিষ্ঠিত করা এবং দক্ষিণ এশিয়ায় সম্প্রসারিত হওয়া।',
      },
      goal: {
        title: 'দীর্ঘমেয়াদী লক্ষ্য',
        description: 'ডিজিটাল অটোমেশনের মাধ্যমে ব্যবসায়িক প্রক্রিয়াগুলোকে সহজতর করা এবং ২০৩০ সালের মধ্যে ১০,০০০+ ব্যবসাকে ডিজিটাল রূপান্তরে সাহায্য করা।',
      },
    },
    en: {
      sectionTitle: 'Our Goals & Objectives',
      mission: {
        title: 'Our Mission',
        description: 'To provide premium quality digital services at affordable prices to every business in Bangladesh and help them strengthen their online presence.',
      },
      vision: {
        title: 'Our Vision',
        description: 'To establish ourselves as the most trusted and reliable digital service platform in Bangladesh and expand across South Asia.',
      },
      goal: {
        title: 'Long-term Goal',
        description: 'To simplify business processes through digital automation and help 10,000+ businesses in digital transformation by 2030.',
      },
    },
  };

  const t = content[language];

  const cards = [
    { icon: Target, color: 'from-blue-500 to-cyan-500', ...t.mission },
    { icon: Eye, color: 'from-purple-500 to-pink-500', ...t.vision },
    { icon: Rocket, color: 'from-orange-500 to-red-500', ...t.goal },
  ];

  return (
    <section className="py-20">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t.sectionTitle}
          </span>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className="relative p-8 bg-card rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group overflow-hidden"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6 shadow-lg`}>
                <card.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-4">{card.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
