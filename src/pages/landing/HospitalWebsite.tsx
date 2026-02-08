import React from 'react';
import { IndustryLandingTemplate, IndustryLandingData } from '@/components/landing/IndustryLandingTemplate';
import { 
  Heart, 
  Calendar, 
  Users, 
  FileText, 
  Clock,
  Stethoscope,
  Pill,
  Activity,
  Phone,
  Shield,
  Building
} from 'lucide-react';

const HospitalWebsite: React.FC = () => {
  const data: IndustryLandingData = {
    slug: 'hospital-clinic-website-development',
    industry: 'Hospital & Clinic',
    heroHeadline: 'হাসপাতাল ও ক্লিনিকের জন্য আধুনিক ওয়েবসাইট',
    heroSubheadline: 'অনলাইন অ্যাপয়েন্টমেন্ট বুকিং, ডক্টর প্রোফাইল, ডিপার্টমেন্ট তথ্য সহ পূর্ণাঙ্গ হেলথকেয়ার ওয়েবসাইট সলিউশন।',
    metaTitle: 'হাসপাতাল ও ক্লিনিক ওয়েবসাইট ডেভেলপমেন্ট | DigiWebDex',
    metaDescription: 'হাসপাতাল, ক্লিনিক, ডায়াগনস্টিক সেন্টারের জন্য প্রফেশনাল ওয়েবসাইট। অনলাইন অ্যাপয়েন্টমেন্ট, ডক্টর প্রোফাইল, রিপোর্ট ডাউনলোড সিস্টেম।',
    keywords: [
      'hospital website bangladesh',
      'clinic website development',
      'হাসপাতাল ওয়েবসাইট',
      'doctor appointment website',
      'healthcare website bd',
      'diagnostic center website'
    ],
    painPoints: [
      {
        title: 'অ্যাপয়েন্টমেন্টে জটিলতা',
        description: 'রোগীদের ফোনে অ্যাপয়েন্টমেন্ট নিতে হয়, লম্বা অপেক্ষা করতে হয়।'
      },
      {
        title: 'ডক্টর তথ্য সহজে পাওয়া যায় না',
        description: 'কোন ডক্টর কোন দিন বসেন, স্পেশালাইজেশন কী - এসব খুঁজে পাওয়া কঠিন।'
      },
      {
        title: 'রিপোর্ট সংগ্রহে ঝামেলা',
        description: 'রোগীদের রিপোর্ট নিতে হাসপাতালে আসতে হয়।'
      },
      {
        title: 'সেবা সম্পর্কে স্বচ্ছতা নেই',
        description: 'কী কী সেবা পাওয়া যায়, খরচ কত - এসব জানার উপায় কম।'
      },
      {
        title: 'প্রতিযোগিতায় পিছিয়ে',
        description: 'অন্যান্য হাসপাতাল অনলাইনে এগিয়ে যাচ্ছে, আপনি পিছিয়ে পড়ছেন।'
      },
      {
        title: 'ব্র্যান্ড ইমেজ দুর্বল',
        description: 'প্রফেশনাল অনলাইন উপস্থিতি না থাকায় বিশ্বাসযোগ্যতা কম।'
      }
    ],
    solution: {
      title: 'সম্পূর্ণ হেলথকেয়ার ওয়েব সলিউশন',
      description: 'রোগীদের জন্য সহজ অনলাইন অভিজ্ঞতা এবং আপনার জন্য দক্ষ ম্যানেজমেন্ট সিস্টেম।'
    },
    features: [
      {
        icon: Calendar,
        title: 'অনলাইন অ্যাপয়েন্টমেন্ট',
        description: 'রোগী ঘরে বসে ডক্টরের সাথে অ্যাপয়েন্টমেন্ট বুক করতে পারবে।'
      },
      {
        icon: Stethoscope,
        title: 'ডক্টর প্রোফাইল ও শিডিউল',
        description: 'প্রতি ডক্টরের বিস্তারিত প্রোফাইল ও সাপ্তাহিক শিডিউল।'
      },
      {
        icon: Building,
        title: 'ডিপার্টমেন্ট ও সেবা তালিকা',
        description: 'সব ডিপার্টমেন্ট ও সেবার বিস্তারিত তথ্য।'
      },
      {
        icon: FileText,
        title: 'অনলাইন রিপোর্ট ডাউনলোড',
        description: 'রোগী অনলাইনে তার টেস্ট রিপোর্ট দেখতে ও ডাউনলোড করতে পারবে।'
      },
      {
        icon: Activity,
        title: 'হেলথ প্যাকেজ',
        description: 'হেলথ চেকআপ প্যাকেজ প্রদর্শন ও বুকিং সুবিধা।'
      },
      {
        icon: Clock,
        title: 'ইমার্জেন্সি হটলাইন',
        description: 'ক্লিক-টু-কল ইমার্জেন্সি নম্বর সব পেজে দৃশ্যমান।'
      }
    ],
    pricing: {
      startingPrice: 30000,
      label: 'হাসপাতাল/ক্লিনিক ওয়েবসাইট',
      features: [
        'কাস্টম ডিজাইন',
        'অনলাইন অ্যাপয়েন্টমেন্ট সিস্টেম',
        'ডক্টর প্রোফাইল ম্যানেজমেন্ট',
        'ডিপার্টমেন্ট পেজ',
        'রিপোর্ট ডাউনলোড সিস্টেম',
        'অ্যাডমিন প্যানেল',
        'মোবাইল রেসপন্সিভ',
        'SEO অপ্টিমাইজড',
        '৩ মাস ফ্রি সাপোর্ট'
      ]
    },
    faqs: [
      {
        question: 'রোগী কিভাবে অ্যাপয়েন্টমেন্ট নেবে?',
        answer: 'রোগী ডক্টর ও তারিখ সিলেক্ট করে ফর্ম পূরণ করবে। আপনি SMS/Email এ নোটিফিকেশন পাবেন এবং অ্যাডমিন প্যানেল থেকে কনফার্ম করবেন।'
      },
      {
        question: 'রিপোর্ট ডাউনলোড সিস্টেম কিভাবে কাজ করে?',
        answer: 'আপনি অ্যাডমিন প্যানেল থেকে রোগীর রিপোর্ট PDF আপলোড করবেন। রোগী তার ফোন নম্বর ও আইডি দিয়ে লগইন করে ডাউনলোড করতে পারবে।'
      },
      {
        question: 'একাধিক ব্র্যাঞ্চের তথ্য দেওয়া যাবে?',
        answer: 'হ্যাঁ, প্রতি ব্র্যাঞ্চের আলাদা পেজ থাকবে লোকেশন, যোগাযোগ ও ডক্টর তথ্য সহ।'
      },
      {
        question: 'টেলিমেডিসিন/ভিডিও কনসালটেশন যোগ করা যাবে?',
        answer: 'হ্যাঁ, অনলাইন ভিডিও কনসালটেশন বুকিং ও পেমেন্ট সিস্টেম যোগ করা যায়।'
      },
      {
        question: 'হেলথ ব্লগ সেকশন থাকবে?',
        answer: 'অবশ্যই, হেলথ টিপস, আর্টিকেল পোস্ট করার জন্য ব্লগ সেকশন থাকবে যা SEO তেও সাহায্য করবে।'
      }
    ],
    caseStudy: {
      title: 'DMCH Cardiology - কার্ডিওলজি ক্লিনিক',
      industry: 'Healthcare',
      result: 'অনলাইন অ্যাপয়েন্টমেন্ট চালু করে রোগী অপেক্ষার সময় ৬০% কমেছে।',
      link: '/bn/case-studies/dmchcardiology'
    },
    relatedServices: [
      {
        title: 'ওয়েব ডেভেলপমেন্ট',
        link: '/bn/services/web-development',
        icon: Heart
      },
      {
        title: 'সফটওয়্যার ডেভেলপমেন্ট',
        link: '/bn/services/software-development',
        icon: Activity
      },
      {
        title: 'মূল্য তালিকা',
        link: '/bn/pricing',
        icon: Pill
      }
    ]
  };

  return <IndustryLandingTemplate data={data} />;
};

export default HospitalWebsite;
