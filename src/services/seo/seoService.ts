import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

// Database types
export type LandingPageRow = Tables<'landing_pages'>;
export type BlogPostRow = Tables<'blog_posts'>;
export type BlogCategoryRow = Tables<'blog_categories'>;
export type BlogTagRow = Tables<'blog_tags'>;
export type LocationPageRow = Tables<'location_pages'>;
export type SitemapEntryRow = Tables<'sitemap_entries'>;

// SEO types
export interface SEOMeta {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  schema?: Record<string, unknown>;
  noIndex?: boolean;
}

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export interface LocalBusinessSchema extends Record<string, unknown> {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  telephone: string;
  email: string;
  address: {
    '@type': string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    '@type': string;
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
  sameAs?: string[];
  areaServed?: string[];
  priceRange?: string;
}

export interface FAQSchema extends Record<string, unknown> {
  '@context': string;
  '@type': string;
  mainEntity: Array<{
    '@type': string;
    name: string;
    acceptedAnswer: {
      '@type': string;
      text: string;
    };
  }>;
}

export interface ArticleSchema extends Record<string, unknown> {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  image: string;
  author: {
    '@type': string;
    name: string;
  };
  publisher: {
    '@type': string;
    name: string;
    logo: {
      '@type': string;
      url: string;
    };
  };
  datePublished: string;
  dateModified: string;
  mainEntityOfPage: {
    '@type': string;
    '@id': string;
  };
}

export interface ServiceSchema extends Record<string, unknown> {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  provider: {
    '@type': string;
    name: string;
    url: string;
  };
  areaServed: string;
  serviceType: string;
}

// DigiWebDex business info for schemas
const BUSINESS_INFO = {
  name: 'DigiWebDex',
  nameBn: 'ডিজিওয়েবডেক্স',
  url: 'https://digiwebdex.lovable.app',
  telephone: '+8801674533303',
  email: 'digiwebdex@gmail.com',
  address: {
    streetAddress: 'House No. 49 Shekhertek, Mohammadpur',
    addressLocality: 'Dhaka',
    addressRegion: 'Dhaka Division',
    postalCode: '1207',
    addressCountry: 'BD'
  },
  geo: {
    latitude: 23.7667,
    longitude: 90.3567
  },
  socialLinks: [
    'https://facebook.com/digiwebdex',
    'https://twitter.com/digiwebdex',
    'https://linkedin.com/company/digiwebdex',
    'https://instagram.com/digiwebdex'
  ]
};

// Worldwide regions for location-based SEO
export const WORLDWIDE_REGIONS = [
  { slug: 'asia', nameBn: 'এশিয়া', nameEn: 'Asia', icon: '🌏' },
  { slug: 'middle-east', nameBn: 'মধ্যপ্রাচ্য', nameEn: 'Middle East', icon: '🕌' },
  { slug: 'europe', nameBn: 'ইউরোপ', nameEn: 'Europe', icon: '🇪🇺' },
  { slug: 'north-america', nameBn: 'উত্তর আমেরিকা', nameEn: 'North America', icon: '🌎' },
  { slug: 'australia', nameBn: 'অস্ট্রেলিয়া', nameEn: 'Australia & Oceania', icon: '🦘' },
  { slug: 'africa', nameBn: 'আফ্রিকা', nameEn: 'Africa', icon: '🌍' },
];

// Legacy Bangladesh divisions (kept for backward compatibility)
export const BANGLADESH_DIVISIONS = WORLDWIDE_REGIONS;

// Cache for SEO data
const seoCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const cached = seoCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  return null;
}

function setCache(key: string, data: unknown): void {
  seoCache.set(key, { data, timestamp: Date.now() });
}

