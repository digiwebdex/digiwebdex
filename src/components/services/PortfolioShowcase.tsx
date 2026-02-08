import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ExternalLink } from 'lucide-react';

interface PortfolioItem {
  title: string;
  category: string;
  result: string;
  description?: string;
  image: string;
  gradient?: string;
}

interface PortfolioShowcaseProps {
  badge?: string;
  title: string;
  subtitle?: string;
  items: PortfolioItem[];
  viewAllHref?: string;
  viewAllText?: string;
}

export function PortfolioShowcase({
  badge,
  title,
  subtitle,
  items,
  viewAllHref,
  viewAllText,
}: PortfolioShowcaseProps) {
  const { language } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  return (
    <section id="portfolio" className="section-padding bg-background">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          {badge && (
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              {badge}
            </span>
          )}
          <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
          {subtitle && (
            <p className="mt-4 text-muted-foreground text-lg">{subtitle}</p>
          )}
        </div>

        {/* Portfolio Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Card
              key={index}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden aspect-[4/3]">
                  {/* Image */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${item.gradient || 'from-primary/20 to-transparent'} opacity-60`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium mb-2">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-bold text-foreground mb-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                    )}
                    <p className="text-primary font-bold text-sm">📈 {item.result}</p>
                  </div>

                  {/* Hover Link */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <ExternalLink className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        {viewAllHref && (
          <div className="text-center mt-10">
            <Button size="lg" className="gradient-button h-12 px-8" asChild>
              <Link to={viewAllHref}>
                {viewAllText || (language === 'bn' ? 'সব দেখুন' : 'View All')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
