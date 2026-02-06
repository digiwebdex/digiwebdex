import React from 'react';
import { useLanguage } from '@/lib/i18n';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';

interface FAQItem {
  question: string;
  answer: string;
}

interface ServiceFAQProps {
  title?: string;
  subtitle?: string;
  faqs: FAQItem[];
  schemaId?: string;
}

export function ServiceFAQ({ title, subtitle, faqs, schemaId = 'faq-schema' }: ServiceFAQProps) {
  const { language } = useLanguage();

  // Generate FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="section-padding bg-secondary/30" id="faq">
      <SchemaMarkup schema={faqSchema} id={schemaId} />
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {language === 'bn' ? '❓ সাধারণ প্রশ্নাবলী' : '❓ FAQ'}
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl">
            {title || (language === 'bn' ? 'প্রায়শই জিজ্ঞাসিত প্রশ্ন' : 'Frequently Asked Questions')}
          </h2>
          {subtitle && (
            <p className="mt-4 text-muted-foreground text-lg">{subtitle}</p>
          )}
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card border-transparent px-6 rounded-xl data-[state=open]:border-primary/20"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
