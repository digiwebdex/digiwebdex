import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo';
import { useLanguage } from '@/lib/i18n';
import { caseStudyService, type CaseStudy } from '@/services/caseStudyService';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function CaseStudies() {
  const { language } = useLanguage();
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCaseStudies() {
      try {
        const data = await caseStudyService.getCaseStudies();
        setCaseStudies(data);
      } catch (error) {
        console.error('Error fetching case studies:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCaseStudies();
  }, []);

  return (
    <Layout>
      <SEOHead
        title={language === 'bn' ? 'কেস স্টাডি - সফলতার গল্প' : 'Case Studies - Success Stories'}
        description={language === 'bn' 
          ? 'Digiwebdex-এর সফল প্রজেক্টসমূহ দেখুন। ওয়েব ডেভেলপমেন্ট, ই-কমার্স, এবং ডিজিটাল মার্কেটিং কেস স্টাডি।'
          : 'Explore our successful projects. Web development, eCommerce, and digital marketing case studies from Digiwebdex.'}
        keywords={['case study', 'success story', 'portfolio', 'web development', 'ecommerce', 'digital marketing']}
      />

      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-morph" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-morph" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-4 py-1.5 mb-6">
              <Sparkles className="w-3 h-3 mr-2" />
              {language === 'bn' ? 'সফলতার গল্প' : 'Success Stories'}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {language === 'bn' ? 'আমাদের কেস স্টাডি' : 'Our Case Studies'}
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              {language === 'bn'
                ? 'দেখুন কিভাবে আমরা ক্লায়েন্টদের ব্যবসায়িক সাফল্য অর্জনে সাহায্য করেছি'
                : 'See how we helped our clients achieve business success'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-2xl" />
              ))}
            </div>
          ) : caseStudies.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                {language === 'bn' ? 'কোনো কেস স্টাডি পাওয়া যায়নি' : 'No case studies found'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {caseStudies.map((study, index) => (
                <motion.div
                  key={study.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full glass-premium border-0 overflow-hidden group hover:shadow-xl transition-all">
                    {study.hero_image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={study.hero_image_url}
                          alt={language === 'bn' ? study.project_name_bn : study.project_name_en}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(language === 'bn' ? study.industry_tag_bn : study.industry_tag_en) && (
                          <Badge variant="secondary" className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                            {language === 'bn' ? study.industry_tag_bn : study.industry_tag_en}
                          </Badge>
                        )}
                        {(language === 'bn' ? study.result_highlight_bn : study.result_highlight_en) && (
                          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {language === 'bn' ? study.result_highlight_bn : study.result_highlight_en}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-indigo-600 transition-colors">
                        {language === 'bn' ? study.project_name_bn : study.project_name_en}
                      </h3>
                      <p className="text-muted-foreground line-clamp-2">
                        {language === 'bn' ? study.hero_subheadline_bn : study.hero_subheadline_en}
                      </p>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                      <Button
                        variant="ghost"
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 p-0 h-auto font-medium group/btn"
                        asChild
                      >
                        <Link to={`/${language}/case-studies/${study.slug}`}>
                          {language === 'bn' ? 'বিস্তারিত দেখুন' : 'Read Case Study'}
                          <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {language === 'bn' 
                ? 'আপনার প্রজেক্ট নিয়ে আলোচনা করতে চান?'
                : 'Want to discuss your project?'}
            </h2>
            <Button
              size="lg"
              className="bg-white text-indigo-700 hover:bg-white/90"
              asChild
            >
              <Link to={`/${language}/contact`}>
                {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
