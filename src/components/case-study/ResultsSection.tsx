import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Users, Gauge, ShoppingCart, Star } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import type { Result } from '@/services/caseStudyService';

interface ResultsSectionProps {
  results: Result[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'traffic': TrendingUp,
  'sales': ShoppingCart,
  'pagespeed': Gauge,
  'users': Users,
  'default': Star
};

function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  const prefix = value.match(/^[^\d]*/)?.[0] || '';

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const controls = animate(0, numericValue, {
            duration: 2,
            onUpdate: (v) => setDisplayValue(Math.round(v))
          });
          return () => controls.stop();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [numericValue]);

  return (
    <span ref={ref} className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
      {prefix}{displayValue}{suffix}
    </span>
  );
}

export function ResultsSection({ results }: ResultsSectionProps) {
  const { language } = useLanguage();

  if (!results || results.length === 0) return null;

  return (
    <section className="py-24 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {language === 'bn' ? 'চূড়ান্ত ফলাফল' : 'The Results'}
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            {language === 'bn' 
              ? 'পরিমাপযোগ্য উন্নতি যা ব্যবসায়িক সাফল্য এনেছে'
              : 'Measurable improvements that drove business success'}
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full mt-4" />
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {results.map((result, index) => {
            const IconComponent = iconMap[result.icon || 'default'] || Star;
            const suffix = result.value.includes('%') ? '%' : result.value.includes('+') ? '+' : '';
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-premium rounded-2xl p-8 text-center group hover:scale-105 transition-transform"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-500/25">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <AnimatedCounter value={result.value} suffix={suffix} />
                <p className="text-slate-300 mt-3 text-lg">
                  {language === 'bn' ? result.label_bn : result.label_en}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
