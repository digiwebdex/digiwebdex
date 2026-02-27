import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingActions } from '@/components/order';
import { ExitIntentPopup, FloatingLeadButton } from '@/components/leads';
import { FacebookPixel, GoogleTracking, CookieConsentBanner } from '@/components/tracking';
import { OnboardingChatWidget } from '@/components/chat/OnboardingChatWidget';


interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <FacebookPixel />
      <GoogleTracking />
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <FloatingActions />
      <FloatingLeadButton />
      
      <OnboardingChatWidget />
      <ExitIntentPopup />
      <CookieConsentBanner />
    </div>
  );
}