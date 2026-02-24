import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingActions } from '@/components/order';
import { ExitIntentPopup, FloatingLeadButton } from '@/components/leads';
import { FacebookPixel, GoogleTracking, CookieConsentBanner } from '@/components/tracking';
import { OnboardingChatWidget } from '@/components/chat/OnboardingChatWidget';
import { WhatsAppChatWidget } from '@/components/chat/WhatsAppChatWidget';
import { ConsultationBookingModal } from '@/components/contact/ConsultationBookingModal';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { language } = useLanguage();
  return (
    <div className="flex min-h-screen flex-col">
      <FacebookPixel />
      <GoogleTracking />
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <FloatingActions />
      <FloatingLeadButton />
      <WhatsAppChatWidget />
      {/* Floating Consultation Button - Desktop */}
      <div className="fixed bottom-6 left-6 z-50 hidden md:block" style={{ bottom: '6.5rem' }}>
        <ConsultationBookingModal
          trigger={
            <Button className="h-12 px-5 rounded-full shadow-xl gradient-button hover:shadow-2xl transition-all">
              <CalendarDays className="h-5 w-5 mr-2" />
              {language === 'bn' ? 'ফ্রি কনসাল্টেশন' : 'Free Consultation'}
            </Button>
          }
        />
      </div>
      <OnboardingChatWidget />
      <ExitIntentPopup />
      <CookieConsentBanner />
    </div>
  );
}
