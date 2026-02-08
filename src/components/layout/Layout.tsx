import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingActions } from '@/components/order';
import { ExitIntentPopup, FloatingLeadButton } from '@/components/leads';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <FloatingActions />
      <FloatingLeadButton />
      <ExitIntentPopup />
    </div>
  );
}
