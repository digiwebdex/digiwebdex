import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead, SchemaMarkup } from '@/components/seo';
import { useLanguage } from '@/lib/i18n';
import { caseStudyService, type CaseStudy as CaseStudyType } from '@/services/caseStudyService';
import {
  CaseStudyHero,
  ClientOverview,
  ProblemSection,
  SolutionSection,
  BeforeAfterSection,
  ResultsSection,
  TestimonialSection,
  TechStackSection,
  CaseStudyCTA
} from '@/components/case-study';
import { Skeleton } from '@/components/ui/skeleton';

export default function CaseStudy() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [caseStudy, setCaseStudy] = useState<CaseStudyType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCaseStudy() {
      if (!slug) return;
      
      try {
        const data = await caseStudyService.getCaseStudyBySlug(slug);
        if (!data) {
          navigate(`/${language}/404`, { replace: true });
          return;
        }
        setCaseStudy(data);
      } catch (error) {
        console.error('Error fetching case study:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCaseStudy();
  }, [slug, language, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-950 pt-20">
          <div className="container mx-auto px-4 py-12">
            <Skeleton className="h-96 w-full rounded-2xl mb-8" />
            <Skeleton className="h-64 w-full rounded-2xl mb-8" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!caseStudy) return null;

  const breadcrumbSchema = caseStudyService.generateBreadcrumbSchema(caseStudy, language);
  const articleSchema = caseStudyService.generateCaseStudySchema(caseStudy, language);
  const faqSchema = caseStudyService.generateFAQSchema(caseStudy, language);

  return (
    <Layout>
      <SEOHead
        title={language === 'bn' ? caseStudy.meta_title_bn : caseStudy.meta_title_en}
        description={language === 'bn' ? caseStudy.meta_description_bn : caseStudy.meta_description_en}
        keywords={caseStudy.keywords}
        ogImage={caseStudy.og_image_url}
        ogType="article"
        canonicalUrl={caseStudy.canonical_url || `https://digiwebdex.com/${language}/case-studies/${caseStudy.slug}`}
      />
      <SchemaMarkup schema={breadcrumbSchema} id="breadcrumb-schema" />
      <SchemaMarkup schema={articleSchema} id="article-schema" />
      {faqSchema && <SchemaMarkup schema={faqSchema} id="faq-schema" />}

      <CaseStudyHero
        projectName={language === 'bn' ? caseStudy.project_name_bn : caseStudy.project_name_en}
        industryTag={language === 'bn' ? caseStudy.industry_tag_bn : caseStudy.industry_tag_en}
        resultHighlight={language === 'bn' ? caseStudy.result_highlight_bn : caseStudy.result_highlight_en}
        headline={language === 'bn' ? caseStudy.hero_headline_bn || caseStudy.project_name_bn : caseStudy.hero_headline_en || caseStudy.project_name_en}
        subheadline={language === 'bn' ? caseStudy.hero_subheadline_bn : caseStudy.hero_subheadline_en}
        heroImageUrl={caseStudy.hero_image_url}
      />

      <ClientOverview
        companyBackground={language === 'bn' ? caseStudy.company_background_bn : caseStudy.company_background_en}
        industryType={language === 'bn' ? caseStudy.industry_type_bn : caseStudy.industry_type_en}
        businessGoal={language === 'bn' ? caseStudy.business_goal_bn : caseStudy.business_goal_en}
        clientLogoUrl={caseStudy.client_logo_url}
        clientWebsiteUrl={caseStudy.client_website_url}
      />

      <ProblemSection problems={caseStudy.problems} />

      <SolutionSection solutions={caseStudy.solutions} />

      <BeforeAfterSection
        beforeScreenshotUrl={caseStudy.before_screenshot_url}
        afterScreenshotUrl={caseStudy.after_screenshot_url}
        beforePagespeedScore={caseStudy.before_pagespeed_score}
        afterPagespeedScore={caseStudy.after_pagespeed_score}
        performanceImprovements={caseStudy.performance_improvements}
      />

      <ResultsSection results={caseStudy.results} />

      <TestimonialSection
        text={language === 'bn' ? caseStudy.testimonial_text_bn : caseStudy.testimonial_text_en}
        authorName={caseStudy.testimonial_author_name}
        authorTitle={language === 'bn' ? caseStudy.testimonial_author_title_bn : caseStudy.testimonial_author_title_en}
        authorCompany={caseStudy.testimonial_author_company}
        authorAvatarUrl={caseStudy.testimonial_author_avatar_url}
        rating={caseStudy.testimonial_rating}
      />

      <TechStackSection techStack={caseStudy.tech_stack} />

      <CaseStudyCTA />
    </Layout>
  );
}
