import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, ExternalLink, Palette, Search, Zap, Settings, Globe } from 'lucide-react';

// Import portfolio images
import alhadasImg from '@/assets/portfolio/alhadas-construction.jpg';
import gatebdImg from '@/assets/portfolio/gatebdgroup.jpg';
import primelawyersImg from '@/assets/portfolio/primelawyersbd.jpg';
import sandwichpanelImg from '@/assets/portfolio/sandwichpanel.jpg';
import titasbuildImg from '@/assets/portfolio/titasbuild.jpg';
import znlabsImg from '@/assets/portfolio/znlaboratories.jpg';
import divisoriaImg from '@/assets/portfolio/divisoriaksa.jpg';
import dailysushashonImg from '@/assets/portfolio/dailysushashon.jpg';
import dmchImg from '@/assets/portfolio/dmchcardiology.jpg';
import rxpromedImg from '@/assets/portfolio/rxpromed.jpg';
import smelitehajjSoftImg from '@/assets/portfolio/smelitehajj-soft.jpg';
import darulfurkanImg from '@/assets/portfolio/darulfurkantravels.jpg';
import smelitehajjImg from '@/assets/portfolio/smelitehajj.jpg';
import zenithoverseasImg from '@/assets/portfolio/zenithoverseasbd.jpg';
import rofroftravelsImg from '@/assets/portfolio/rofroftravels.jpg';
import seventripImg from '@/assets/portfolio/seventrip.jpg';
import rahekabatravelsImg from '@/assets/portfolio/rahekabatravels.jpg';

interface Project {
  id: string;
  name: string;
  url: string;
  category: string;
  industry: string;
  contributions: string[];
  screenshot: string;
}

const categories = [
  { id: 'all', labelEn: 'All Projects', labelBn: 'সব প্রজেক্ট' },
  { id: 'corporate', labelEn: 'Business / Corporate', labelBn: 'বিজনেস / কর্পোরেট' },
  { id: 'ecommerce', labelEn: 'eCommerce', labelBn: 'ই-কমার্স' },
  { id: 'news', labelEn: 'News Portal', labelBn: 'নিউজ পোর্টাল' },
  { id: 'software', labelEn: 'Custom Software', labelBn: 'কাস্টম সফটওয়্যার' },
  { id: 'travel', labelEn: 'Tours & Travel', labelBn: 'ট্যুরস এন্ড ট্রাভেল' },
];

const projects: Project[] = [
  // Business / Corporate
  {
    id: '1',
    name: 'Al Hadas Construction',
    url: 'alhadasconstruction.com',
    category: 'corporate',
    industry: 'Construction',
    contributions: ['UI/UX', 'SEO', 'Performance'],
    screenshot: alhadasImg,
  },
  {
    id: '2',
    name: 'Gate BD Group',
    url: 'gatebdgroup.com',
    category: 'corporate',
    industry: 'Business Group',
    contributions: ['UI/UX', 'Automation', 'SEO'],
    screenshot: gatebdImg,
  },
  {
    id: '3',
    name: 'Prime Lawyers BD',
    url: 'primelawyersbd.com',
    category: 'corporate',
    industry: 'Legal Services',
    contributions: ['UI/UX', 'SEO', 'Performance'],
    screenshot: primelawyersImg,
  },
  {
    id: '4',
    name: 'Sandwich Panel BD',
    url: 'sandwichpaneltlbd.com',
    category: 'corporate',
    industry: 'Manufacturing',
    contributions: ['UI/UX', 'Performance', 'SEO'],
    screenshot: sandwichpanelImg,
  },
  {
    id: '5',
    name: 'Titas Build',
    url: 'titasbuild.com',
    category: 'corporate',
    industry: 'Construction',
    contributions: ['UI/UX', 'SEO', 'Automation'],
    screenshot: titasbuildImg,
  },
  {
    id: '6',
    name: 'ZN Laboratories',
    url: 'znlaboratories.com',
    category: 'corporate',
    industry: 'Healthcare Lab',
    contributions: ['UI/UX', 'Performance', 'SEO'],
    screenshot: znlabsImg,
  },
  // eCommerce
  {
    id: '7',
    name: 'Divisoria KSA',
    url: 'divisoriaksa.com',
    category: 'ecommerce',
    industry: 'Online Store',
    contributions: ['UI/UX', 'SEO', 'Performance', 'Automation'],
    screenshot: divisoriaImg,
  },
  // News Portal
  {
    id: '8',
    name: 'Daily Sushashon',
    url: 'dailysushashon.com',
    category: 'news',
    industry: 'News Media',
    contributions: ['UI/UX', 'SEO', 'Performance'],
    screenshot: dailysushashonImg,
  },
  // Custom Software
  {
    id: '9',
    name: 'DMCH Cardiology',
    url: 'dmchcardiology.com',
    category: 'software',
    industry: 'Healthcare',
    contributions: ['UI/UX', 'Automation', 'Performance'],
    screenshot: dmchImg,
  },
  {
    id: '10',
    name: 'RX Pro Med',
    url: 'rxpromed.com',
    category: 'software',
    industry: 'Medical Software',
    contributions: ['UI/UX', 'Automation', 'SEO'],
    screenshot: rxpromedImg,
  },
  {
    id: '11',
    name: 'SM Elite Hajj Software',
    url: 'soft.smelitehajj.com',
    category: 'software',
    industry: 'Travel Management',
    contributions: ['UI/UX', 'Automation', 'Performance'],
    screenshot: smelitehajjSoftImg,
  },
  // Tours & Travel
  {
    id: '12',
    name: 'Darul Furkan Travels',
    url: 'darulfurkantravels.com',
    category: 'travel',
    industry: 'Hajj & Umrah',
    contributions: ['UI/UX', 'SEO', 'Performance'],
    screenshot: darulfurkanImg,
  },
  {
    id: '13',
    name: 'SM Elite Hajj',
    url: 'smelitehajj.com',
    category: 'travel',
    industry: 'Hajj & Umrah',
    contributions: ['UI/UX', 'SEO', 'Automation'],
    screenshot: smelitehajjImg,
  },
  {
    id: '14',
    name: 'Zenith Overseas',
    url: 'zenithoverseasbd.com',
    category: 'travel',
    industry: 'Visa & Travel',
    contributions: ['UI/UX', 'SEO', 'Performance'],
    screenshot: zenithoverseasImg,
  },
  {
    id: '15',
    name: 'Rofrof Travels',
    url: 'rofroftravels.com',
    category: 'travel',
    industry: 'Hajj & Umrah',
    contributions: ['UI/UX', 'SEO', 'Performance'],
    screenshot: rofroftravelsImg,
  },
  {
    id: '16',
    name: 'Seven Trip',
    url: 'seventrip.net',
    category: 'travel',
    industry: 'Hajj & Umrah',
    contributions: ['UI/UX', 'SEO', 'Performance'],
    screenshot: seventripImg,
  },
  {
    id: '17',
    name: 'Rahe Kaba Travels',
    url: 'rahekabatravels.com',
    category: 'travel',
    industry: 'Hajj & Umrah',
    contributions: ['UI/UX', 'SEO', 'Performance'],
    screenshot: rahekabatravelsImg,
  },
];

