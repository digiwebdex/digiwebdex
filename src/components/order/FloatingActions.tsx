import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ChevronUp, ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { DIGIWEBDEX_CONTACT } from '@/services/contactService';
import { systemSettingsService } from '@/services/settings';

export function FloatingActions() {
  const { language } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';
  const [floatingOrderEnabled, setFloatingOrderEnabled] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkEnabled = async () => {
      try {
        const enabled = await systemSettingsService.getSetting<boolean | string>('floating_order_button_enabled');
        setFloatingOrderEnabled(enabled === true || enabled === 'true');
      } catch {
        setFloatingOrderEnabled(true);
      }
    };
    checkEnabled();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      language === 'bn'
        ? 'হ্যালো, আমি DigiWebDex এর সার্ভিস সম্পর্কে জানতে চাই।'
        : 'Hello, I want to know about DigiWebDex services.'
    );
    window.open(`https://wa.me/${DIGIWEBDEX_CONTACT.whatsapp}?text=${message}`, '_blank');
  };

  return (
    <>
      {/* Desktop Floating Action Buttons - Right Side */}
      <div className="fixed bottom-6 right-6 z-50 hidden md:flex flex-col items-end gap-3">
        {/* Scroll to Top */}
        <Button
          size="icon"
          variant="outline"
          className={cn(
            'h-10 w-10 rounded-full shadow-lg bg-background/80 backdrop-blur-sm transition-all duration-300',
            showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
          )}
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>

        {/* Quick Order Button */}
        {floatingOrderEnabled && (
          <Button
            className="h-12 px-5 rounded-full shadow-xl bg-gradient-to-r from-primary to-accent text-white hover:shadow-2xl hover:shadow-primary/25 group"
            asChild
          >
            <Link to={`${basePath}/pricing`}>
              <ShoppingCart className="h-5 w-5 mr-2" />
              {language === 'bn' ? 'অর্ডার করুন' : 'Order Now'}
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        )}

      </div>

      {/* WhatsApp Floating Bar - Left Side (Desktop) */}
      <div className="fixed bottom-[8.5rem] left-6 z-50 hidden md:block">
        <Button
          className="h-12 px-5 rounded-full shadow-xl bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-2xl hover:shadow-emerald-500/30 transition-all"
          onClick={openWhatsApp}
          aria-label="WhatsApp"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          {language === 'bn' ? 'সরাসরি হোয়াটসঅ্যাপ যোগাযোগ করুন' : 'Contact via WhatsApp'}
        </Button>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-md border-t shadow-2xl safe-area-inset-bottom">
        <div className="flex items-center gap-2 p-3">
          {/* Quick Order CTA */}
          {floatingOrderEnabled && (
            <Button
              className="flex-1 gap-2 h-12 gradient-button text-sm font-semibold group"
              asChild
            >
              <Link to={`${basePath}/pricing`}>
                <ShoppingCart className="h-4 w-4" />
                {language === 'bn' ? 'অর্ডার করুন' : 'Order Now'}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          )}
          
          {/* WhatsApp Button */}
          <Button
            className="h-12 w-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex-shrink-0"
            onClick={openWhatsApp}
            aria-label="WhatsApp"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  );
}
