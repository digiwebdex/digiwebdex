import React from 'react';
import { IndustryLandingTemplate, IndustryLandingData } from '@/components/landing/IndustryLandingTemplate';
import { 
  Home, 
  MapPin, 
  Search, 
  Image, 
  Phone,
  Building,
  Key,
  DollarSign,
  Users,
  FileText,
  Shield
} from 'lucide-react';

const RealEstateWebsite: React.FC = () => {
  const data: IndustryLandingData = {
    slug: 'real-estate-website-development-bd',
    industry: 'Real Estate',
    heroHeadline: 'রিয়েল এস্টেট কোম্পানির জন্য আধুনিক ওয়েবসাইট',
    heroSubheadline: 'প্রপার্টি লিস্টিং, অনলাইন সার্চ, ভার্চুয়াল ট্যুর সহ পূর্ণাঙ্গ রিয়েল এস্টেট ওয়েবসাইট। আপনার প্রপার্টি বিক্রি করুন অনলাইনে।',
    metaTitle: 'রিয়েল এস্টেট ওয়েবসাইট ডেভেলপমেন্ট বাংলাদেশ | DigiWebDex',
    metaDescription: 'রিয়েল এস্টেট ও প্রপার্টি কোম্পানির জন্য প্রফেশনাল ওয়েবসাইট। প্রপার্টি লিস্টিং, সার্চ ফিল্টার, ম্যাপ ইন্টিগ্রেশন সহ।',
    keywords: [
      'real estate website bangladesh',
      'রিয়েল এস্টেট ওয়েবসাইট',
      'property listing website bd',
      'housing website development',
      'flat sale website',
      'real estate software bangladesh'
    ],
    painPoints: [
      {
        title: 'প্রপার্টি প্রদর্শনে সমস্যা',
        description: 'ফ্ল্যাট, প্লট, বাড়ির তথ্য ও ছবি সুন্দরভাবে দেখানো কঠিন।'
      },
      {
        title: 'অনলাইন সার্চ নেই',
        description: 'কাস্টমার এলাকা, বাজেট অনুযায়ী সার্চ করতে পারে না।'
      },
      {
        title: 'লিড জেনারেশন কম',
        description: 'ওয়েবসাইট থেকে পর্যাপ্ত ইনকোয়ারি আসে না।'
      },
      {
        title: 'প্রপার্টি আপডেট কঠিন',
        description: 'নতুন প্রপার্টি যোগ বা আপডেট করতে ডেভেলপার লাগে।'
      },
      {
        title: 'মোবাইল ফ্রেন্ডলি নয়',
        description: 'বেশিরভাগ কাস্টমার মোবাইলে ব্রাউজ করে কিন্তু সাইট ভালো দেখায় না।'
      },
      {
        title: 'SEO দুর্বল',
        description: 'গুগলে সার্চ করলে আপনার প্রপার্টি খুঁজে পাওয়া যায় না।'
      }
    ],
    solution: {
      title: 'পূর্ণাঙ্গ প্রপার্টি লিস্টিং সলিউশন',
      description: 'সহজে প্রপার্টি যোগ করুন, কাস্টমার সার্চ করুক, সরাসরি ইনকোয়ারি পান।'
    },
    features: [
      {
        icon: Building,
        title: 'প্রপার্টি লিস্টিং সিস্টেম',
        description: 'ফ্ল্যাট, প্লট, বাড়ি, কমার্শিয়াল - সব ধরনের প্রপার্টি লিস্ট করুন।'
      },
      {
        icon: Search,
        title: 'অ্যাডভান্সড সার্চ ফিল্টার',
        description: 'এলাকা, প্রাইস রেঞ্জ, বেডরুম সংখ্যা অনুযায়ী সার্চ।'
      },
      {
        icon: Image,
        title: 'ইমেজ গ্যালারি ও ভিডিও',
        description: 'প্রতি প্রপার্টিতে মাল্টিপল ফটো ও ভিডিও টুর যোগ করুন।'
      },
      {
        icon: MapPin,
        title: 'ম্যাপ ইন্টিগ্রেশন',
        description: 'Google Maps দিয়ে প্রপার্টি লোকেশন দেখান।'
      },
      {
        icon: FileText,
        title: 'ইনকোয়ারি ম্যানেজমেন্ট',
        description: 'কাস্টমার ইনকোয়ারি ট্র্যাক করুন, ফলো-আপ করুন।'
      },
      {
        icon: Shield,
        title: 'এজেন্ট ড্যাশবোর্ড',
        description: 'সেলস এজেন্টদের জন্য আলাদা লগইন ও ড্যাশবোর্ড।'
      }
    ],
    pricing: {
      startingPrice: 35000,
      label: 'রিয়েল এস্টেট ওয়েবসাইট',
      features: [
        'কাস্টম ডিজাইন',
        'প্রপার্টি লিস্টিং সিস্টেম',
        'অ্যাডভান্সড সার্চ',
        'ইমেজ গ্যালারি',
        'ম্যাপ ইন্টিগ্রেশন',
        'ইনকোয়ারি ফর্ম',
        'অ্যাডমিন প্যানেল',
        'SEO অপ্টিমাইজড',
        '৩ মাস ফ্রি সাপোর্ট'
      ]
    },
    faqs: [
      {
        question: 'প্রপার্টি নিজে আপলোড করতে পারব?',
        answer: 'হ্যাঁ, সহজ অ্যাডমিন প্যানেল থেকে প্রপার্টি যোগ, এডিট, ডিলিট করতে পারবেন কোনো টেকনিক্যাল নলেজ ছাড়াই।'
      },
      {
        question: 'একাধিক এজেন্ট যোগ করতে পারব?',
        answer: 'হ্যাঁ, এজেন্ট ম্যানেজমেন্ট সিস্টেম থাকবে যেখানে প্রতি এজেন্টের আলাদা প্রোফাইল ও লিস্টিং থাকবে।'
      },
      {
        question: 'ফিচার্ড প্রপার্টি হাইলাইট করা যাবে?',
        answer: 'অবশ্যই, হোমপেজে ফিচার্ড প্রপার্টি সেকশন থাকবে যেখানে আপনি যেকোনো প্রপার্টি হাইলাইট করতে পারবেন।'
      },
      {
        question: 'প্রপার্টি তুলনা করার ফিচার আছে?',
        answer: 'হ্যাঁ, কাস্টমার একাধিক প্রপার্টি সিলেক্ট করে পাশাপাশি তুলনা করতে পারবে।'
      },
      {
        question: 'ওয়েবসাইটে EMI ক্যালকুলেটর থাকবে?',
        answer: 'হ্যাঁ, ব্যাংক লোন EMI ক্যালকুলেটর যোগ করা যায় যাতে কাস্টমার সহজে হিসাব করতে পারে।'
      }
    ],
    relatedServices: [
      {
        title: 'ওয়েব ডেভেলপমেন্ট',
        link: '/bn/services/web-development',
        icon: Home
      },
      {
        title: 'সফটওয়্যার ডেভেলপমেন্ট',
        link: '/bn/services/software-development',
        icon: Building
      },
      {
        title: 'মূল্য তালিকা',
        link: '/bn/pricing',
        icon: DollarSign
      }
    ]
  };

  return <IndustryLandingTemplate data={data} />;
};

export default RealEstateWebsite;
