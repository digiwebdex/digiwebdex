import { motion } from 'framer-motion';
import { 
  Palette, Zap, Search, Shield, Target, 
  Code, Server, Gauge, CheckCircle2 
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import type { Solution } from '@/services/caseStudyService';

interface SolutionSectionProps {
  solutions: Solution[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'design': Palette,
  'performance': Zap,
  'seo': Search,
  'security': Shield,
  'conversion': Target,
  'code': Code,
  'hosting': Server,
  'speed': Gauge,
  'default': CheckCircle2
};

export function SolutionSection({ solutions }: SolutionSectionProps) {
  const { language } = useLanguage();

  if (!solutions || solutions.length === 0) return null;

  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {language === 'bn' ? 'আমাদের সমাধান ও কৌশল' : 'Our Strategy & Solution'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === 'bn' 
              ? 'কিভাবে আমরা সমস্যাগুলো সমাধান করেছি'
              : 'How we tackled each challenge systematically'}
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full mt-4" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {solutions.map((solution, index) => {
            const IconComponent = iconMap[solution.icon || 'default'] || CheckCircle2;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-premium rounded-2xl p-6 hover:shadow-xl transition-all group relative overflow-hidden"
              >
                {/* Gradient Border */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/25">
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {language === 'bn' ? solution.title_bn : solution.title_en}
                  </h3>
                  {(language === 'bn' ? solution.description_bn : solution.description_en) && (
                    <p className="text-muted-foreground leading-relaxed">
                      {language === 'bn' ? solution.description_bn : solution.description_en}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