export const seoService = {
  // Get SEO settings for a page
  async getPageSEO(pageSlug: string, language: 'bn' | 'en' = 'bn'): Promise<SEOMeta | null> {
    const cacheKey = `seo_${pageSlug}_${language}`;
    const cached = getCached<SEOMeta>(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('seo_settings')
      .select('*')
      .eq('page_slug', pageSlug)
      .single();

    if (error || !data) return null;

    const seoMeta: SEOMeta = {
      title: language === 'bn' ? data.meta_title_bn || '' : data.meta_title_en || '',
      description: language === 'bn' ? data.meta_description_bn || '' : data.meta_description_en || '',
      ogImage: data.og_image || undefined,
      schema: data.schema_markup as Record<string, unknown> || undefined
    };

    setCache(cacheKey, seoMeta);
    return seoMeta;
  },

  // Generate Local Business Schema
  generateLocalBusinessSchema(overrides?: Partial<LocalBusinessSchema>): LocalBusinessSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: BUSINESS_INFO.name,
      description: 'বাংলাদেশের শীর্ষস্থানীয় ওয়েব ডেভেলপমেন্ট ও ডিজিটাল মার্কেটিং এজেন্সি',
      url: BUSINESS_INFO.url,
      telephone: BUSINESS_INFO.telephone,
      email: BUSINESS_INFO.email,
      address: {
        '@type': 'PostalAddress',
        ...BUSINESS_INFO.address
      },
      geo: {
        '@type': 'GeoCoordinates',
        ...BUSINESS_INFO.geo
      },
      sameAs: BUSINESS_INFO.socialLinks,
      areaServed: BANGLADESH_DIVISIONS.map(d => d.nameEn),
      priceRange: '$$',
      ...overrides
    };
  },

  // Generate FAQ Schema
  generateFAQSchema(faqs: Array<{ question: string; answer: string }>): FAQSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };
  },

  // Generate Article Schema
  generateArticleSchema(article: {
    title: string;
    description: string;
    image: string;
    authorName: string;
    publishedAt: string;
    modifiedAt: string;
    url: string;
  }): ArticleSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      image: article.image,
      author: {
        '@type': 'Person',
        name: article.authorName
      },
      publisher: {
        '@type': 'Organization',
        name: BUSINESS_INFO.name,
        logo: {
          '@type': 'ImageObject',
          url: `${BUSINESS_INFO.url}/logo.png`
        }
      },
      datePublished: article.publishedAt,
      dateModified: article.modifiedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': article.url
      }
    };
  },

  // Generate Service Schema
  generateServiceSchema(service: {
    name: string;
    description: string;
    serviceType: string;
    areaServed?: string;
  }): ServiceSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.name,
      description: service.description,
      provider: {
        '@type': 'Organization',
        name: BUSINESS_INFO.name,
        url: BUSINESS_INFO.url
      },
      areaServed: service.areaServed || 'Bangladesh',
      serviceType: service.serviceType
    };
  },

  // Generate Organization Schema
  generateOrganizationSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: BUSINESS_INFO.name,
      url: BUSINESS_INFO.url,
      logo: `${BUSINESS_INFO.url}/logo.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: BUSINESS_INFO.telephone,
        contactType: 'customer service',
        areaServed: 'BD',
        availableLanguage: ['bn', 'en']
      },
      address: {
        '@type': 'PostalAddress',
        ...BUSINESS_INFO.address
      },
      sameAs: BUSINESS_INFO.socialLinks
    };
  },

  // Generate BreadcrumbList Schema
  generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    };
  },

  // Get all sitemap entries
  async getSitemapEntries(): Promise<SitemapEntry[]> {
    const cacheKey = 'sitemap_entries';
    const cached = getCached<SitemapEntry[]>(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('sitemap_entries')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error || !data) return [];

    const entries: SitemapEntry[] = data.map(entry => ({
      url: entry.url,
      lastModified: entry.last_modified || entry.updated_at,
      changeFrequency: (entry.change_frequency || 'weekly') as SitemapEntry['changeFrequency'],
      priority: Number(entry.priority) || 0.5
    }));

    // Add static pages
    const staticPages: SitemapEntry[] = [
      // Homepage
      { url: '/bn', lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 1.0 },
      { url: '/en', lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 1.0 },
      // Pricing (high intent)
      { url: '/bn/pricing', lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.95 },
      { url: '/en/pricing', lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.95 },
      // Service Pages (high priority)
      { url: '/bn/services/web-development', lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.95 },
      { url: '/en/services/web-development', lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.95 },
      { url: '/bn/services/software-development', lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.95 },
      { url: '/en/services/software-development', lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.95 },
      { url: '/bn/services/digital-marketing', lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.9 },
      { url: '/en/services/digital-marketing', lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.9 },
      { url: '/bn/services/domain-hosting', lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.9 },
      { url: '/en/services/domain-hosting', lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.9 },
      // Domain search
      { url: '/bn/domains', lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.85 },
      { url: '/en/domains', lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.85 },
      // SEO Landing Pages (high intent keywords)
      { url: '/bn/best-hosting-in-bangladesh', lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.85 },
      { url: '/en/best-hosting-in-bangladesh', lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.85 },
      { url: '/bn/web-design-company-in-dhaka', lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.85 },
      { url: '/en/web-design-company-in-dhaka', lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.85 },
      { url: '/bn/erp-software-bangladesh', lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.85 },
      { url: '/en/erp-software-bangladesh', lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.85 },
      { url: '/bn/travel-agency-website-development-bangladesh', lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.8 },
      { url: '/bn/real-estate-website-development-bd', lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.8 },
      { url: '/bn/hospital-clinic-website-development', lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.8 },
      { url: '/bn/restaurant-website-design-bangladesh', lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.8 },
      { url: '/bn/ecommerce-website-for-fashion-brand', lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.8 },
      // About & Authority Pages
      { url: '/bn/about-us', lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
      { url: '/en/about-us', lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
      { url: '/bn/why-digiwebdex', lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.75 },
      { url: '/en/why-digiwebdex', lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.75 },
      // Case Studies
      { url: '/bn/case-studies', lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.8 },
      { url: '/en/case-studies', lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.8 },
      // Blog
      { url: '/bn/blog', lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 0.85 },
      { url: '/en/blog', lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 0.85 },
      // Contact
      { url: '/bn/contact', lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
      { url: '/en/contact', lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
      // Locations
      { url: '/bn/locations', lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.65 },
      { url: '/en/locations', lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.65 },
    ];

    const allEntries = [...staticPages, ...entries];
    setCache(cacheKey, allEntries);
    return allEntries;
  },

  // Generate XML Sitemap
  async generateSitemapXML(baseUrl: string): Promise<string> {
    const entries = await this.getSitemapEntries();
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const entry of entries) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${entry.url}</loc>\n`;
      xml += `    <lastmod>${entry.lastModified.split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>${entry.changeFrequency}</changefreq>\n`;
      xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
      xml += '  </url>\n';
    }

    xml += '</urlset>';
    return xml;
  },

  // Generate robots.txt content
  generateRobotsTxt(baseUrl: string): string {
    return `# Digiwebdex Robots.txt
User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin and auth pages
Disallow: /*/admin/*
Disallow: /*/auth/*
Disallow: /*/dashboard/*

# Allow search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /
`;
  },

  // Track page view
  async trackPageView(pageTable: string, pageId: string): Promise<void> {
    try {
      await supabase.rpc('increment_page_views', {
        page_table: pageTable,
        page_id: pageId
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  },

  // Get landing page by slug
  async getLandingPage(slug: string) {
    const cacheKey = `landing_${slug}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !data) return null;

    setCache(cacheKey, data);
    return data;
  },

  // Get blog post by slug
  async getBlogPost(slug: string) {
    const cacheKey = `blog_${slug}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        category:blog_categories(*),
        tags:blog_post_tags(tag:blog_tags(*))
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !data) return null;

    setCache(cacheKey, data);
    return data;
  },

  // Get blog posts list
  async getBlogPosts(options: {
    page?: number;
    limit?: number;
    categorySlug?: string;
    tagSlug?: string;
    featured?: boolean;
  } = {}) {
    const { page = 1, limit = 10, categorySlug, tagSlug, featured } = options;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        category:blog_categories(slug, name_bn, name_en)
      `, { count: 'exact' })
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (categorySlug) {
      const { data: category } = await supabase
        .from('blog_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();
      
      if (category) {
        query = query.eq('category_id', category.id);
      }
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }

    const { data, count, error } = await query;

    if (error) return { posts: [], total: 0 };

    return {
      posts: data || [],
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  // Get blog categories
  async getBlogCategories() {
    const cacheKey = 'blog_categories';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) return [];

    setCache(cacheKey, data);
    return data;
  },

  // Get location page
  async getLocationPage(slug: string) {
    const cacheKey = `location_${slug}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('location_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !data) return null;

    setCache(cacheKey, data);
    return data;
  },

  // Get all location pages
  async getLocationPages() {
    const cacheKey = 'location_pages';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('location_pages')
      .select('*')
      .eq('is_published', true)
      .order('division', { ascending: true });

    if (error) return [];

    setCache(cacheKey, data);
    return data;
  },

  // Clear cache
  clearCache(key?: string): void {
    if (key) {
      seoCache.delete(key);
    } else {
      seoCache.clear();
    }
  }
};
