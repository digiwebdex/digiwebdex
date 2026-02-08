import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Shield, Server, Lock, Zap } from 'lucide-react';

// Import portfolio images as client logos
import alhadas from '@/assets/portfolio/alhadas-construction.jpg';
import dailysushashon from '@/assets/portfolio/dailysushashon.jpg';
import darulfurkantravels from '@/assets/portfolio/darulfurkantravels.jpg';
import divisoriaksa from '@/assets/portfolio/divisoriaksa.jpg';
import dmchcardiology from '@/assets/portfolio/dmchcardiology.jpg';
import gatebdgroup from '@/assets/portfolio/gatebdgroup.jpg';

export function AboutTrust() {
  const { language } = useLanguage();

  const content = {
    bn: {
      sectionTitle: 'বিশ্বাস ও নির্ভরযোগ্যতা',
      title: 'আমাদের ক্লায়েন্টদের বিশ্বাস',
      subtitle: 'বাংলাদেশের শীর্ষ প্রতিষ্ঠানগুলো আমাদের উপর ভরসা করে',
      clientsTitle: 'আমাদের বিশ্বস্ত ক্লায়েন্ট',
      techTitle: 'আমরা যে প্রযুক্তি ব্যবহার করি',
      badges: [
        { icon: Shield, title: '99.9% আপটাইম', description: 'গ্যারান্টি' },
        { icon: Server, title: 'এন্টারপ্রাইজ', description: 'ইনফ্রাস্ট্রাকচার' },
        { icon: Lock, title: 'SSL সিকিউর', description: 'সব প্রজেক্ট' },
        { icon: Zap, title: 'দ্রুত লোডিং', description: 'অপ্টিমাইজড' },
      ],
      technologies: ['React', 'Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Tailwind CSS'],
    },
    en: {
      sectionTitle: 'Trust & Reliability',
      title: 'Our Clients Trust',
      subtitle: 'Top organizations in Bangladesh trust us',
      clientsTitle: 'Our Trusted Clients',
      techTitle: 'Technologies We Use',
      badges: [
        { icon: Shield, title: '99.9% Uptime', description: 'Guarantee' },
        { icon: Server, title: 'Enterprise', description: 'Infrastructure' },
        { icon: Lock, title: 'SSL Secure', description: 'All Projects' },
        { icon: Zap, title: 'Fast Loading', description: 'Optimized' },
      ],
      technologies: ['React', 'Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Tailwind CSS'],
    },
  };

  const t = content[language];

  const clientLogos = [
    { src: alhadas, alt: 'Alhadas Construction' },
    { src: dailysushashon, alt: 'Daily Sushashon' },
    { src: darulfurkantravels, alt: 'Darul Furkan Travels' },
    { src: divisoriaksa, alt: 'Divisoria KSA' },
    { src: dmchcardiology, alt: 'DMCH Cardiology' },
    { src: gatebdgroup, alt: 'Gate BD Group' },
  ];

  return (
    <section className="py-20">
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

        {/* Trust Badges */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {t.badges.map((badge, index) => (
            <div
              key={index}
              className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-border/50 text-center hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                <badge.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-foreground">{badge.title}</h3>
              <p className="text-sm text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>

        {/* Client Logos */}
        <div className="mb-16">
          <h3 className="text-xl font-semibold text-foreground text-center mb-8">
            {t.clientsTitle}
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {clientLogos.map((logo, index) => (
              <div
                key={index}
                className="aspect-video rounded-xl overflow-hidden bg-card border border-border/50 p-2 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Technologies */}
        <div>
          <h3 className="text-xl font-semibold text-foreground text-center mb-8">
            {t.techTitle}
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {t.technologies.map((tech, index) => (
              <span
                key={index}
                className="px-6 py-3 bg-muted/50 rounded-full text-foreground font-medium border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
