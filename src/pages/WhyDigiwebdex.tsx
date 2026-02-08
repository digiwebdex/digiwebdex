import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { MultiSchemaMarkup } from '@/components/seo/SchemaMarkup';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Target, 
  Eye, 
  Users, 
  Award, 
  Code, 
  Rocket,
  Heart,
  Shield,
  Clock,
  CheckCircle,
  Star,
  MessageCircle,
  Phone
} from 'lucide-react';
import { seoService } from '@/services/seo';
import logo from '@/assets/logo.png';

// Timeline data
const journeyTimeline = [
  { year: '2020', title: { en: 'Journey Begins', bn: 'যাত্রা শুরু' }, description: { en: 'Started as a freelance web developer with a vision to help local businesses go digital.', bn: 'স্থানীয় ব্যবসাগুলোকে ডিজিটাল করার লক্ষ্যে ফ্রিল্যান্স ওয়েব ডেভেলপার হিসেবে যাত্রা শুরু।' } },
  { year: '2021', title: { en: 'Team Formation', bn: 'টিম গঠন' }, description: { en: 'Assembled a team of passionate developers and designers.', bn: 'উৎসাহী ডেভেলপার এবং ডিজাইনারদের নিয়ে টিম গঠন।' } },
  { year: '2022', title: { en: 'DigiWebDex Founded', bn: 'ডিজিওয়েবডেক্স প্রতিষ্ঠা' }, description: { en: 'Officially launched DigiWebDex as a full-service digital agency.', bn: 'পূর্ণ-সেবা ডিজিটাল এজেন্সি হিসেবে ডিজিওয়েবডেক্স আনুষ্ঠানিকভাবে চালু।' } },
  { year: '2023', title: { en: '100+ Projects', bn: '১০০+ প্রজেক্ট' }, description: { en: 'Completed 100+ successful projects across various industries.', bn: 'বিভিন্ন শিল্পে ১০০+ সফল প্রজেক্ট সম্পন্ন।' } },
  { year: '2024', title: { en: 'Expanding Horizons', bn: 'সীমানা বিস্তার' }, description: { en: 'Expanded services globally while maintaining local expertise.', bn: 'স্থানীয় দক্ষতা বজায় রেখে বিশ্বব্যাপী সেবা সম্প্রসারণ।' } },
];

// Team members (placeholder - can be made dynamic later)
const teamMembers = [
  { name: 'Founder & CEO', role: { en: 'Visionary Leader', bn: 'দূরদর্শী নেতা' }, avatar: '👨‍💼' },
  { name: 'Lead Developer', role: { en: 'Tech Expert', bn: 'টেক বিশেষজ্ঞ' }, avatar: '👨‍💻' },
  { name: 'UI/UX Designer', role: { en: 'Creative Mind', bn: 'সৃজনশীল মন' }, avatar: '🎨' },
  { name: 'Project Manager', role: { en: 'Operations Lead', bn: 'অপারেশন লিড' }, avatar: '📋' },
];

// Tech stack
const techStack = [
  { name: 'React', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'TypeScript', category: 'Language' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'Supabase', category: 'Backend' },
  { name: 'Tailwind CSS', category: 'Styling' },
  { name: 'WordPress', category: 'CMS' },
  { name: 'Laravel', category: 'Backend' },
  { name: 'Flutter', category: 'Mobile' },
];

// Certifications/achievements
const achievements = [
  { icon: Award, label: { en: '100+ Happy Clients', bn: '১০০+ সন্তুষ্ট ক্লায়েন্ট' } },
  { icon: CheckCircle, label: { en: '150+ Projects Delivered', bn: '১৫০+ প্রজেক্ট ডেলিভারি' } },
  { icon: Star, label: { en: '5.0 Average Rating', bn: '৫.০ গড় রেটিং' } },
  { icon: Clock, label: { en: '4+ Years Experience', bn: '৪+ বছরের অভিজ্ঞতা' } },
];

// Client logos (using placeholders)
const clientLogos = [
  'SM Elite Hajj', 'Gate BD Group', 'ZN Laboratories', 'DMCH Cardiology', 
  'Prime Lawyers BD', 'Titas Build', 'Divisoria KSA', 'DailyShushashon'
];

