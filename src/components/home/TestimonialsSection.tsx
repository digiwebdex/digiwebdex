import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { Star, Quote } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';

export function TestimonialsSection() {
  const { language, t } = useLanguage();

  const testimonials = [
    {
      id: 1,
      name: language === 'bn' ? 'মোঃ রফিকুল ইসলাম' : 'Md. Rafiqul Islam',
      role: language === 'bn' ? 'সিইও, টেক সলিউশনস' : 'CEO, Tech Solutions',
      content: language === 'bn' 
        ? 'Digiwebdex আমাদের ওয়েবসাইট তৈরি করে দিয়েছে এবং সেটি আমাদের ব্যবসায় অনেক ইতিবাচক প্রভাব ফেলেছে। তাদের সার্ভিস সত্যিই অসাধারণ।'
        : 'Digiwebdex created our website and it has had a very positive impact on our business. Their service is truly outstanding.',
      rating: 5,
      avatar: 'RI',
    },
    {
      id: 2,
      name: language === 'bn' ? 'ফাতেমা খাতুন' : 'Fatema Khatun',
      role: language === 'bn' ? 'প্রতিষ্ঠাতা, ফ্যাশন হাউস' : 'Founder, Fashion House',
      content: language === 'bn'
        ? 'তাদের ডিজিটাল মার্কেটিং সেবা আমাদের অনলাইন বিক্রি ৩০০% বাড়িয়ে দিয়েছে। অত্যন্ত পেশাদার এবং সময়নিষ্ঠ টিম।'
        : 'Their digital marketing services increased our online sales by 300%. Extremely professional and punctual team.',
      rating: 5,
      avatar: 'FK',
    },
    {
      id: 3,
      name: language === 'bn' ? 'আব্দুল করিম' : 'Abdul Karim',
      role: language === 'bn' ? 'ম্যানেজার, ইম্পোর্ট এক্সপোর্ট' : 'Manager, Import Export',
      content: language === 'bn'
        ? 'কাস্টম সফটওয়্যার ডেভেলপমেন্টে তারা সেরা। আমাদের ইনভেন্টরি ম্যানেজমেন্ট সিস্টেম নিখুঁতভাবে কাজ করছে।'
        : 'They are the best in custom software development. Our inventory management system works flawlessly.',
      rating: 5,
      avatar: 'AK',
    },
    {
      id: 4,
      name: language === 'bn' ? 'নাজমুল হক' : 'Nazmul Haque',
      role: language === 'bn' ? 'ডিরেক্টর, রিয়েল এস্টেট' : 'Director, Real Estate',
      content: language === 'bn'
        ? 'হোস্টিং সার্ভিস চমৎকার। ৯৯.৯% আপটাইম এবং ২৪/৭ সাপোর্ট সত্যিই প্রশংসনীয়।'
        : 'Hosting service is excellent. 99.9% uptime and 24/7 support is truly commendable.',
      rating: 5,
      avatar: 'NH',
    },
  ];

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t.testimonials.badge}
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl">{t.testimonials.title}</h2>
          <p className="mt-4 text-muted-foreground text-lg">{t.testimonials.subtitle}</p>
        </div>

        {/* Testimonials Carousel */}
        <div className="px-12">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            plugins={[plugin.current]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="glass-card h-full border-transparent hover:border-primary/20 transition-all duration-300">
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Quote Icon */}
                      <Quote className="h-8 w-8 text-primary/30 mb-4" />

                      {/* Content */}
                      <p className="text-muted-foreground text-sm leading-relaxed flex-grow mb-6">
                        "{testimonial.content}"
                      </p>

                      {/* Rating */}
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>

                      {/* Author */}
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{testimonial.name}</div>
                          <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
