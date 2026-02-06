-- Landing Pages for Programmatic SEO
CREATE TABLE public.landing_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  page_type TEXT NOT NULL DEFAULT 'service', -- 'service', 'location', 'service_location', 'keyword'
  title_bn TEXT NOT NULL,
  title_en TEXT NOT NULL,
  meta_title_bn TEXT,
  meta_title_en TEXT,
  meta_description_bn TEXT,
  meta_description_en TEXT,
  h1_bn TEXT,
  h1_en TEXT,
  content_bn TEXT,
  content_en TEXT,
  hero_image_url TEXT,
  location TEXT, -- For location-based pages
  service_type TEXT, -- For service-based pages
  keywords TEXT[], -- Target keywords
  schema_markup JSONB, -- LocalBusiness, Service, FAQ schemas
  faq_items JSONB, -- FAQ schema data
  internal_links JSONB, -- Related page links
  og_image TEXT,
  canonical_url TEXT,
  is_indexed BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT true,
  priority DECIMAL(2,1) DEFAULT 0.8, -- Sitemap priority
  change_frequency TEXT DEFAULT 'weekly', -- Sitemap changefreq
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Blog Categories
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_bn TEXT,
  description_en TEXT,
  meta_title_bn TEXT,
  meta_title_en TEXT,
  meta_description_bn TEXT,
  meta_description_en TEXT,
  parent_id UUID REFERENCES public.blog_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Blog Tags
CREATE TABLE public.blog_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Blog Posts with full SEO support
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_bn TEXT NOT NULL,
  title_en TEXT NOT NULL,
  excerpt_bn TEXT,
  excerpt_en TEXT,
  content_bn TEXT,
  content_en TEXT,
  meta_title_bn TEXT,
  meta_title_en TEXT,
  meta_description_bn TEXT,
  meta_description_en TEXT,
  featured_image TEXT,
  og_image TEXT,
  author_id UUID,
  category_id UUID REFERENCES public.blog_categories(id),
  schema_markup JSONB, -- Article, FAQ schemas
  faq_items JSONB,
  keywords TEXT[],
  reading_time_minutes INTEGER DEFAULT 5,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  is_indexed BOOLEAN DEFAULT true,
  canonical_url TEXT,
  priority DECIMAL(2,1) DEFAULT 0.7,
  change_frequency TEXT DEFAULT 'monthly',
  views_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Blog Post Tags (many-to-many)
CREATE TABLE public.blog_post_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  UNIQUE(post_id, tag_id)
);

-- Related Posts for internal linking
CREATE TABLE public.blog_related_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  related_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  relevance_score DECIMAL(3,2) DEFAULT 1.0,
  UNIQUE(post_id, related_post_id)
);

-- Location Pages for Local SEO
CREATE TABLE public.location_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  location_name_bn TEXT NOT NULL,
  location_name_en TEXT NOT NULL,
  division TEXT, -- Bangladesh divisions
  district TEXT,
  area TEXT,
  title_bn TEXT NOT NULL,
  title_en TEXT NOT NULL,
  meta_title_bn TEXT,
  meta_title_en TEXT,
  meta_description_bn TEXT,
  meta_description_en TEXT,
  content_bn TEXT,
  content_en TEXT,
  local_business_schema JSONB, -- LocalBusiness schema
  geo_coordinates JSONB, -- {lat, lng}
  address_bn TEXT,
  address_en TEXT,
  phone TEXT,
  services_offered TEXT[], -- Services available in this location
  is_published BOOLEAN DEFAULT true,
  is_indexed BOOLEAN DEFAULT true,
  priority DECIMAL(2,1) DEFAULT 0.7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sitemap Entries Cache
