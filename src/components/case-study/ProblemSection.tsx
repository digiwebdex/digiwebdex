import { motion } from 'framer-motion';
import { AlertTriangle, Zap, Smartphone, Search, TrendingDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import type { Problem } from '@/services/caseStudyService';

interface ProblemSectionProps {
  problems: Problem[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'slow': Zap,
  'mobile': Smartphone,
  'seo': Search,
  'conversion': TrendingDown,
  'default': AlertTriangle
};

export function ProblemSection({ problems }: ProblemSectionProps) {
  const { language } = useLanguage();

  if (!problems || problems.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {language === 'bn' ? 'সমস্যাসমূহ' : 'The Problems'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === 'bn' 
              ? 'ক্লায়েন্ট যেসব চ্যালেঞ্জের মুখোমুখি হয়েছিল'
              : 'Challenges the client was facing before working with us'}
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full mt-4" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {problems.map((problem, index) => {
            const IconComponent = iconMap[problem.icon || 'default'] || AlertTriangle;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-red-100 dark:border-red-900/30 hover:shadow-xl transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {language === 'bn' ? problem.title_bn : problem.title_en}
                </h3>
                {(language === 'bn' ? problem.description_bn : problem.description_en) && (
                  <p className="text-muted-foreground text-sm">
                    {language === 'bn' ? problem.description_bn : problem.description_en}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