const contributionIcons: Record<string, React.ReactNode> = {
  'UI/UX': <Palette className="w-3 h-3" />,
  'SEO': <Search className="w-3 h-3" />,
  'Performance': <Zap className="w-3 h-3" />,
  'Automation': <Settings className="w-3 h-3" />,
};

export function PortfolioCategorySection() {
  const { language } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProjects = activeCategory === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <section className="section-padding relative overflow-hidden bg-gradient-to-b from-background via-secondary/20 to-background">
      {/* Background Effects */}
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Globe className="w-4 h-4" />
            {language === 'bn' ? 'আমাদের পোর্টফোলিও' : 'Our Portfolio'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-slide-up">
            {language === 'bn' ? (
              <>সফল <span className="gradient-text">প্রজেক্টসমূহ</span> দেখুন</>
            ) : (
              <>Explore Our <span className="gradient-text">Success Stories</span></>
            )}
          </h2>
          <p className="text-lg text-muted-foreground animate-slide-up delay-100">
            {language === 'bn'
              ? 'আমাদের সম্পন্ন করা প্রজেক্টগুলো দেখুন এবং আপনার প্রজেক্টের জন্য অনুপ্রেরণা নিন'
              : 'Browse our completed projects and get inspired for your next venture'}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-10 animate-slide-up delay-200">
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full max-w-4xl">
            <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent p-0">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-secondary/50 data-[state=inactive]:hover:bg-secondary"
                >
                  {language === 'bn' ? cat.labelBn : cat.labelEn}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up delay-300">
          {filteredProjects.map((project, index) => (
            <a
              key={project.id}
              href={`https://${project.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl overflow-hidden bg-card border shadow-lg hover:shadow-2xl transition-all duration-500 card-shine"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Screenshot */}
              <div className="aspect-[16/10] relative overflow-hidden">
                <img
                  src={project.screenshot}
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/20">
                    {project.industry}
                  </span>
                </div>

                {/* External Link Icon */}
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <ExternalLink className="h-5 w-5 text-white" />
                  </div>
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:translate-y-0 translate-y-1 transition-transform duration-300">
                    {project.name}
                  </h3>
                  <p className="text-sm text-white/70 mb-3 font-mono">
                    {project.url}
                  </p>
                  
                  {/* Contribution Tags */}
                  <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                    {project.contributions.map((contrib) => (
                      <span
                        key={contrib}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/80 text-primary-foreground"
                      >
                        {contributionIcons[contrib]}
                        {contrib}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Stats Row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-slide-up delay-400">
          {[
            { value: '17+', label: language === 'bn' ? 'লাইভ প্রজেক্ট' : 'Live Projects' },
            { value: '5', label: language === 'bn' ? 'ইন্ডাস্ট্রি' : 'Industries' },
            { value: '100%', label: language === 'bn' ? 'ক্লায়েন্ট সন্তুষ্টি' : 'Client Satisfaction' },
            { value: '24/7', label: language === 'bn' ? 'সাপোর্ট' : 'Support' },
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 rounded-2xl glass-card">
              <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center animate-slide-up delay-500">
          <div className="inline-block p-8 md:p-12 rounded-3xl glass-card max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              {language === 'bn' 
                ? 'আপনার প্রজেক্ট শুরু করুন' 
                : 'Start Your Project Today'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {language === 'bn'
                ? 'আমাদের এক্সপার্ট টিমের সাথে আপনার আইডিয়া শেয়ার করুন এবং দেখুন কিভাবে আমরা আপনার বিজনেস ট্রান্সফর্ম করতে পারি'
                : 'Share your ideas with our expert team and see how we can transform your business'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-button h-12 px-8" asChild>
                <Link to={`${basePath}/contact`}>
                  {language === 'bn' ? 'ফ্রি কনসালটেশন নিন' : 'Get Free Consultation'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                <a href="https://wa.me/8801700000000" target="_blank" rel="noopener noreferrer">
                  {language === 'bn' ? 'WhatsApp-এ মেসেজ করুন' : 'Message on WhatsApp'}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