CREATE TABLE public.sitemap_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT now(),
  change_frequency TEXT DEFAULT 'weekly',
  priority DECIMAL(2,1) DEFAULT 0.5,
  page_type TEXT NOT NULL, -- 'static', 'landing', 'blog', 'location', 'service'
  entity_id UUID, -- Reference to the actual page
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_landing_pages_slug ON public.landing_pages(slug);
CREATE INDEX idx_landing_pages_type ON public.landing_pages(page_type);
CREATE INDEX idx_landing_pages_published ON public.landing_pages(is_published, is_indexed);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(is_published, published_at);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category_id);
CREATE INDEX idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX idx_blog_tags_slug ON public.blog_tags(slug);
CREATE INDEX idx_location_pages_slug ON public.location_pages(slug);
CREATE INDEX idx_location_pages_division ON public.location_pages(division);
CREATE INDEX idx_sitemap_entries_url ON public.sitemap_entries(url);
CREATE INDEX idx_sitemap_entries_type ON public.sitemap_entries(page_type);

-- Enable RLS
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_related_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitemap_entries ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Anyone can view published landing pages"
ON public.landing_pages FOR SELECT
USING (is_published = true);

CREATE POLICY "Anyone can view active blog categories"
ON public.blog_categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Anyone can view active blog tags"
ON public.blog_tags FOR SELECT
USING (is_active = true);

CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts FOR SELECT
USING (is_published = true);

CREATE POLICY "Anyone can view blog post tags"
ON public.blog_post_tags FOR SELECT
USING (true);

CREATE POLICY "Anyone can view related posts"
ON public.blog_related_posts FOR SELECT
USING (true);

CREATE POLICY "Anyone can view published location pages"
ON public.location_pages FOR SELECT
USING (is_published = true);

CREATE POLICY "Anyone can view active sitemap entries"
ON public.sitemap_entries FOR SELECT
USING (is_active = true);

-- Admin full access policies
CREATE POLICY "Admins can manage landing pages"
ON public.landing_pages FOR ALL
USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can manage blog categories"
ON public.blog_categories FOR ALL
USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can manage blog tags"
ON public.blog_tags FOR ALL
USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can manage blog posts"
ON public.blog_posts FOR ALL
USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can manage blog post tags"
ON public.blog_post_tags FOR ALL
USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can manage related posts"
ON public.blog_related_posts FOR ALL
USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can manage location pages"
ON public.location_pages FOR ALL
USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can manage sitemap entries"
ON public.sitemap_entries FOR ALL
USING (public.is_admin_or_staff(auth.uid()));

-- Function to auto-update sitemap when content changes
CREATE OR REPLACE FUNCTION public.update_sitemap_entry()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO public.sitemap_entries (url, last_modified, page_type, entity_id, priority, change_frequency)
    VALUES (
      '/' || NEW.slug,
      NOW(),
      TG_ARGV[0],
      NEW.id,
      COALESCE(NEW.priority, 0.5),
      COALESCE(NEW.change_frequency, 'weekly')
    )
    ON CONFLICT (url) DO UPDATE SET
      last_modified = NOW(),
      priority = EXCLUDED.priority,
      change_frequency = EXCLUDED.change_frequency,
      is_active = CASE 
        WHEN TG_ARGV[0] = 'blog' THEN NEW.is_published AND NEW.is_indexed
        WHEN TG_ARGV[0] = 'landing' THEN NEW.is_published AND NEW.is_indexed
        WHEN TG_ARGV[0] = 'location' THEN NEW.is_published AND NEW.is_indexed
        ELSE true
      END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for auto sitemap update
CREATE TRIGGER update_sitemap_on_landing_page_change
AFTER INSERT OR UPDATE ON public.landing_pages
FOR EACH ROW EXECUTE FUNCTION public.update_sitemap_entry('landing');

CREATE TRIGGER update_sitemap_on_blog_post_change
AFTER INSERT OR UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.update_sitemap_entry('blog');

CREATE TRIGGER update_sitemap_on_location_page_change
AFTER INSERT OR UPDATE ON public.location_pages
FOR EACH ROW EXECUTE FUNCTION public.update_sitemap_entry('location');

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_page_views(page_table TEXT, page_id UUID)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('UPDATE public.%I SET views_count = views_count + 1 WHERE id = $1', page_table)
  USING page_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;