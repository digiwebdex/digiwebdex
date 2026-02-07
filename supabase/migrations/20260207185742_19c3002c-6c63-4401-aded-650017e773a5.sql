-- Create case_studies table for storing dynamic case study content
CREATE TABLE public.case_studies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  
  -- Basic Info
  project_name_bn VARCHAR(255) NOT NULL,
  project_name_en VARCHAR(255) NOT NULL,
  industry_tag_bn VARCHAR(100),
  industry_tag_en VARCHAR(100),
  result_highlight_bn VARCHAR(255),
  result_highlight_en VARCHAR(255),
  
  -- Hero
  hero_headline_bn TEXT,
  hero_headline_en TEXT,
  hero_subheadline_bn TEXT,
  hero_subheadline_en TEXT,
  hero_image_url TEXT,
  
  -- Client Overview
  company_background_bn TEXT,
  company_background_en TEXT,
  industry_type_bn VARCHAR(100),
  industry_type_en VARCHAR(100),
  business_goal_bn TEXT,
  business_goal_en TEXT,
  client_logo_url TEXT,
  client_website_url TEXT,
  
  -- Problem Section
  problems JSONB DEFAULT '[]'::jsonb,
  
  -- Solution Section  
  solutions JSONB DEFAULT '[]'::jsonb,
  
  -- Before/After
  before_screenshot_url TEXT,
  after_screenshot_url TEXT,
  before_pagespeed_score INTEGER,
  after_pagespeed_score INTEGER,
  performance_improvements JSONB DEFAULT '[]'::jsonb,
  
  -- Results
  results JSONB DEFAULT '[]'::jsonb,
  
  -- Testimonial
  testimonial_text_bn TEXT,
  testimonial_text_en TEXT,
  testimonial_author_name VARCHAR(255),
  testimonial_author_title_bn VARCHAR(255),
  testimonial_author_title_en VARCHAR(255),
  testimonial_author_company VARCHAR(255),
  testimonial_author_avatar_url TEXT,
  testimonial_rating INTEGER DEFAULT 5,
  
  -- Tech Stack
  tech_stack JSONB DEFAULT '[]'::jsonb,
  
  -- SEO
  meta_title_bn VARCHAR(255),
  meta_title_en VARCHAR(255),
  meta_description_bn TEXT,
  meta_description_en TEXT,
  keywords TEXT[],
  og_image_url TEXT,
  canonical_url TEXT,
  faq_items JSONB DEFAULT '[]'::jsonb,
  schema_markup JSONB,
  
  -- Status
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Timestamps
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

-- Public read access for published case studies
CREATE POLICY "Published case studies are publicly readable"
ON public.case_studies
FOR SELECT
USING (is_published = true);

-- Admin full access
CREATE POLICY "Admins can manage case studies"
ON public.case_studies
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_case_studies_slug ON public.case_studies(slug);
CREATE INDEX idx_case_studies_published ON public.case_studies(is_published);
CREATE INDEX idx_case_studies_featured ON public.case_studies(is_featured);

-- Update timestamp trigger
CREATE TRIGGER update_case_studies_updated_at
BEFORE UPDATE ON public.case_studies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();