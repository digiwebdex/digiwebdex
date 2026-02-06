import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ExternalLink } from 'lucide-react';

export function PortfolioSection() {
  const { language, t } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  const projects = [
    {
      id: 1,
      title: language === 'bn' ? 'ই-কমার্স প্ল্যাটফর্ম' : 'E-commerce Platform',
      category: language === 'bn' ? 'ওয়েব ডেভেলপমেন্ট' : 'Web Development',
      result: language === 'bn' ? '৩০০% বিক্রি বৃদ্ধি' : '300% Sales Increase',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
      gradient: 'from-blue-500/20 to-purple-500/20',
    },
    {
      id: 2,
      title: language === 'bn' ? 'এন্টারপ্রাইজ সফটওয়্যার' : 'Enterprise Software',
      category: language === 'bn' ? 'সফটওয়্যার ডেভেলপমেন্ট' : 'Software Development',
      result: language === 'bn' ? '৫০% দক্ষতা বৃদ্ধি' : '50% Efficiency Boost',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
      gradient: 'from-green-500/20 to-teal-500/20',
    },
    {
      id: 3,
      title: language === 'bn' ? 'ডিজিটাল মার্কেটিং ক্যাম্পেইন' : 'Digital Marketing Campaign',
      category: language === 'bn' ? 'ডিজিটাল মার্কেটিং' : 'Digital Marketing',
      result: language === 'bn' ? '২০০% ট্রাফিক বৃদ্ধি' : '200% Traffic Growth',
      image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&h=400&fit=crop',
      gradient: 'from-orange-500/20 to-red-500/20',
    },
    {
      id: 4,
      title: language === 'bn' ? 'কর্পোরেট ওয়েবসাইট' : 'Corporate Website',
      category: language === 'bn' ? 'ওয়েব ডেভেলপমেন্ট' : 'Web Development',
      result: language === 'bn' ? '৫০০+ লিড জেনারেশন' : '500+ Lead Generation',
      image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop',
      gradient: 'from-purple-500/20 to-pink-500/20',
    },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t.portfolio.badge}
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl">{t.portfolio.title}</h2>
          <p className="mt-4 text-muted-foreground text-lg">{t.portfolio.subtitle}</p>
        </div>

        {/* Portfolio Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project, index) => (
            <Card
              key={project.id}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden aspect-[3/2]">
                  {/* Image */}
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${project.gradient} to-transparent opacity-60`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium mb-2">
                      {project.category}
                    </span>
                    <h3 className="text-xl font-bold text-foreground mb-1">{project.title}</h3>
                    <p className="text-primary font-semibold">{project.result}</p>
                  </div>

                  {/* Hover Link */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center">
                      <ExternalLink className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Button size="lg" variant="outline" className="h-12 px-8" asChild>
            <Link to={`${basePath}/portfolio`}>
              {t.portfolio.viewAll}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
