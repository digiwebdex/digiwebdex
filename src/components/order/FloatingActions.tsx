import React, { useState, useEffect } from 'react';
import { MessageCircle, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { DIGIWEBDEX_CONTACT } from '@/services/contactService';

export function FloatingActions() {
  const { language } = useLanguage();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
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

        {/* WhatsApp Button */}
        <Button
          className="h-14 w-14 rounded-full shadow-xl bg-green-500 hover:bg-green-600 text-white"
          onClick={openWhatsApp}
          aria-label="WhatsApp"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Bottom Bar - WhatsApp Only */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-sm border-t p-3 safe-area-inset-bottom">
        <Button
          className="w-full gap-2 bg-green-500 hover:bg-green-600 text-white"
          onClick={openWhatsApp}
        >
          <MessageCircle className="h-5 w-5" />
          {language === 'bn' ? 'WhatsApp এ মেসেজ করুন' : 'Message on WhatsApp'}
        </Button>
      </div>
    </>
  );
}
