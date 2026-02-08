import React from 'react';
import { IndustryLandingTemplate, IndustryLandingData } from '@/components/landing/IndustryLandingTemplate';
import { 
  Globe, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Search, 
  Shield,
  Plane,
  Hotel,
  Users,
  Star,
  Phone,
  MessageCircle
} from 'lucide-react';

const TravelAgencyWebsite: React.FC = () => {
  const data: IndustryLandingData = {
    slug: 'travel-agency-website-development-bangladesh',
    industry: 'Travel Agency',
    heroHeadline: 'ট্রাভেল এজেন্সির জন্য আধুনিক ওয়েবসাইট তৈরি করুন',
    heroSubheadline: 'হজ্ব-উমরাহ, ট্যুর প্যাকেজ, এয়ার টিকেট বুকিং সহ সম্পূর্ণ ট্রাভেল ম্যানেজমেন্ট সিস্টেম। অনলাইনে বুকিং নিন, পেমেন্ট গ্রহণ করুন।',
    metaTitle: 'ট্রাভেল এজেন্সি ওয়েবসাইট ডেভেলপমেন্ট বাংলাদেশ | DigiWebDex',
    metaDescription: 'ট্রাভেল এজেন্সির জন্য প্রফেশনাল ওয়েবসাইট তৈরি করুন। হজ্ব-উমরাহ বুকিং, ট্যুর প্যাকেজ, ফ্লাইট বুকিং সিস্টেম সহ। অনলাইন পেমেন্ট ইন্টিগ্রেশন।',
    keywords: [
      'travel agency website bangladesh',
      'ট্রাভেল এজেন্সি ওয়েবসাইট',
      'hajj umrah booking website',
      'tour package website bd',
      'flight booking website',
      'travel agency software'
    ],
    painPoints: [
      {
        title: 'অনলাইন বুকিং নেই',
        description: 'গ্রাহকরা অনলাইনে বুকিং করতে পারে না, ফোনে যোগাযোগ করতে হয় যা সময়সাপেক্ষ।'
      },
      {
        title: 'প্যাকেজ প্রদর্শনে সমস্যা',
        description: 'ট্যুর প্যাকেজ, হোটেল, ফ্লাইট তথ্য সুন্দরভাবে প্রদর্শন করা কঠিন।'
      },
      {
        title: 'পেমেন্ট সংগ্রহে ঝামেলা',
        description: 'অনলাইন পেমেন্ট নেওয়ার সুবিধা না থাকায় ব্যবসা হারাচ্ছেন।'
      },
      {
        title: 'গ্রাহক ফলো-আপে সমস্যা',
        description: 'বুকিং ট্র্যাকিং ও গ্রাহক ম্যানেজমেন্ট কঠিন।'
      },
      {
        title: 'প্রতিযোগিতায় পিছিয়ে',
        description: 'অনলাইন উপস্থিতি না থাকায় নতুন প্রজন্মের কাস্টমার হারাচ্ছেন।'
      },
      {
        title: 'বিশ্বাসযোগ্যতার অভাব',
        description: 'প্রফেশনাল ওয়েবসাইট না থাকায় কাস্টমার ট্রাস্ট কম।'
      }
    ],
    solution: {
      title: 'সম্পূর্ণ ট্রাভেল বুকিং সলিউশন',
      description: 'আপনার ট্রাভেল ব্যবসার জন্য কাস্টম ওয়েবসাইট যেখানে গ্রাহকরা সরাসরি বুকিং করতে পারবে, পেমেন্ট দিতে পারবে।'
    },
    features: [
      {
        icon: Calendar,
        title: 'অনলাইন বুকিং সিস্টেম',
        description: 'হজ্ব, উমরাহ, ট্যুর প্যাকেজের জন্য সরাসরি অনলাইন বুকিং নিন।'
      },
      {
        icon: Plane,
        title: 'ফ্লাইট ও হোটেল ইন্টিগ্রেশন',
        description: 'এয়ার টিকেট ও হোটেল বুকিং API ইন্টিগ্রেশন।'
      },
      {
        icon: CreditCard,
        title: 'অনলাইন পেমেন্ট',
        description: 'বিকাশ, নগদ, কার্ড পেমেন্ট গ্রহণ করুন সহজে।'
      },
      {
        icon: MapPin,
        title: 'ট্যুর প্যাকেজ শোকেস',
        description: 'সুন্দর গ্যালারি সহ আকর্ষণীয় প্যাকেজ প্রদর্শন।'
      },
      {
        icon: Users,
        title: 'গ্রুপ বুকিং ম্যানেজমেন্ট',
        description: 'হজ্ব গ্রুপ, ট্যুর গ্রুপ সহজে ম্যানেজ করুন।'
      },
      {
        icon: Shield,
        title: 'সিকিউর ও রিলায়েবল',
        description: 'SSL সার্টিফিকেট সহ সুরক্ষিত ওয়েবসাইট।'
      }
    ],
    pricing: {
      startingPrice: 25000,
      label: 'ট্রাভেল এজেন্সি ওয়েবসাইট',
      features: [
        'কাস্টম ডিজাইন',
        'অনলাইন বুকিং সিস্টেম',
        'প্যাকেজ ম্যানেজমেন্ট',
        'অনলাইন পেমেন্ট',
        'অ্যাডমিন প্যানেল',
        'মোবাইল রেসপন্সিভ',
        'SEO অপ্টিমাইজড',
        '৩ মাস ফ্রি সাপোর্ট'
      ]
    },
    faqs: [
      {
        question: 'ট্রাভেল ওয়েবসাইট তৈরিতে কতদিন লাগে?',
        answer: 'সাধারণ ফিচার সহ ১৫-২০ দিন। অ্যাডভান্সড ফিচার যেমন API ইন্টিগ্রেশন সহ ২৫-৩০ দিন সময় লাগে।'
      },
      {
        question: 'হজ্ব-উমরাহ বুকিং সিস্টেম কিভাবে কাজ করে?',
        answer: 'গ্রাহক প্যাকেজ সিলেক্ট করে ফর্ম পূরণ করবে, পাসপোর্ট আপলোড করবে এবং পেমেন্ট করবে। আপনি অ্যাডমিন প্যানেল থেকে সব ম্যানেজ করতে পারবেন।'
      },
      {
        question: 'পেমেন্ট গেটওয়ে কি কি ইন্টিগ্রেট করা যায়?',
        answer: 'বিকাশ, নগদ, রকেট, SSL Commerz সহ সব জনপ্রিয় পেমেন্ট গেটওয়ে ইন্টিগ্রেট করা যায়।'
      },
      {
        question: 'ওয়েবসাইটে ভিসা স্ট্যাটাস চেক করা যাবে?',
        answer: 'হ্যাঁ, গ্রাহকরা তাদের বুকিং আইডি দিয়ে ভিসা প্রসেসিং স্ট্যাটাস দেখতে পারবে।'
      },
      {
        question: 'মেইনটেন্যান্স সাপোর্ট কিভাবে পাবো?',
        answer: '৩ মাস ফ্রি সাপোর্ট থাকে। এরপর মাসিক/বার্ষিক সাপোর্ট প্যাকেজ নিতে পারবেন।'
      }
    ],
    caseStudy: {
      title: 'SM Elite Hajj - হজ্ব ট্রাভেলস ওয়েবসাইট',
      industry: 'Hajj & Umrah',
      result: 'অনলাইন বুকিং সিস্টেম চালু করে ৩ মাসে ৫০+ বুকিং পেয়েছেন।',
      link: '/bn/case-studies/smelitehajj',
      image: '/placeholder.svg'
    },
    relatedServices: [
      {
        title: 'ওয়েব ডেভেলপমেন্ট',
        link: '/bn/services/web-development',
        icon: Globe
      },
      {
        title: 'সফটওয়্যার ডেভেলপমেন্ট',
        link: '/bn/services/software-development',
        icon: Hotel
      },
      {
        title: 'মূল্য তালিকা',
        link: '/bn/pricing',
        icon: Star
      }
    ]
  };

  return <IndustryLandingTemplate data={data} />;
};

export default TravelAgencyWebsite;