export default function WhyDigiwebdex() {
  const { language } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';
  const baseUrl = 'https://digiwebdex.com';

  // SEO schemas
  const breadcrumbSchema = seoService.generateBreadcrumbSchema([
    { name: language === 'bn' ? 'হোম' : 'Home', url: baseUrl },
    { name: language === 'bn' ? 'কেন ডিজিওয়েবডেক্স' : 'Why DigiWebDex', url: `${baseUrl}${basePath}/why-digiwebdex` }
  ]);
  const organizationSchema = seoService.generateOrganizationSchema();

  return (
    <Layout>
      <SEOHead
        title={language === 'bn' ? 'কেন ডিজিওয়েবডেক্স - আমাদের সম্পর্কে' : 'Why DigiWebDex - About Us'}
        description={language === 'bn' 
          ? 'ডিজিওয়েবডেক্স বাংলাদেশের একটি প্রিমিয়াম ডিজিটাল এজেন্সি। আমাদের যাত্রা, টিম, মিশন ও ভিশন জানুন। ১০০+ সফল প্রজেক্ট ও ৫.০ রেটিং।'
          : 'DigiWebDex is a premium digital agency in Bangladesh. Learn about our journey, team, mission & vision. 100+ successful projects & 5.0 rating.'}
        keywords={['digiwebdex', 'about us', 'digital agency bangladesh', 'আমাদের সম্পর্কে', 'ডিজিটাল এজেন্সি']}
        canonicalUrl={`${baseUrl}${basePath}/why-digiwebdex`}
      />
      <MultiSchemaMarkup schemas={[
        { schema: breadcrumbSchema, id: 'breadcrumb-schema' },
        { schema: organizationSchema, id: 'organization-schema' }
      ]} />

      {/* Breadcrumb */}
      <div className="bg-muted/30 py-3 border-b border-border/50">
        <div className="container-custom">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={basePath}>{language === 'bn' ? 'হোম' : 'Home'}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{language === 'bn' ? 'কেন ডিজিওয়েবডেক্স' : 'Why DigiWebDex'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0" style={{ background: 'var(--gradient-mesh)' }} />
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <img src={logo} alt="DigiWebDex" className="w-24 h-24 mx-auto mb-6 object-contain" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {language === 'bn' ? 'কেন ডিজিওয়েবডেক্স?' : 'Why DigiWebDex?'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {language === 'bn'
                ? 'আমরা শুধু ওয়েবসাইট বানাই না, আমরা আপনার ব্যবসার ডিজিটাল সাফল্যের অংশীদার হই।'
                : "We don't just build websites, we become partners in your digital success."}
            </p>

            {/* Achievement Badges */}
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-full border border-border/50">
                  <achievement.icon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{achievement.label[language]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                📖 {language === 'bn' ? 'আমাদের গল্প' : 'Our Story'}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold">
                {language === 'bn' ? 'যেভাবে শুরু হলো যাত্রা' : 'How It All Started'}
              </h2>
            </div>

            <Card className="glass-card">
              <CardContent className="p-8 md:p-10">
                <div className="flex items-start gap-6">
                  <div className="hidden md:block">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl">
                      🚀
                    </div>
                  </div>
                  <div>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                      {language === 'bn'
                        ? 'ডিজিওয়েবডেক্স শুরু হয়েছিল একটি সাধারণ পর্যবেক্ষণ থেকে - বাংলাদেশের অনেক ছোট ও মাঝারি ব্যবসা ডিজিটাল দুনিয়ায় পিছিয়ে আছে শুধুমাত্র সঠিক সাপোর্টের অভাবে।'
                        : 'DigiWebDex started from a simple observation - many small and medium businesses in Bangladesh are falling behind in the digital world simply due to lack of proper support.'}
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                      {language === 'bn'
                        ? 'আমাদের মিশন হলো প্রতিটি ব্যবসাকে তাদের বাজেট অনুযায়ী প্রফেশনাল ডিজিটাল সলিউশন দিয়ে সাফল্যের পথে নিয়ে যাওয়া। আমরা বিশ্বাস করি, প্রযুক্তি সবার জন্য সহজলভ্য হওয়া উচিত।'
                        : 'Our mission is to help every business succeed with professional digital solutions within their budget. We believe technology should be accessible to everyone.'}
                    </p>
                    <p className="text-lg text-foreground font-medium">
                      {language === 'bn'
                        ? '— ডিজিওয়েবডেক্স টিম'
                        : '— The DigiWebDex Team'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              ⏳ {language === 'bn' ? 'আমাদের যাত্রা' : 'Our Journey'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">
              {language === 'bn' ? 'মাইলস্টোন টাইমলাইন' : 'Milestone Timeline'}
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-1/2" />
              
              {journeyTimeline.map((item, index) => (
                <div key={index} className={`relative flex items-start gap-6 mb-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Year Badge */}
                  <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg z-10">
                    {item.year}
                  </div>
                  
                  {/* Content */}
                  <Card className={`glass-card ml-24 md:ml-0 ${index % 2 === 0 ? 'md:mr-[calc(50%+3rem)]' : 'md:ml-[calc(50%+3rem)]'} w-full md:w-auto`}>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-2">{item.title[language]}</h3>
                      <p className="text-muted-foreground">{item.description[language]}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Mission */}
            <Card className="glass-card overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-primary/50" />
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {language === 'bn' ? 'আমাদের মিশন' : 'Our Mission'}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {language === 'bn'
                    ? 'বাংলাদেশের প্রতিটি ব্যবসাকে সাশ্রয়ী মূল্যে বিশ্বমানের ডিজিটাল সলিউশন প্রদান করা এবং তাদের অনলাইন সাফল্যে সক্রিয় অংশীদার হওয়া।'
                    : 'To provide world-class digital solutions at affordable prices to every business in Bangladesh and be an active partner in their online success.'}
                </p>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="glass-card overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-accent to-accent/50" />
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {language === 'bn' ? 'আমাদের ভিশন' : 'Our Vision'}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {language === 'bn'
                    ? 'বাংলাদেশের সবচেয়ে বিশ্বস্ত ও উদ্ভাবনী ডিজিটাল এজেন্সি হিসেবে নিজেদের প্রতিষ্ঠিত করা এবং বৈশ্বিক মানের সেবা দিয়ে দেশের বাইরেও সম্প্রসারণ করা।'
                    : 'To establish ourselves as the most trusted and innovative digital agency in Bangladesh and expand globally with world-class services.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              👥 {language === 'bn' ? 'আমাদের টিম' : 'Our Team'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">
              {language === 'bn' ? 'পেশাদার টিম' : 'Professional Team'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {language === 'bn' ? 'যারা আপনার প্রজেক্ট সফল করতে সদা প্রস্তুত' : 'Always ready to make your project successful'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card key={index} className="glass-card text-center">
                <CardContent className="p-6">
                  <div className="text-5xl mb-4">{member.avatar}</div>
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-muted-foreground text-sm">{member.role[language]}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              ⚡ {language === 'bn' ? 'টেকনোলজি' : 'Technology'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">
              {language === 'bn' ? 'আমাদের টেক স্ট্যাক' : 'Our Tech Stack'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {language === 'bn' ? 'আধুনিক প্রযুক্তি দিয়ে তৈরি' : 'Built with modern technology'}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {techStack.map((tech, index) => (
              <div 
                key={index} 
                className="px-4 py-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg hover:border-primary/30 transition-colors"
              >
                <span className="font-medium">{tech.name}</span>
                <span className="text-xs text-muted-foreground ml-2">({tech.category})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Logos */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              🤝 {language === 'bn' ? 'আমাদের ক্লায়েন্ট' : 'Our Clients'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">
              {language === 'bn' ? 'যারা আমাদের বিশ্বাস করে' : 'Those Who Trust Us'}
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {clientLogos.map((client, index) => (
              <div 
                key={index} 
                className="px-6 py-4 bg-card/80 border border-border/50 rounded-xl text-muted-foreground font-medium hover:text-foreground hover:border-primary/30 transition-colors"
              >
                {client}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              💎 {language === 'bn' ? 'আমাদের মূল্যবোধ' : 'Our Values'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">
              {language === 'bn' ? 'যে মূল্যবোধে আমরা বিশ্বাস করি' : 'Values We Believe In'}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{language === 'bn' ? 'ক্লায়েন্ট-ফার্স্ট' : 'Client-First'}</h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'আপনার সাফল্য আমাদের অগ্রাধিকার' : 'Your success is our priority'}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{language === 'bn' ? 'বিশ্বস্ততা' : 'Integrity'}</h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'সততা ও স্বচ্ছতা বজায় রাখি' : 'We maintain honesty & transparency'}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{language === 'bn' ? 'উদ্ভাবন' : 'Innovation'}</h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'নতুন প্রযুক্তি ও আইডিয়া গ্রহণ' : 'Embracing new tech & ideas'}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{language === 'bn' ? 'গুণমান' : 'Quality'}</h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'আপস না করে সেরা ডেলিভারি' : 'Best delivery without compromise'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-accent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container-custom relative z-10 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'bn' 
              ? 'আজই আপনার প্রজেক্ট শুরু করুন'
              : 'Start Your Project Today'}
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            {language === 'bn'
              ? 'ফ্রি কনসালটেশনের জন্য এখনই যোগাযোগ করুন। আমরা ২৪ ঘণ্টার মধ্যে রেসপন্স করি।'
              : 'Contact us for a free consultation. We respond within 24 hours.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 bg-white text-primary hover:bg-white/90" asChild>
              <Link to={`${basePath}/contact`}>
                {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white/10" asChild>
              <a href="https://wa.me/8801674533303" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 w-5 h-5" />
                WhatsApp
              </a>
            </Button>
          </div>
          
          <div className="mt-8 flex justify-center items-center gap-2 text-white/80">
            <Phone className="w-5 h-5" />
            <span>+880 1674-533303</span>
          </div>
        </div>
      </section>
    </Layout>
  );
}
