import { motion } from 'framer-motion';
import { ArrowRight, Gauge, Smartphone, Zap } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import type { PerformanceImprovement } from '@/services/caseStudyService';

interface BeforeAfterSectionProps {
  beforeScreenshotUrl?: string;
  afterScreenshotUrl?: string;
  beforePagespeedScore?: number;
  afterPagespeedScore?: number;
  performanceImprovements: PerformanceImprovement[];
}

export function BeforeAfterSection({
  beforeScreenshotUrl,
  afterScreenshotUrl,
  beforePagespeedScore,
  afterPagespeedScore,
  performanceImprovements
}: BeforeAfterSectionProps) {
  const { language } = useLanguage();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-500';
    if (score >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {language === 'bn' ? 'আগে ও পরে তুলনা' : 'Before & After Comparison'}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full" />
        </motion.div>

        {/* Screenshots Comparison */}
        {(beforeScreenshotUrl || afterScreenshotUrl) && (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {beforeScreenshotUrl && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <span className="inline-block px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold text-sm">
                    {language === 'bn' ? 'আগে' : 'BEFORE'}
                  </span>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-red-200 dark:border-red-900/50">
                  <img
                    src={beforeScreenshotUrl}
                    alt="Before"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </motion.div>
            )}

            {afterScreenshotUrl && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <span className="inline-block px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-semibold text-sm">
                    {language === 'bn' ? 'পরে' : 'AFTER'}
                  </span>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-green-200 dark:border-green-900/50">
                  <img
                    src={afterScreenshotUrl}
                    alt="After"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* PageSpeed Score */}
        {(beforePagespeedScore || afterPagespeedScore) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-8 mb-16"
          >
            {beforePagespeedScore && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {language === 'bn' ? 'আগের PageSpeed স্কোর' : 'Before PageSpeed'}
                </p>
                <div className={`text-6xl font-bold ${getScoreColor(beforePagespeedScore)}`}>
                  {beforePagespeedScore}
                </div>
              </div>
            )}

            <ArrowRight className="w-10 h-10 text-indigo-500 hidden md:block" />

            {afterPagespeedScore && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {language === 'bn' ? 'বর্তমান PageSpeed স্কোর' : 'After PageSpeed'}
                </p>
                <div className={`text-6xl font-bold bg-gradient-to-r ${getScoreBg(afterPagespeedScore)} bg-clip-text text-transparent`}>
                  {afterPagespeedScore}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Performance Improvements */}
        {performanceImprovements && performanceImprovements.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {performanceImprovements.map((improvement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-premium rounded-xl p-5 text-center"
              >
                <p className="text-sm text-muted-foreground mb-2">
                  {language === 'bn' ? improvement.metric_bn : improvement.metric_en}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-red-500 line-through text-lg">{improvement.before_value}</span>
                  <ArrowRight className="w-4 h-4 text-indigo-500" />
                  <span className="text-green-500 font-bold text-xl">{improvement.after_value}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
