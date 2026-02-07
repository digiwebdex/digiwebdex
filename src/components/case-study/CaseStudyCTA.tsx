import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { Link } from 'react-router-dom';

export function CaseStudyCTA() {
  const { language } = useLanguage();

  return (
    <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-morph" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-morph" style={{ animationDelay: '2s' }} />
        
        {/* Floating Sparkles */}
        <div className="absolute top-20 left-20 animate-float">
          <Sparkles className="w-8 h-8 text-white/30" />
        </div>
        <div className="absolute bottom-32 right-32 animate-float" style={{ animationDelay: '1s' }}>
          <Sparkles className="w-6 h-6 text-white/20" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {language === 'bn' 
              ? 'আপনার ব্যবসাও হতে পারে পরবর্তী সফলতার গল্প'
              : 'Your Business Could Be Our Next Success Story'}
          </h2>
          <p className="text-xl text-white/80 mb-10">
            {language === 'bn'
              ? 'আমাদের সাথে কাজ করুন এবং আপনার ব্যবসার অনলাইন উপস্থিতি সর্বোচ্চ পর্যায়ে নিয়ে যান'
              : 'Work with us and take your business online presence to the next level'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-indigo-700 hover:bg-white/90 shadow-xl group text-lg px-8"
              asChild
            >
              <Link to={`/${language}/contact`}>
                {language === 'bn' ? 'এখনই প্রজেক্ট শুরু করুন' : 'Start Your Project Now'}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 group text-lg px-8"
              asChild
            >
              <a href="https://wa.me/8801700000000" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 w-5 h-5" />
                {language === 'bn' ? 'আমাদের সাথে কথা বলুন' : 'Talk to Us'}
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
