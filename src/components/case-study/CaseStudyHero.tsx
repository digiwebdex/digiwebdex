import { motion } from 'framer-motion';
import { ArrowRight, Phone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n';
import { Link } from 'react-router-dom';

interface CaseStudyHeroProps {
  projectName: string;
  industryTag?: string;
  resultHighlight?: string;
  headline: string;
  subheadline?: string;
  heroImageUrl?: string;
}

export function CaseStudyHero({
  projectName,
  industryTag,
  resultHighlight,
  headline,
  subheadline,
  heroImageUrl
}: CaseStudyHeroProps) {
  const { language } = useLanguage();

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-morph" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-morph" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Tags */}
            <div className="flex flex-wrap gap-3">
              {industryTag && (
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-4 py-1.5">
                  {industryTag}
                </Badge>
              )}
              {resultHighlight && (
                <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30 px-4 py-1.5 animate-pulse">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {resultHighlight}
                </Badge>
              )}
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {headline}
            </h1>

            {/* Subheadline */}
            {subheadline && (
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-xl">
                {subheadline}
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 group"
                asChild
              >
                <Link to={`/${language}/contact`}>
                  {language === 'bn' ? 'আপনার প্রজেক্ট শুরু করুন' : 'Start Your Project'}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-white hover:bg-white/10 group"
                asChild
              >
                <a href="tel:+8801700000000">
                  <Phone className="mr-2 w-4 h-4 group-hover:animate-bounce" />
                  {language === 'bn' ? 'ফ্রি কনসাল্টেশন নিন' : 'Free Consultation'}
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Hero Image */}
          {heroImageUrl && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/10">
                <img
                  src={heroImageUrl}
                  alt={projectName}
                  className="w-full h-auto object-cover"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/50 to-transparent" />
              </div>
              
              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="absolute -bottom-4 -left-4 glass-premium px-6 py-3 rounded-xl"
              >
                <p className="text-white font-semibold">{projectName}</p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
