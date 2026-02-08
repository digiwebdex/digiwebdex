import React from 'react';
import { IndustryLandingTemplate, IndustryLandingData } from '@/components/landing/IndustryLandingTemplate';
import { 
  UtensilsCrossed, 
  ShoppingCart, 
  Clock, 
  MapPin, 
  Phone,
  Star,
  Image,
  CreditCard,
  Users,
  Truck,
  Menu
} from 'lucide-react';

const RestaurantWebsite: React.FC = () => {
  const data: IndustryLandingData = {
    slug: 'restaurant-website-design-bangladesh',
    industry: 'Restaurant',
    heroHeadline: 'রেস্টুরেন্টের জন্য অনলাইন অর্ডারিং ওয়েবসাইট',
    heroSubheadline: 'অনলাইন মেনু, টেবিল রিজার্ভেশন, ফুড অর্ডারিং সিস্টেম সহ আধুনিক রেস্টুরেন্ট ওয়েবসাইট। আপনার ব্র্যান্ড বড় করুন।',
    metaTitle: 'রেস্টুরেন্ট ওয়েবসাইট ডিজাইন বাংলাদেশ | DigiWebDex',
    metaDescription: 'রেস্টুরেন্ট ও ফুড বিজনেসের জন্য প্রফেশনাল ওয়েবসাইট। অনলাইন মেনু, অর্ডারিং সিস্টেম, টেবিল বুকিং, ডেলিভারি ট্র্যাকিং সহ।',
    keywords: [
      'restaurant website bangladesh',
      'রেস্টুরেন্ট ওয়েবসাইট',
      'online food ordering website',
      'food delivery website bd',
      'cafe website design',
      'restaurant menu website'
    ],
    painPoints: [
      {
        title: 'অনলাইন অর্ডার নেওয়া যায় না',
        description: 'ফোনে অর্ডার নিতে হয়, ভুল হয়, টাইম লাগে।'
      },
      {
        title: 'মেনু আপডেট করা কঠিন',
        description: 'নতুন আইটেম যোগ বা দাম পরিবর্তনে সমস্যা।'
      },
      {
        title: 'টেবিল রিজার্ভেশন ম্যানুয়াল',
        description: 'ফোনে বুকিং নিতে হয়, ডাবল বুকিং হয়ে যায়।'
      },
      {
        title: 'প্রতিযোগিতায় পিছিয়ে',
        description: 'অন্য রেস্টুরেন্ট অনলাইনে এগিয়ে, আপনি পিছিয়ে।'
      },
      {
        title: 'ব্র্যান্ড বিল্ডিং হচ্ছে না',
        description: 'শুধু ফুডপান্ডায় নির্ভর করে নিজস্ব ব্র্যান্ড তৈরি হচ্ছে না।'
      },
      {
        title: 'কাস্টমার ডাটা নেই',
        description: 'কাস্টমারের কন্ট্যাক্ট, অর্ডার হিস্ট্রি জানার উপায় নেই।'
      }
    ],
    solution: {
      title: 'সম্পূর্ণ রেস্টুরেন্ট ডিজিটাল সলিউশন',
      description: 'নিজস্ব ওয়েবসাইট থেকে অর্ডার নিন, ব্র্যান্ড বড় করুন, কমিশন বাঁচান।'
    },
    features: [
      {
        icon: Menu,
        title: 'ডিজিটাল মেনু',
        description: 'সুন্দর ফটো ও ক্যাটাগরি সহ ইন্টারেক্টিভ মেনু।'
      },
      {
        icon: ShoppingCart,
        title: 'অনলাইন অর্ডারিং',
        description: 'কাস্টমার সরাসরি ওয়েবসাইট থেকে অর্ডার করতে পারবে।'
      },
      {
        icon: Users,
        title: 'টেবিল রিজার্ভেশন',
        description: 'অনলাইনে টেবিল বুকিং ও ক্যালেন্ডার ভিউ।'
      },
      {
        icon: CreditCard,
        title: 'অনলাইন পেমেন্ট',
        description: 'বিকাশ, নগদ, কার্ড পেমেন্ট ইন্টিগ্রেশন।'
      },
      {
        icon: Truck,
        title: 'ডেলিভারি জোন ম্যানেজমেন্ট',
        description: 'এলাকা অনুযায়ী ডেলিভারি চার্জ সেট করুন।'
      },
      {
        icon: Star,
        title: 'রিভিউ ও রেটিং',
        description: 'কাস্টমার রিভিউ সংগ্রহ করে বিশ্বাসযোগ্যতা বাড়ান।'
      }
    ],
    pricing: {
      startingPrice: 20000,
      label: 'রেস্টুরেন্ট ওয়েবসাইট',
      features: [
        'কাস্টম ডিজাইন',
        'ডিজিটাল মেনু',
        'অনলাইন অর্ডারিং সিস্টেম',
        'টেবিল রিজার্ভেশন',
        'অনলাইন পেমেন্ট',
        'অ্যাডমিন প্যানেল',
        'মোবাইল রেসপন্সিভ',
        'WhatsApp নোটিফিকেশন',
        '৩ মাস ফ্রি সাপোর্ট'
      ]
    },
    faqs: [
      {
        question: 'মেনু নিজে আপডেট করতে পারব?',
        answer: 'হ্যাঁ, সহজ অ্যাডমিন প্যানেল থেকে আইটেম যোগ, দাম পরিবর্তন, ছবি আপলোড সব করতে পারবেন।'
      },
      {
        question: 'অর্ডার পেলে কিভাবে জানব?',
        answer: 'নতুন অর্ডার আসলে WhatsApp, SMS ও Email এ নোটিফিকেশন পাবেন। অ্যাডমিন প্যানেলেও দেখতে পারবেন।'
      },
      {
        question: 'একাধিক ব্র্যাঞ্চ থাকলে কি হবে?',
        answer: 'প্রতি ব্র্যাঞ্চের আলাদা মেনু, অর্ডার ম্যানেজমেন্ট ও ডেলিভারি জোন সেট করা যাবে।'
      },
      {
        question: 'QR কোড মেনু পাওয়া যাবে?',
        answer: 'হ্যাঁ, প্রতি টেবিলের জন্য QR কোড জেনারেট করে প্রিন্ট করতে পারবেন।'
      },
      {
        question: 'ফুডপান্ডার সাথে ইন্টিগ্রেট করা যাবে?',
        answer: 'না, এটি আপনার নিজস্ব প্ল্যাটফর্ম যেখানে কোনো কমিশন দিতে হবে না। তবে ফুডপান্ডা আলাদাভাবে চালাতে পারবেন।'
      }
    ],
    relatedServices: [
      {
        title: 'ওয়েব ডেভেলপমেন্ট',
        link: '/bn/services/web-development',
        icon: UtensilsCrossed
      },
      {
        title: 'ই-কমার্স সলিউশন',
        link: '/bn/pricing',
        icon: ShoppingCart
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

export default RestaurantWebsite;
