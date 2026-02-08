import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowRight, Gift, Clock, Shield, Zap } from 'lucide-react';

export function UrgencyBanner() {
  const { language } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';
  
  // Countdown timer (resets daily for persistent urgency)
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const offers = [
    {
      icon: Shield,
      text: language === 'bn' ? 'ফ্রি SSL সার্টিফিকেট' : 'Free SSL Certificate',
    },
    {
      icon: Gift,
      text: language === 'bn' ? 'ফ্রি ডোমেইন ট্রান্সফার' : 'Free Domain Transfer',
    },
    {
      icon: Zap,
      text: language === 'bn' ? '২৪/৭ প্রিমিয়াম সাপোর্ট' : '24/7 Premium Support',
    },
  ];

  return (
    <section className="py-12 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 animate-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.15)_0%,transparent_70%)]" />
      
      <div className="container-custom relative z-10">
        <div className="glass-premium p-8 md:p-10 rounded-3xl border-primary/30">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left - Offer Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-semibold mb-4 animate-pulse">
                <Gift className="w-4 h-4" />
                {language === 'bn' ? 'সীমিত সময়ের অফার' : 'Limited Time Offer'}
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {language === 'bn' 
                  ? '🔥 হোস্টিং এর সাথে ফ্রি SSL ও ডোমেইন!'
                  : '🔥 Free SSL & Domain with Hosting!'}
              </h3>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-4">
                {offers.map((offer, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <offer.icon className="w-4 h-4 text-primary" />
                    <span>{offer.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Countdown & CTA */}
            <div className="flex flex-col items-center gap-5">
              {/* Countdown */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="w-4 h-4" />
                <span>{language === 'bn' ? 'অফার শেষ হবে:' : 'Offer ends in:'}</span>
              </div>
              
              <div className="flex items-center gap-3">
                {[
                  { value: timeLeft.hours, label: language === 'bn' ? 'ঘণ্টা' : 'HRS' },
                  { value: timeLeft.minutes, label: language === 'bn' ? 'মিনিট' : 'MIN' },
                  { value: timeLeft.seconds, label: language === 'bn' ? 'সেকেন্ড' : 'SEC' },
                ].map((item, index) => (
                  <React.Fragment key={index}>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/25">
                        {String(item.value).padStart(2, '0')}
                      </div>
                      <span className="text-xs text-muted-foreground mt-1.5 font-medium">{item.label}</span>
                    </div>
                    {index < 2 && (
                      <span className="text-2xl font-bold text-primary animate-pulse">:</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <Button
                size="lg"
                className="gradient-button h-12 px-8 text-base group mt-2"
                asChild
              >
                <Link to={`${basePath}/pricing`}>
                  {language === 'bn' ? 'এখনই অর্ডার করুন' : 'Order Now'}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
