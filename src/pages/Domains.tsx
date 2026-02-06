import React from 'react';
import { Layout } from '@/components/layout';
import { DomainSearch } from '@/components/domain';
import { useLanguage } from '@/lib/i18n';

export default function DomainsPage() {
  const { language } = useLanguage();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {language === 'bn' 
              ? 'আপনার পারফেক্ট ডোমেইন খুঁজুন' 
              : 'Find Your Perfect Domain'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {language === 'bn'
              ? '.com, .net, .org, .com.bd সহ শতাধিক এক্সটেনশন থেকে বেছে নিন'
              : 'Choose from hundreds of extensions including .com, .net, .org, .com.bd and more'}
          </p>
        </div>

        {/* Domain Search Component */}
        <div className="max-w-4xl mx-auto">
          <DomainSearch showPricingTable={true} />
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {language === 'bn' ? 'সিকিউর রেজিস্ট্রেশন' : 'Secure Registration'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'bn'
                ? 'ICANN অনুমোদিত রেজিস্ট্রার থেকে নিরাপদ ডোমেইন রেজিস্ট্রেশন'
                : 'Safe domain registration from ICANN accredited registrars'}
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {language === 'bn' ? 'দ্রুত অ্যাক্টিভেশন' : 'Instant Activation'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'bn'
                ? 'পেমেন্টের পর সাথে সাথেই ডোমেইন অ্যাক্টিভ হয়ে যায়'
                : 'Domain gets activated immediately after payment'}
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {language === 'bn' ? '২৪/৭ সাপোর্ট' : '24/7 Support'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'bn'
                ? 'যেকোনো সমস্যায় আমাদের টিম সবসময় আপনার পাশে'
                : 'Our team is always here to help with any issues'}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
