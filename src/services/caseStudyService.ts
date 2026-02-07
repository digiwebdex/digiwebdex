import { supabase } from "@/integrations/supabase/client";

export interface CaseStudy {
  id: string;
  slug: string;
  project_name_bn: string;
  project_name_en: string;
  industry_tag_bn?: string;
  industry_tag_en?: string;
  result_highlight_bn?: string;
  result_highlight_en?: string;
  hero_headline_bn?: string;
  hero_headline_en?: string;
  hero_subheadline_bn?: string;
  hero_subheadline_en?: string;
  hero_image_url?: string;
  company_background_bn?: string;
  company_background_en?: string;
  industry_type_bn?: string;
  industry_type_en?: string;
  business_goal_bn?: string;
  business_goal_en?: string;
  client_logo_url?: string;
  client_website_url?: string;
  problems: Problem[];
  solutions: Solution[];
  before_screenshot_url?: string;
  after_screenshot_url?: string;
  before_pagespeed_score?: number;
  after_pagespeed_score?: number;
  performance_improvements: PerformanceImprovement[];
  results: Result[];
  testimonial_text_bn?: string;
  testimonial_text_en?: string;
  testimonial_author_name?: string;
  testimonial_author_title_bn?: string;
  testimonial_author_title_en?: string;
  testimonial_author_company?: string;
  testimonial_author_avatar_url?: string;
  testimonial_rating?: number;
  tech_stack: TechStackItem[];
  meta_title_bn?: string;
  meta_title_en?: string;
  meta_description_bn?: string;
  meta_description_en?: string;
  keywords?: string[];
  og_image_url?: string;
  canonical_url?: string;
  faq_items: FAQItem[];
  schema_markup?: Record<string, unknown>;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  views_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Problem {
  title_bn: string;
  title_en: string;
  description_bn?: string;
  description_en?: string;
  icon?: string;
}

export interface Solution {
  title_bn: string;
  title_en: string;
  description_bn?: string;
  description_en?: string;
  icon?: string;
}

export interface PerformanceImprovement {
  metric_bn: string;
  metric_en: string;
  before_value: string;
  after_value: string;
}

export interface Result {
  value: string;
  label_bn: string;
  label_en: string;
  icon?: string;
}

export interface TechStackItem {
  category_bn: string;
  category_en: string;
  items: string[];
}

export interface FAQItem {
  question_bn: string;
  question_en: string;
  answer_bn: string;
  answer_en: string;
}

class CaseStudyService {
  async getCaseStudies(): Promise<CaseStudy[]> {
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data || []).map(this.transformCaseStudy);
  }

  async getFeaturedCaseStudies(): Promise<CaseStudy[]> {
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('sort_order', { ascending: true })
      .limit(3);

    if (error) throw error;
    return (data || []).map(this.transformCaseStudy);
  }

  async getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    // Increment view count
    if (data) {
      await supabase
        .from('case_studies')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', data.id);
    }

    return data ? this.transformCaseStudy(data) : null;
  }

  private transformCaseStudy(row: any): CaseStudy {
    return {
      ...row,
      problems: row.problems || [],
      solutions: row.solutions || [],
      performance_improvements: row.performance_improvements || [],
      results: row.results || [],
      tech_stack: row.tech_stack || [],
      faq_items: row.faq_items || [],
    };
  }

  generateBreadcrumbSchema(caseStudy: CaseStudy, language: 'bn' | 'en') {
    const baseUrl = 'https://digiwebdex.com';
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": language === 'bn' ? 'হোম' : 'Home',
          "item": `${baseUrl}/${language}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": language === 'bn' ? 'কেস স্টাডি' : 'Case Studies',
          "item": `${baseUrl}/${language}/case-studies`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": language === 'bn' ? caseStudy.project_name_bn : caseStudy.project_name_en,
          "item": `${baseUrl}/${language}/case-studies/${caseStudy.slug}`
        }
      ]
    };
  }

  generateCaseStudySchema(caseStudy: CaseStudy, language: 'bn' | 'en') {
    const baseUrl = 'https://digiwebdex.com';
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": language === 'bn' ? caseStudy.hero_headline_bn : caseStudy.hero_headline_en,
      "description": language === 'bn' ? caseStudy.meta_description_bn : caseStudy.meta_description_en,
      "image": caseStudy.og_image_url || caseStudy.hero_image_url,
      "author": {
        "@type": "Organization",
        "name": "Digiwebdex",
        "url": baseUrl
      },
      "publisher": {
        "@type": "Organization",
        "name": "Digiwebdex",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`
        }
      },
      "datePublished": caseStudy.published_at,
      "dateModified": caseStudy.updated_at,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${baseUrl}/${language}/case-studies/${caseStudy.slug}`
      }
    };
  }

  generateFAQSchema(caseStudy: CaseStudy, language: 'bn' | 'en') {
    if (!caseStudy.faq_items || caseStudy.faq_items.length === 0) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": caseStudy.faq_items.map(item => ({
        "@type": "Question",
        "name": language === 'bn' ? item.question_bn : item.question_en,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": language === 'bn' ? item.answer_bn : item.answer_en
        }
      }))
    };
  }
}

export const caseStudyService = new CaseStudyService();
