import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, Gift, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StickyTopBar() {
  const { language } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 hidden md:block transition-all duration-300',
        isScrolled ? 'translate-y-0' : '-translate-y-full'
      )}
    >
      <div className="bg-gradient-to-r from-primary via-primary/95 to-accent text-white">
        <div className="container-custom">
          <div className="flex items-center justify-between py-2.5 gap-4">
            {/* Offer Text */}
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 animate-bounce-slow" />
              <span className="text-sm font-medium">
                {language === 'bn' 
                  ? '🎁 লিমিটেড অফার: হোস্টিং এর সাথে ফ্রি SSL + ডোমেইন!'
                  : '🎁 Limited Offer: Free SSL + Domain with Hosting!'}
              </span>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 h-8 px-4 text-xs font-semibold"
                asChild
              >
                <Link to={`${basePath}/pricing`}>
                  {language === 'bn' ? 'এখনই অর্ডার করুন' : 'Order Now'}
                  <ArrowRight className="ml-1 w-3 h-3" />
                </Link>
              </Button>
              
              <a
                href="tel:+8801674533303"
                className="flex items-center gap-1.5 text-xs font-medium text-white/90 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>+880 1674-533303</span>
              </a>

              <button
                onClick={() => setIsVisible(false)}
                className="ml-2 p-1 rounded hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
