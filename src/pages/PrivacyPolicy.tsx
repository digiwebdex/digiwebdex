import { Layout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { SEOHead } from '@/components/seo';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  return (
    <Layout>
      <SEOHead
        title={isBn ? 'গোপনীয়তা নীতি | DigiWebDex' : 'Privacy Policy | DigiWebDex'}
        description={isBn ? 'DigiWebDex এর গোপনীয়তা নীতি। আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত রাখি।' : 'DigiWebDex Privacy Policy. How we collect, use and protect your information.'}
      />

      <div className="container-custom py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {isBn ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
            </h1>
            <p className="text-muted-foreground">
              {isBn ? 'সর্বশেষ আপডেট: ফেব্রুয়ারি ২০২৬' : 'Last updated: February 2026'}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{isBn ? '১. ভূমিকা' : '1. Introduction'}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {isBn
                  ? 'DigiWebDex ("আমরা", "আমাদের") আপনার গোপনীয়তাকে সম্মান করে। এই গোপনীয়তা নীতিতে আমরা ব্যাখ্যা করেছি যে কীভাবে আমরা আমাদের ওয়েবসাইট (digiwebdex.com) এবং সংশ্লিষ্ট সেবাসমূহ ব্যবহারের সময় আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার, প্রকাশ এবং সুরক্ষিত রাখি।'
                  : 'DigiWebDex ("we", "our", "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our website (digiwebdex.com) and related services.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{isBn ? '২. তথ্য সংগ্রহ' : '2. Information We Collect'}</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                {isBn ? 'আমরা নিম্নলিখিত ধরনের তথ্য সংগ্রহ করতে পারি:' : 'We may collect the following types of information:'}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{isBn ? 'নাম, ইমেইল, ফোন নম্বর এবং ঠিকানা' : 'Name, email address, phone number, and address'}</li>
                <li>{isBn ? 'পেমেন্ট ও বিলিং তথ্য (bKash Transaction ID, ব্যাংক রেফারেন্স)' : 'Payment and billing information (bKash Transaction ID, bank references)'}</li>
                <li>{isBn ? 'ওয়েবসাইট ব্রাউজিং ডেটা (কুকিজ, IP ঠিকানা, ডিভাইসের তথ্য)' : 'Website browsing data (cookies, IP address, device information)'}</li>
                <li>{isBn ? 'সাপোর্ট টিকেট এবং যোগাযোগের তথ্য' : 'Support tickets and communication records'}</li>
                <li>{isBn ? 'ডোমেইন, হোস্টিং এবং সার্ভিস সংশ্লিষ্ট তথ্য' : 'Domain, hosting, and service-related data'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{isBn ? '৩. তথ্য ব্যবহার' : '3. How We Use Your Information'}</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{isBn ? 'আপনার অর্ডার প্রক্রিয়া এবং সেবা প্রদান' : 'Processing your orders and delivering services'}</li>
                <li>{isBn ? 'পেমেন্ট যাচাই এবং বিলিং পরিচালনা' : 'Payment verification and billing management'}</li>
                <li>{isBn ? 'গ্রাহক সহায়তা এবং যোগাযোগ' : 'Customer support and communication'}</li>
                <li>{isBn ? 'সেবার মান উন্নয়ন এবং নতুন ফিচার ডেভেলপমেন্ট' : 'Improving our services and developing new features'}</li>
                <li>{isBn ? 'প্রযোজ্য আইন এবং প্রবিধান মেনে চলা' : 'Complying with applicable laws and regulations'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{isBn ? '৪. তথ্য সুরক্ষা' : '4. Data Security'}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {isBn
                  ? 'আমরা আপনার তথ্য সুরক্ষিত রাখতে শিল্প-মানের নিরাপত্তা ব্যবস্থা ব্যবহার করি, যার মধ্যে SSL এনক্রিপশন, নিরাপদ সার্ভার, এবং অ্যাক্সেস নিয়ন্ত্রণ অন্তর্ভুক্ত। তবে ইন্টারনেটে কোনো ডেটা ট্রান্সমিশন ১০০% নিরাপদ নয়।'
                  : 'We use industry-standard security measures to protect your information, including SSL encryption, secure servers, and access controls. However, no data transmission over the internet is 100% secure.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{isBn ? '৫. কুকিজ' : '5. Cookies'}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {isBn
                  ? 'আমাদের ওয়েবসাইট কুকিজ ব্যবহার করে আপনার ব্রাউজিং অভিজ্ঞতা উন্নত করতে, ট্রাফিক বিশ্লেষণ করতে এবং বিজ্ঞাপন কাস্টমাইজ করতে। আপনি আপনার ব্রাউজার সেটিংস থেকে কুকিজ নিষ্ক্রিয় করতে পারেন।'
                  : 'Our website uses cookies to improve your browsing experience, analyze traffic, and customize advertisements. You can disable cookies through your browser settings.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{isBn ? '৬. তৃতীয় পক্ষের সাথে তথ্য শেয়ার' : '6. Third-Party Sharing'}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {isBn
                  ? 'আমরা আপনার ব্যক্তিগত তথ্য বিক্রি করি না। তবে সেবা প্রদানের জন্য বিশ্বস্ত তৃতীয় পক্ষের সাথে (যেমন পেমেন্ট গেটওয়ে, ডোমেইন রেজিস্ট্রার, হোস্টিং প্রদানকারী) প্রয়োজনীয় তথ্য শেয়ার করতে পারি।'
                  : 'We do not sell your personal information. However, we may share necessary information with trusted third parties (such as payment gateways, domain registrars, hosting providers) to deliver our services.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{isBn ? '৭. আপনার অধিকার' : '7. Your Rights'}</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{isBn ? 'আপনার তথ্য দেখা, সংশোধন বা মুছে ফেলার অনুরোধ করতে পারেন' : 'Request to view, correct, or delete your data'}</li>
                <li>{isBn ? 'মার্কেটিং ইমেইল থেকে আনসাবস্ক্রাইব করতে পারেন' : 'Unsubscribe from marketing emails'}</li>
                <li>{isBn ? 'কুকিজ নিষ্ক্রিয় করতে পারেন' : 'Disable cookies'}</li>
                <li>{isBn ? 'আপনার ডেটার পোর্টেবিলিটি অনুরোধ করতে পারেন' : 'Request data portability'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{isBn ? '৮. যোগাযোগ' : '8. Contact Us'}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {isBn
                  ? 'গোপনীয়তা সংক্রান্ত যেকোনো প্রশ্ন বা অনুরোধের জন্য আমাদের সাথে যোগাযোগ করুন:'
                  : 'For any privacy-related questions or requests, contact us:'}
              </p>
              <ul className="list-none space-y-1 text-muted-foreground mt-3">
                <li>📧 Email: info@digiwebdex.com</li>
                <li>📞 Phone: 01674533303</li>
                <li>💬 WhatsApp: 01674533303</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
