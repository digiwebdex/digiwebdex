import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Star, TrendingUp, Users, FolderCheck, Clock } from 'lucide-react';

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  suffix: string;
  label: string;
  color: string;
  delay: number;
}

function AnimatedStatItem({ icon: Icon, value, suffix, label, color, delay }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <div
      ref={ref}
      className="group animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col items-center text-center p-6 md:p-8 rounded-3xl glass-premium hover:border-primary/40 transition-all duration-500 hover-lift">
        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${color} p-3 md:p-3.5 mb-4 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          <Icon className="w-full h-full text-white drop-shadow-lg" />
        </div>
        <div className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-2 tracking-tight">
          {count}
          <span className="gradient-text">{suffix}</span>
        </div>
        <p className="text-xs md:text-sm font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function SocialProofSection() {
  const { language } = useLanguage();

  const stats = [
    {
      icon: FolderCheck,
      value: 500,
      suffix: '+',
      label: language === 'bn' ? 'সম্পন্ন প্রজেক্ট' : 'Projects Completed',
      color: 'from-primary to-primary/70',
    },
    {
      icon: Users,
      value: 200,
      suffix: '+',
      label: language === 'bn' ? 'সন্তুষ্ট ক্লায়েন্ট' : 'Happy Clients',
      color: 'from-secondary to-accent',
    },
    {
      icon: Clock,
      value: 99,
      suffix: '.9%',
      label: language === 'bn' ? 'আপটাইম গ্যারান্টি' : 'Uptime Guarantee',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      value: 10,
      suffix: '+',
      label: language === 'bn' ? 'বছরের অভিজ্ঞতা' : 'Years Experience',
      color: 'from-accent to-secondary',
    },
  ];

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      {/* Glowing orbs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-accent/10 blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
      
      <div className="container-custom relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-12">
          {stats.map((stat, index) => (
            <AnimatedStatItem
              key={index}
              icon={stat.icon}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              color={stat.color}
              delay={index * 100}
            />
          ))}
        </div>

        {/* 5-Star Rating Block */}
        <div className="flex flex-col items-center text-center animate-slide-up delay-500">
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-lg font-semibold text-foreground mb-1">
            {language === 'bn' ? '৪.৯/৫ গ্রাহক রেটিং' : '4.9/5 Customer Rating'}
          </p>
          <p className="text-sm text-muted-foreground">
            {language === 'bn' 
              ? '২০০+ ক্লায়েন্টদের পর্যালোচনার ভিত্তিতে'
              : 'Based on 200+ client reviews'}
          </p>
        </div>
      </div>
    </section>
  );
}
