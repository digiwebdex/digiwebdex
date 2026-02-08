import React from 'react';
import { IndustryLandingTemplate, IndustryLandingData } from '@/components/landing/IndustryLandingTemplate';
import { 
  ShoppingBag, 
  Palette, 
  CreditCard, 
  Truck, 
  RefreshCw,
  Star,
  Image,
  Tag,
  Users,
  BarChart,
  Smartphone
} from 'lucide-react';

const FashionEcommerce: React.FC = () => {
  const data: IndustryLandingData = {
    slug: 'ecommerce-website-for-fashion-brand',
    industry: 'Fashion E-commerce',
    heroHeadline: 'ফ্যাশন ব্র্যান্ডের জন্য প্রফেশনাল ই-কমার্স ওয়েবসাইট',
    heroSubheadline: 'জামা-কাপড়, জুয়েলারি, কসমেটিক্স বিক্রি করুন নিজস্ব অনলাইন স্টোরে। সাইজ ভ্যারিয়েন্ট, কালার অপশন, ইনভেন্টরি ম্যানেজমেন্ট সহ।',
    metaTitle: 'ফ্যাশন ই-কমার্স ওয়েবসাইট বাংলাদেশ | DigiWebDex',
    metaDescription: 'ফ্যাশন ব্র্যান্ড ও ক্লোদিং বিজনেসের জন্য ই-কমার্স ওয়েবসাইট। প্রোডাক্ট ভ্যারিয়েন্ট, অনলাইন পেমেন্ট, ইনভেন্টরি সিস্টেম সহ।',
    keywords: [
      'fashion ecommerce website bangladesh',
      'clothing store website bd',
      'ফ্যাশন ওয়েবসাইট',
      'online boutique website',
      'jewelry website development',
      'cosmetics ecommerce bd'
    ],
    painPoints: [
      {
        title: 'ফেসবুক পেজে সীমাবদ্ধতা',
        description: 'শুধু ফেসবুকে বিক্রি করলে প্রোডাক্ট অর্গানাইজ করা কঠিন, পেমেন্ট ট্র্যাক করা যায় না।'
      },
      {
        title: 'সাইজ ও কালার ম্যানেজমেন্ট কঠিন',
        description: 'একটি প্রোডাক্টে একাধিক সাইজ ও কালার থাকলে স্টক ম্যানেজ করা কষ্টকর।'
      },
      {
        title: 'অর্ডার ট্র্যাকিং নেই',
        description: 'কাস্টমার অর্ডার স্ট্যাটাস জানতে পারে না, ম্যানুয়ালি জানাতে হয়।'
      },
      {
        title: 'ব্র্যান্ড ভ্যালু তৈরি হচ্ছে না',
        description: 'নিজস্ব ওয়েবসাইট না থাকায় প্রফেশনাল ব্র্যান্ড ইমেজ তৈরি হচ্ছে না।'
      },
      {
        title: 'রিপিট কাস্টমার ধরে রাখা কঠিন',
        description: 'কাস্টমার ডাটাবেস না থাকায় রিটার্নিং কাস্টমারদের ট্র্যাক করা যায় না।'
      },
      {
        title: 'স্কেল করা সম্ভব না',
        description: 'ম্যানুয়াল প্রসেসে দৈনিক ১০০+ অর্ডার হ্যান্ডেল করা অসম্ভব।'
      }
    ],
    solution: {
      title: 'পূর্ণাঙ্গ ফ্যাশন ই-কমার্স সলিউশন',
      description: 'সুন্দর ডিজাইন, পাওয়ারফুল ব্যাকএন্ড, সহজ ম্যানেজমেন্ট - আপনার ফ্যাশন ব্র্যান্ডকে নতুন উচ্চতায় নিয়ে যান।'
    },
    features: [
      {
        icon: Palette,
        title: 'সাইজ ও কালার ভ্যারিয়েন্ট',
        description: 'প্রতি প্রোডাক্টে মাল্টিপল সাইজ, কালার ও স্টক ম্যানেজমেন্ট।'
      },
      {
        icon: Image,
        title: 'হাই-কোয়ালিটি গ্যালারি',
        description: 'প্রোডাক্ট জুম, মাল্টিপল ইমেজ, ভিডিও সাপোর্ট।'
      },
      {
        icon: CreditCard,
        title: 'সিকিউর চেকআউট',
        description: 'বিকাশ, নগদ, কার্ড ও ক্যাশ অন ডেলিভারি।'
      },
      {
        icon: Truck,
        title: 'কুরিয়ার ইন্টিগ্রেশন',
        description: 'Pathao, Steadfast, Paperfly সহ অটো শিপিং।'
      },
      {
        icon: Tag,
        title: 'ডিসকাউন্ট ও কুপন',
        description: 'সেল, কুপন কোড, বান্ডল অফার সেট করুন।'
      },
      {
        icon: BarChart,
        title: 'সেলস রিপোর্ট',
        description: 'ডেইলি, উইকলি, মান্থলি সেলস অ্যানালিটিক্স।'
      }
    ],
    pricing: {
      startingPrice: 40000,
      label: 'ফ্যাশন ই-কমার্স ওয়েবসাইট',
      features: [
        'কাস্টম ব্র্যান্ডেড ডিজাইন',
        'আনলিমিটেড প্রোডাক্ট',
        'সাইজ/কালার ভ্যারিয়েন্ট',
        'ইনভেন্টরি ম্যানেজমেন্ট',
        'অনলাইন পেমেন্ট',
        'কুরিয়ার ইন্টিগ্রেশন',
        'কুপন সিস্টেম',
        'অ্যাডমিন ড্যাশবোর্ড',
        'SEO অপ্টিমাইজড',
        '৬ মাস ফ্রি সাপোর্ট'
      ]
    },
    faqs: [
      {
        question: 'প্রোডাক্ট নিজে আপলোড করতে পারব?',
        answer: 'হ্যাঁ, অ্যাডমিন প্যানেল থেকে প্রোডাক্ট, ক্যাটাগরি, ভ্যারিয়েন্ট সব ম্যানেজ করতে পারবেন। বাল্ক আপলোড অপশনও আছে।'
      },
      {
        question: 'কুরিয়ার কিভাবে ইন্টিগ্রেট হবে?',
        answer: 'Pathao, Steadfast, Paperfly এর API ইন্টিগ্রেট করা হবে। অর্ডার কনফার্ম করলে অটোমেটিক পিকআপ রিকোয়েস্ট যাবে।'
      },
      {
        question: 'ক্যাশ অন ডেলিভারি চালু করা যাবে?',
        answer: 'অবশ্যই, COD অপশন থাকবে এবং ডেলিভারি চার্জ এলাকা অনুযায়ী সেট করতে পারবেন।'
      },
      {
        question: 'মোবাইল অ্যাপ লাগবে?',
        answer: 'ওয়েবসাইট সম্পূর্ণ মোবাইল ফ্রেন্ডলি হবে। প্রয়োজনে পরে অ্যাপ ডেভেলপ করা যাবে।'
      },
      {
        question: 'ফেসবুক শপ/ইনস্টাগ্রামে লিংক করা যাবে?',
        answer: 'হ্যাঁ, Facebook Catalog ও Instagram Shopping এর সাথে ইন্টিগ্রেট করা যাবে।'
      }
    ],
    relatedServices: [
      {
        title: 'ওয়েব ডেভেলপমেন্ট',
        link: '/bn/services/web-development',
        icon: ShoppingBag
      },
      {
        title: 'ডিজিটাল মার্কেটিং',
        link: '/bn/services/digital-marketing',
        icon: Users
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

export default FashionEcommerce;
