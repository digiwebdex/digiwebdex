import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles, Zap, Globe, Shield, CheckCircle, Star, Rocket, Code2 } from 'lucide-react';
import { DomainSearchBox } from './DomainSearchBox';

export function HeroSection() {
  const { language, t } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  const highlights = [
    { icon: CheckCircle, text: language === 'bn' ? '৫০০+ সফল প্রজেক্ট' : '500+ Successful Projects' },
    { icon: CheckCircle, text: language === 'bn' ? '৯৯.৯% আপটাইম' : '99.9% Uptime' },
    { icon: CheckCircle, text: language === 'bn' ? '২৪/৭ সাপোর্ট' : '24/7 Support' },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
      <div className="absolute inset-0 mesh-gradient" />
      
      {/* Animated Morphing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large morphing primary orb */}
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-primary/25 via-secondary/20 to-accent/15 blur-3xl animate-morph opacity-60" />
        
        {/* Secondary morphing orb */}
        <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-secondary/20 via-primary/15 to-transparent blur-3xl animate-morph opacity-50" style={{ animationDelay: '3s' }} />
        
        {/* Pulsing accent orbs */}
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/15 blur-2xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 left-1/3 w-56 h-56 rounded-full bg-primary/20 blur-2xl animate-bounce-slow" style={{ animationDelay: '2s' }} />
        
        {/* Rotating ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-primary/10 animate-rotate-slow opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-accent/10 animate-rotate-slow opacity-20" style={{ animationDirection: 'reverse', animationDuration: '25s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.04)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Radial Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.4)_70%)]" />
      </div>

      {/* Floating 3D-like Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-24 left-[10%] animate-float" style={{ animationDelay: '0s' }}>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 p-3 shadow-2xl shadow-primary/30 hover-scale">
            <Globe className="w-full h-full text-white drop-shadow-lg" />
          </div>
        </div>
        <div className="absolute top-32 right-[15%] animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/60 p-2.5 shadow-2xl shadow-accent/30">
            <Zap className="w-full h-full text-white drop-shadow-lg" />
          </div>
        </div>
        <div className="absolute bottom-32 left-[15%] animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-secondary/60 p-3.5 shadow-2xl shadow-secondary/30">
            <Shield className="w-full h-full text-white drop-shadow-lg" />
          </div>
        </div>
        <div className="absolute bottom-48 right-[12%] animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent p-2 shadow-2xl shadow-primary/30">
            <Sparkles className="w-full h-full text-white drop-shadow-lg" />
          </div>
        </div>
        <div className="absolute top-1/2 left-[8%] animate-bounce-slow" style={{ animationDelay: '1.5s' }}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent via-secondary to-primary p-2.5 shadow-2xl">
            <Star className="w-full h-full text-white drop-shadow-lg" />
          </div>
        </div>
        <div className="absolute top-[40%] right-[8%] animate-float" style={{ animationDelay: '3s' }}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/80 to-secondary/80 p-2.5 shadow-2xl">
            <Rocket className="w-full h-full text-white drop-shadow-lg" />
          </div>
        </div>
      </div>

      <div className="container-custom relative z-10 py-20 md:py-28">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Badge with glow */}
          <div className="animate-slide-up mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-premium border-primary/30 animate-glow">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary shadow-lg shadow-primary/50"></span>
              </span>
              <span className="text-sm font-semibold text-foreground tracking-wide">
                {language === 'bn' ? '🚀 বাংলাদেশের #১ ডিজিটাল এজেন্সি' : '🚀 Bangladesh\'s #1 Digital Agency'}
              </span>
            </div>
          </div>

          {/* Main Headline with text glow */}
          <h1 className="animate-slide-up delay-100 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            {language === 'bn' ? (
              <>
                আপনার ব্যবসার
                <br />
                <span className="relative inline-block mt-2">
                  <span className="gradient-text animate-gradient text-glow">সফলতা শুরু হোক</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" preserveAspectRatio="none">
                    <path d="M0,8 Q75,0 150,8 T300,8" fill="none" stroke="url(#underlineGradient)" strokeWidth="4" strokeLinecap="round" className="animate-pulse-soft" />
                    <defs>
                      <linearGradient id="underlineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(200 70% 45%)" />
                        <stop offset="50%" stopColor="hsl(200 75% 55%)" />
                        <stop offset="100%" stopColor="hsl(28 82% 53%)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <span className="block mt-2">এখান থেকেই</span>
              </>
            ) : (
              <>
                Your Business
                <br />
                <span className="relative inline-block mt-2">
                  <span className="gradient-text animate-gradient text-glow">Success Starts Here</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" preserveAspectRatio="none">
                    <path d="M0,8 Q75,0 150,8 T300,8" fill="none" stroke="url(#underlineGradient)" strokeWidth="4" strokeLinecap="round" className="animate-pulse-soft" />
                  </svg>
                </span>
              </>
            )}
          </h1>

          {/* Subheadline - Benefit focused */}
          <p className="animate-slide-up delay-200 mt-8 text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed">
            {language === 'bn' 
              ? 'ডোমেইন, হোস্টিং, ওয়েবসাইট ও সফটওয়্যার — সব এক জায়গায়। আজই শুরু করুন এবং আপনার ব্যবসা বাড়ান।' 
              : 'Domain, Hosting, Website & Software — all in one place. Start today and grow your business.'}
          </p>

          {/* Highlights with hover effect */}
          <div className="animate-slide-up delay-300 mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {highlights.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 text-sm md:text-base text-foreground/80 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
              >
                <item.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons with enhanced effects */}
          <div className="animate-slide-up delay-400 mt-12 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="gradient-button h-14 px-10 text-lg group" asChild>
              <Link to={`${basePath}/pricing`}>
                {language === 'bn' ? 'এখনই অর্ডার করুন' : 'Order Now'}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg glass-premium border-primary/30 hover:border-primary/50 hover:bg-primary/10 group" asChild>
              <Link to={`${basePath}/contact`}>
                <Play className="mr-2 h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                {language === 'bn' ? 'ফ্রি কনসাল্টেশন নিন' : 'Get Free Consultation'}
              </Link>
            </Button>
          </div>

          {/* Domain Search Box with enhanced styling */}
          <div className="animate-slide-up delay-500 mt-16 w-full max-w-2xl">
            <div className="text-center mb-6">
              <p className="text-base font-semibold text-foreground mb-1">
                {language === 'bn' ? '🔍 আপনার পছন্দের ডোমেইন খুঁজুন' : '🔍 Find Your Perfect Domain'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'bn' ? '.com শুরু মাত্র ৳৯৯৯/বছর থেকে' : '.com starting from just ৳999/year'}
              </p>
            </div>
            <div className="glass-premium p-2 rounded-2xl">
              <DomainSearchBox />
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="animate-slide-up delay-700 mt-16">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-widest">
                {language === 'bn' ? 'স্ক্রল করুন' : 'Scroll'}
              </span>
              <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex justify-center p-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce-slow" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave with gradient */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--background))" />
              <stop offset="50%" stopColor="hsl(var(--background))" />
              <stop offset="100%" stopColor="hsl(var(--background))" />
            </linearGradient>
          </defs>
          <path d="M0,80 C360,120 720,40 1080,80 C1260,100 1380,100 1440,80 L1440,120 L0,120 Z" fill="url(#waveGradient)" />
        </svg>
      </div>
    </section>
  );
}
