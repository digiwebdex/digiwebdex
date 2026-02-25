import { Layout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { SEOHead } from '@/components/seo';
import { FileText } from 'lucide-react';

export default function TermsConditions() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  return (
    <Layout>
      <SEOHead
        title={isBn ? 'শর্তাবলী | DigiWebDex' : 'Terms & Conditions | DigiWebDex'}
        description={isBn ? 'DigiWebDex এর সেবা ব্যবহারের শর্তাবলী।' : 'DigiWebDex Terms and Conditions of Service.'}
      />

      <div className="container-custom py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {isBn ? 'শর্তাবলী' : 'Terms & Conditions'}
            </h1>
            <p className="text-muted-foreground">
              {isBn ? 'সর্বশেষ আপডেট: ফেব্রুয়ারি ২০২৬' : 'Last updated: February 2026'}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{isBn ? '১. সেবার শর্তাবলী' : '1. Terms of Service'}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {isBn
                  ? 'DigiWebDex এর ওয়েবসাইট এবং সেবাসমূহ ব্যবহার করে আপনি এই শর্তাবলী মেনে চলতে সম্মত হচ্ছেন। আপনি যদি এই শর্তাবলীর কোনো অংশের সাথে একমত না হন, তাহলে অনুগ্রহ করে আমাদের সেবা ব্যবহার করবেন না।'
                  : 'By using DigiWebDex website and services, you agree to comply with these terms and conditions. If you do not agree with any part of these terms, please do not use our services.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{isBn ? '২. সেবাসমূহ' : '2. Services'}</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                {isBn ? 'DigiWebDex নিম্নলিখিত সেবাসমূহ প্রদান করে:' : 'DigiWebDex provides the following services:'}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{isBn ? 'ডোমেইন রেজিস্ট্রেশন এবং ম্যানেজমেন্ট' : 'Domain registration and management'}</li>
                <li>{isBn ? 'ওয়েব হোস্টিং সেবা' : 'Web hosting services'}</li>
                <li>{isBn ? 'ওয়েবসাইট ডিজাইন এবং ডেভেলপমেন্ট' : 'Website design and development'}</li>
                <li>{isBn ? 'সফটওয়্যার ডেভেলপমেন্ট' : 'Software development'}</li>
                <li>{isBn ? 'ডিজিটাল মার্কেটিং' : 'Digital marketing'}</li>
                <li>{isBn ? 'Facebook Chatbot AI সেটআপ' : 'Facebook Chatbot AI setup'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{isBn ? '৩. পেমেন্ট শর্তাবলী' : '3. Payment Terms'}</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{isBn ? 'সকল মূল্য বাংলাদেশি টাকায় (৳) উল্লেখ করা হয়েছে' : 'All prices are listed in Bangladeshi Taka (৳)'}</li>
                <li>{isBn ? 'পেমেন্ট পদ্ধতি: bKash (Send Money), ব্যাংক ট্রান্সফার, এবং ক্যাশ পেমেন্ট' : 'Payment methods: bKash (Send Money), Bank Transfer, and Cash Payment'}</li>
                <li>{isBn ? 'পেমেন্ট যাচাই ১-৪ ঘন্টার মধ্যে সম্পন্ন হয় (অফিস সময়ে)' : 'Payment verification is completed within 1-4 hours (during business hours)'}</li>
                <li>{isBn ? 'ওয়েবসাইট ডেভেলপমেন্ট প্রজেক্টে অগ্রিম পেমেন্ট প্রয়োজন হতে পারে' : 'Website development projects may require advance payment'}</li>
                <li>{isBn ? 'ডোমেইন ও হোস্টিং সেবার জন্য বার্ষিক রিনিউয়াল প্রযোজ্য' : 'Annual renewal applies for domain and hosting services'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{isBn ? '৪. রিফান্ড নীতি' : '4. Refund Policy'}</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{isBn ? 'ডোমেইন রেজিস্ট্রেশন ফি অ-ফেরতযোগ্য' : 'Domain registration fees are non-refundable'}</li>
                <li>{isBn ? 'হোস্টিং সেবায় ৭ দিনের মানি-ব্যাক গ্যারান্টি (নতুন গ্রাহকদের জন্য)' : 'Hosting services have a 7-day money-back guarantee (for new customers)'}</li>
                <li>{isBn ? 'ওয়েব ডেভেলপমেন্ট প্রজেক্টে কাজ শুরুর পর রিফান্ড প্রযোজ্য নয়' : 'Web development projects are non-refundable once work has started'}</li>
                <li>{isBn ? 'রিফান্ড অনুরোধ info@digiwebdex.com এ জমা দিতে হবে' : 'Refund requests must be submitted to info@digiwebdex.com'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{isBn ? '৫. ব্যবহারকারীর দায়িত্ব' : '5. User Responsibilities'}</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{isBn ? 'সঠিক এবং আপডেট তথ্য প্রদান করা' : 'Providing accurate and up-to-date information'}</li>
                <li>{isBn ? 'অ্যাকাউন্টের নিরাপত্তা বজায় রাখা' : 'Maintaining account security'}</li>
                <li>{isBn ? 'অবৈধ বা ক্ষতিকারক উদ্দেশ্যে সেবা ব্যবহার না করা' : 'Not using services for illegal or harmful purposes'}</li>
                <li>{isBn ? 'কপিরাইট এবং মেধাস্বত্ব আইন মেনে চলা' : 'Complying with copyright and intellectual property laws'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{isBn ? '৬. মেধাস্বত্ব' : '6. Intellectual Property'}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {isBn
                  ? 'DigiWebDex কর্তৃক তৈরি সকল ডিজাইন, কোড এবং কন্টেন্ট আমাদের মেধাস্বত্বের অন্তর্ভুক্ত, যতক্ষণ না সম্পূর্ণ পেমেন্ট সম্পন্ন হয়। পূর্ণ পেমেন্টের পর ক্লায়েন্ট তাদের প্রজেক্টের সম্পূর্ণ মালিকানা পাবেন।'
                  : 'All designs, code, and content created by DigiWebDex remain our intellectual property until full payment is made. Upon complete payment, the client receives full ownership of their project.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{isBn ? '৭. সেবা স্থগিত ও বাতিল' : '7. Service Suspension & Termination'}</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{isBn ? 'পেমেন্ট না করলে সেবা স্থগিত করা হতে পারে' : 'Services may be suspended for non-payment'}</li>
                <li>{isBn ? 'শর্তাবলী লঙ্ঘন করলে অ্যাকাউন্ট বাতিল করা হতে পারে' : 'Accounts may be terminated for violation of terms'}</li>
                <li>{isBn ? 'অবৈধ কন্টেন্ট হোস্ট করলে তাৎক্ষণিক পদক্ষেপ নেওয়া হবে' : 'Immediate action will be taken for hosting illegal content'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{isBn ? '৮. দায়সীমাবদ্ধতা' : '8. Limitation of Liability'}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {isBn
                  ? 'DigiWebDex কোনো পরোক্ষ, আকস্মিক, বিশেষ বা পরিণতিমূলক ক্ষতির জন্য দায়ী থাকবে না। আমাদের সর্বোচ্চ দায় সংশ্লিষ্ট সেবার জন্য প্রদত্ত মূল্যের মধ্যে সীমাবদ্ধ থাকবে।'
                  : 'DigiWebDex shall not be liable for any indirect, incidental, special, or consequential damages. Our maximum liability is limited to the amount paid for the relevant service.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{isBn ? '৯. শর্তাবলী পরিবর্তন' : '9. Changes to Terms'}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {isBn
                  ? 'আমরা যেকোনো সময় এই শর্তাবলী আপডেট করতে পারি। গুরুত্বপূর্ণ পরিবর্তনের ক্ষেত্রে আমরা আপনাকে ইমেইল বা ওয়েবসাইটে বিজ্ঞপ্তির মাধ্যমে জানাব।'
                  : 'We may update these terms at any time. For significant changes, we will notify you via email or website notification.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{isBn ? '১০. যোগাযোগ' : '10. Contact Us'}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {isBn
                  ? 'শর্তাবলী সংক্রান্ত যেকোনো প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন:'
                  : 'For any questions regarding these terms, contact us:'}
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
