import React from 'react';
import { LucideIcon, Shield, Clock, Zap, Award, Users, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TrustItem {
  icon: LucideIcon;
  value: string;
  label: string;
}

interface LandingTrustProps {
  title?: string;
  items: TrustItem[];
  variant?: 'stats' | 'badges' | 'minimal';
}

export function LandingTrust({ title, items, variant = 'stats' }: LandingTrustProps) {
  return (
    <section id="trust" className="py-16 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5" />
      
      <div className="container-custom relative">
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">
            {title}
          </h2>
        )}
        
        <div className={cn(
          "grid gap-8",
          items.length === 3 && "md:grid-cols-3",
          items.length === 4 && "md:grid-cols-2 lg:grid-cols-4",
          items.length === 5 && "md:grid-cols-2 lg:grid-cols-5"
        )}>
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "text-center group",
                variant === 'badges' && "p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all"
              )}
            >
              <div className={cn(
                "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                "bg-gradient-to-br from-primary/10 to-purple-500/10"
              )}>
                <item.icon className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {item.value}
              </div>
              <div className="text-muted-foreground font-medium">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
