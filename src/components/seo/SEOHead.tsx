import { useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  canonicalUrl?: string;
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export function SEOHead({
  title,
  description,
  keywords = [],
  ogImage,
  ogType = 'website',
  canonicalUrl,
  noIndex = false,
  publishedTime,
  modifiedTime,
  author,
  breadcrumbs
}: SEOHeadProps) {
  const { language } = useLanguage();
  const location = useLocation();
  
  const baseUrl = 'https://digiwebdex.com';
  const defaultOgImage = `${baseUrl}/og-image.png`;
  
  // Build proper title with keyword-first format
  const finalTitle = title 
    ? `${title} | Digiwebdex` 
    : language === 'bn' 
      ? 'Digiwebdex - বাংলাদেশের #১ ওয়েব ডেভেলপমেন্ট ও সফটওয়্যার কোম্পানি'
      : 'Digiwebdex - #1 Web Development & Software Company in Bangladesh';
  
  const finalDescription = description || (
    language === 'bn'
      ? 'ডোমেইন রেজিস্ট্রেশন, ওয়েব হোস্টিং, ওয়েব ডেভেলপমেন্ট, সফটওয়্যার ডেভেলপমেন্ট এবং ডিজিটাল মার্কেটিং সেবা। বাংলাদেশের সেরা দামে সেরা সার্ভিস। ৫০০+ সফল প্রজেক্ট।'
      : 'Domain registration, web hosting, web development, software development, and digital marketing services. Best prices in Bangladesh. 500+ successful projects.'
  );

  // Get current path for hreflang
  const currentPath = location.pathname;
  const pathWithoutLang = currentPath.replace(/^\/(bn|en)/, '');

  useEffect(() => {
    document.title = finalTitle;

    const updateMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const updateLink = (rel: string, href: string, attrs?: Record<string, string>) => {
      const selector = attrs 
        ? `link[rel="${rel}"][hreflang="${attrs.hreflang || ''}"]`
        : `link[rel="${rel}"]:not([hreflang])`;
      let link = document.querySelector(selector);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        if (attrs) {
          Object.entries(attrs).forEach(([key, val]) => link!.setAttribute(key, val));
        }
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Basic meta tags
    updateMeta('description', finalDescription);
    if (keywords.length > 0) {
      updateMeta('keywords', keywords.join(', '));
    }
    updateMeta('author', author || 'Digiwebdex');

    // Enhanced robots directive
    if (noIndex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      updateMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // Canonical URL
    const finalCanonical = canonicalUrl || `${baseUrl}${currentPath}`;
    updateLink('canonical', finalCanonical);

    // Hreflang alternates
    updateLink('alternate', `${baseUrl}/bn${pathWithoutLang}`, { hreflang: 'bn' });
    updateLink('alternate', `${baseUrl}/en${pathWithoutLang}`, { hreflang: 'en' });
    updateLink('alternate', `${baseUrl}/bn${pathWithoutLang}`, { hreflang: 'x-default' });

    // OpenGraph tags
    updateMeta('og:title', finalTitle, true);
    updateMeta('og:description', finalDescription, true);
    updateMeta('og:type', ogType, true);
    updateMeta('og:image', ogImage || defaultOgImage, true);
    updateMeta('og:image:width', '1200', true);
    updateMeta('og:image:height', '630', true);
    updateMeta('og:locale', language === 'bn' ? 'bn_BD' : 'en_US', true);
    updateMeta('og:locale:alternate', language === 'bn' ? 'en_US' : 'bn_BD', true);
    updateMeta('og:site_name', 'Digiwebdex', true);
    updateMeta('og:url', finalCanonical, true);

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:site', '@digiwebdex');
    updateMeta('twitter:title', finalTitle);
    updateMeta('twitter:description', finalDescription);
    updateMeta('twitter:image', ogImage || defaultOgImage);

    // Article specific tags
    if (ogType === 'article') {
      if (publishedTime) updateMeta('article:published_time', publishedTime, true);
      if (modifiedTime) updateMeta('article:modified_time', modifiedTime, true);
      if (author) updateMeta('article:author', author, true);
    }

    // Breadcrumb Schema (inject dynamically)
    if (breadcrumbs && breadcrumbs.length > 0) {
      const existingBreadcrumb = document.getElementById('breadcrumb-schema');
      if (existingBreadcrumb) existingBreadcrumb.remove();
      
      const script = document.createElement('script');
      script.id = 'breadcrumb-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${baseUrl}${item.url}`
        }))
      });
      document.head.appendChild(script);
    }

    return () => {
      const breadcrumbScript = document.getElementById('breadcrumb-schema');
      if (breadcrumbScript) breadcrumbScript.remove();
    };
  }, [finalTitle, finalDescription, keywords, ogImage, ogType, canonicalUrl, noIndex, language, publishedTime, modifiedTime, author, currentPath, pathWithoutLang, breadcrumbs]);

  return null;
}