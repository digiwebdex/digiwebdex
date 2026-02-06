import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { SchemaMarkup, MultiSchemaMarkup } from '@/components/seo/SchemaMarkup';
import { seoService } from '@/services/seo';
import { useLanguage } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, Tag, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { bn, enUS } from 'date-fns/locale';

interface BlogPostFull {
  id: string;
  slug: string;
  title_bn: string;
  title_en: string;
  excerpt_bn: string | null;
  excerpt_en: string | null;
  content_bn: string | null;
  content_en: string | null;
  meta_title_bn: string | null;
  meta_title_en: string | null;
  meta_description_bn: string | null;
  meta_description_en: string | null;
  featured_image: string | null;
  og_image: string | null;
  published_at: string;
  updated_at: string;
  reading_time_minutes: number;
  faq_items: Array<{ question: string; answer: string }> | null;
  keywords: string[] | null;
  category?: {
    slug: string;
    name_bn: string;
    name_en: string;
  };
  tags?: Array<{
    tag: {
      slug: string;
      name_bn: string;
      name_en: string;
    };
  }>;
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const [post, setPost] = useState<BlogPostFull | null>(null);
  const [loading, setLoading] = useState(true);

  const basePath = language === 'en' ? '/en' : '/bn';
  const baseUrl = 'https://digiwebdex.com';

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await seoService.getBlogPost(slug);
        setPost(data as BlogPostFull | null);
        
        // Track page view
        if (data) {
          seoService.trackPageView('blog_posts', (data as BlogPostFull).id);
        }
      } catch (error) {
        console.error('Failed to fetch blog post:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-12 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-48 mb-8" />
          <Skeleton className="h-[400px] w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {language === 'bn' ? 'পোস্ট পাওয়া যায়নি' : 'Post not found'}
          </h1>
          <Link to={`${basePath}/blog`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {language === 'bn' ? 'ব্লগে ফিরে যান' : 'Back to Blog'}
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const title = language === 'bn' ? post.title_bn : post.title_en;
  const content = language === 'bn' ? post.content_bn : post.content_en;
  const metaTitle = language === 'bn' ? post.meta_title_bn : post.meta_title_en;
  const metaDescription = language === 'bn' ? post.meta_description_bn : post.meta_description_en;
  const excerpt = language === 'bn' ? post.excerpt_bn : post.excerpt_en;
  const categoryName = post.category 
    ? (language === 'bn' ? post.category.name_bn : post.category.name_en)
    : null;

  const articleUrl = `${baseUrl}${basePath}/blog/${post.slug}`;

  // Generate schemas
  const articleSchema = seoService.generateArticleSchema({
    title,
    description: metaDescription || excerpt || '',
    image: post.og_image || post.featured_image || `${baseUrl}/og-image.png`,
    authorName: 'Digiwebdex Team',
    publishedAt: post.published_at,
    modifiedAt: post.updated_at,
    url: articleUrl
  });

  const breadcrumbSchema = seoService.generateBreadcrumbSchema([
    { name: language === 'bn' ? 'হোম' : 'Home', url: baseUrl },
    { name: language === 'bn' ? 'ব্লগ' : 'Blog', url: `${baseUrl}${basePath}/blog` },
    ...(post.category ? [{ 
      name: categoryName!, 
      url: `${baseUrl}${basePath}/blog/category/${post.category.slug}` 
    }] : []),
    { name: title, url: articleUrl }
  ]);

  const faqSchema = post.faq_items && post.faq_items.length > 0
    ? seoService.generateFAQSchema(post.faq_items)
    : null;

  const schemas = [
    { schema: articleSchema, id: 'article-schema' },
    { schema: breadcrumbSchema, id: 'breadcrumb-schema' },
    ...(faqSchema ? [{ schema: faqSchema, id: 'faq-schema' }] : [])
  ];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: excerpt || '',
          url: window.location.href
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Layout>
      <SEOHead
        title={metaTitle || title}
        description={metaDescription || excerpt || ''}
        keywords={post.keywords || []}
        ogImage={post.og_image || post.featured_image || undefined}
        ogType="article"
        canonicalUrl={articleUrl}
        publishedTime={post.published_at}
        modifiedTime={post.updated_at}
        author="Digiwebdex Team"
      />
      <MultiSchemaMarkup schemas={schemas} />

      <article className="container-custom py-12 max-w-4xl">
        {/* Back link */}
        <Link to={`${basePath}/blog`} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {language === 'bn' ? 'ব্লগে ফিরে যান' : 'Back to Blog'}
        </Link>

        {/* Category */}
        {post.category && (
          <Link to={`${basePath}/blog/category/${post.category.slug}`}>
            <Badge className="mb-4">{categoryName}</Badge>
          </Link>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          {title}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(post.published_at), 'dd MMMM yyyy', {
              locale: language === 'bn' ? bn : enUS
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {post.reading_time_minutes} {language === 'bn' ? 'মিনিট পড়া' : 'min read'}
          </span>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-1" />
            {language === 'bn' ? 'শেয়ার' : 'Share'}
          </Button>
        </div>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="aspect-video overflow-hidden rounded-lg mb-8">
            <img 
              src={post.featured_image} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: content || '' }}
        />

        {/* FAQ Section */}
        {post.faq_items && post.faq_items.length > 0 && (
          <>
            <Separator className="my-8" />
            <section>
              <h2 className="text-2xl font-bold mb-6">
                {language === 'bn' ? 'সচরাচর জিজ্ঞাসা' : 'Frequently Asked Questions'}
              </h2>
              <div className="space-y-4">
                {post.faq_items.map((faq, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <>
            <Separator className="my-8" />
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {post.tags.map(({ tag }) => (
                <Link key={tag.slug} to={`${basePath}/blog/tag/${tag.slug}`}>
                  <Badge variant="outline">
                    {language === 'bn' ? tag.name_bn : tag.name_en}
                  </Badge>
                </Link>
              ))}
            </div>
          </>
        )}
      </article>
    </Layout>
  );
}
