import { useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';

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
  author
}: SEOHeadProps) {
  const { language, t } = useLanguage();
  
  const baseUrl = 'https://digiwebdex.com';
  const defaultOgImage = `${baseUrl}/og-image.png`;
  
  const finalTitle = title 
    ? `${title} | Digiwebdex` 
    : language === 'bn' 
      ? 'Digiwebdex - বাংলাদেশের শীর্ষ ওয়েব সার্ভিস প্রোভাইডার'
      : 'Digiwebdex - Leading Web Services Provider in Bangladesh';
  
  const finalDescription = description || (
    language === 'bn'
      ? 'ডোমেইন রেজিস্ট্রেশন, ওয়েব হোস্টিং, ওয়েব ডেভেলপমেন্ট এবং ডিজিটাল মার্কেটিং সেবা। বাংলাদেশের সেরা দামে সেরা সার্ভিস।'
      : 'Domain registration, web hosting, web development, and digital marketing services. Best prices in Bangladesh.'
  );

  useEffect(() => {
    // Update document title
    document.title = finalTitle;

    // Helper to update or create meta tag
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

    // Helper to update or create link tag
    const updateLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
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

    // Robots
    if (noIndex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      updateMeta('robots', 'index, follow');
    }

    // OpenGraph tags
    updateMeta('og:title', finalTitle, true);
    updateMeta('og:description', finalDescription, true);
    updateMeta('og:type', ogType, true);
    updateMeta('og:image', ogImage || defaultOgImage, true);
    updateMeta('og:locale', language === 'bn' ? 'bn_BD' : 'en_US', true);
    updateMeta('og:site_name', 'Digiwebdex', true);

    if (canonicalUrl) {
      updateMeta('og:url', canonicalUrl, true);
      updateLink('canonical', canonicalUrl);
    }

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:site', '@digiwebdex');
    updateMeta('twitter:title', finalTitle);
    updateMeta('twitter:description', finalDescription);
    updateMeta('twitter:image', ogImage || defaultOgImage);

    // Article specific tags
    if (ogType === 'article') {
      if (publishedTime) {
        updateMeta('article:published_time', publishedTime, true);
      }
      if (modifiedTime) {
        updateMeta('article:modified_time', modifiedTime, true);
      }
      if (author) {
        updateMeta('article:author', author, true);
      }
    }

    // Language alternates
    updateLink('alternate', `${baseUrl}/bn`);

    // Cleanup function
    return () => {
      // Meta tags will be updated on next render
    };
  }, [finalTitle, finalDescription, keywords, ogImage, ogType, canonicalUrl, noIndex, language, publishedTime, modifiedTime, author]);

  return null; // This component only handles side effects
}
