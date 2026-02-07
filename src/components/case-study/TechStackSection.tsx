import { motion } from 'framer-motion';
import { Code, Server, Cloud, Search, Database, Palette } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import type { TechStackItem } from '@/services/caseStudyService';

interface TechStackSectionProps {
  techStack: TechStackItem[];
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'frontend': Code,
  'backend': Server,
  'hosting': Cloud,
  'seo': Search,
  'database': Database,
  'design': Palette,
  'default': Code
};

export function TechStackSection({ techStack }: TechStackSectionProps) {
  const { language } = useLanguage();

  if (!techStack || techStack.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {language === 'bn' ? 'প্রযুক্তি স্ট্যাক' : 'Technology Stack'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === 'bn' 
              ? 'এই প্রজেক্টে ব্যবহৃত প্রযুক্তিসমূহ'
              : 'Technologies used in this project'}
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full mt-4" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {techStack.map((category, index) => {
            const categoryKey = (language === 'bn' ? category.category_en : category.category_en).toLowerCase();
            const IconComponent = categoryIcons[categoryKey] || categoryIcons.default;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-premium rounded-2xl p-6 group hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/25">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  {language === 'bn' ? category.category_bn : category.category_en}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((item, itemIndex) => (
                    <span
                      key={itemIndex}
                      className="inline-block px-3 py-1.5 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
