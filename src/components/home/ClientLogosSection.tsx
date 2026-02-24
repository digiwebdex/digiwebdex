import React from 'react';
import { useLanguage } from '@/lib/i18n';

export function ClientLogosSection() {
  const { language } = useLanguage();

  // Client company names for display
  const clients = [
    'Al-Hadas Construction',
    'Daily Sushashon',
    'Darul Furkan Travels',
    'Divisoria KSA',
    'DMCH Cardiology',
    'Gate BD Group',
    'Prime Lawyers BD',
    'RX Pro Med',
    'SM Elite Hajj',
    'Titas Build',
    'ZN Laboratories',
    'Rofrof Travels',
    'Seven Trip',
  ];

  return (
    <section className="py-12 border-y border-border/50 bg-muted/30">
      <div className="container-custom">
        <p className="text-center text-sm font-medium text-muted-foreground mb-8">
          {language === 'bn' 
            ? '🏢 বিশ্বস্ত প্রতিষ্ঠানসমূহ যারা আমাদের সেবা নিচ্ছে'
            : '🏢 Trusted by Leading Organizations'}
        </p>
        
        {/* Infinite Scroll Container */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-x">
            {/* First set */}
            {clients.map((client, index) => (
              <div
                key={`first-${index}`}
                className="flex-shrink-0 mx-8"
              >
                <div className="px-6 py-3 rounded-xl bg-background/80 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
                  <span className="text-sm font-semibold text-foreground/70 whitespace-nowrap">
                    {client}
                  </span>
                </div>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {clients.map((client, index) => (
              <div
                key={`second-${index}`}
                className="flex-shrink-0 mx-8"
              >
                <div className="px-6 py-3 rounded-xl bg-background/80 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
                  <span className="text-sm font-semibold text-foreground/70 whitespace-nowrap">
                    {client}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
