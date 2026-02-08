import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Rocket, Phone } from 'lucide-react';

export function AboutCTA() {
  const { language } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  const content = {
    bn: {
      title: 'আজই আপনার ডিজিটাল যাত্রা শুরু করুন',
      subtitle: 'আমাদের বিশেষজ্ঞ টিম আপনার ব্যবসাকে ডিজিটাল রূপান্তরে সাহায্য করতে প্রস্তুত',
      ctaStart: 'প্রজেক্ট শুরু করুন',
      ctaContact: 'যোগাযোগ করুন',
    },
    en: {
      title: 'Start Your Digital Journey Today',
      subtitle: 'Our expert team is ready to help transform your business digitally',
      ctaStart: 'Start a Project',
      ctaContact: 'Contact Us',
    },
  };

  const t = content[language];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {t.title}
          </h2>
          <p className="text-xl text-white/80 mb-10">
            {t.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
              <Link to={`${basePath}/pricing`}>
                <Rocket className="w-5 h-5 mr-2" />
                {t.ctaStart}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6"
            >
              <Link to={`${basePath}/contact`}>
                <Phone className="w-5 h-5 mr-2" />
                {t.ctaContact}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
