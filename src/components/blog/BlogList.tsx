import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { seoService, type BlogCategoryRow } from '@/services/seo';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { bn, enUS } from 'date-fns/locale';

interface BlogPost {
  id: string;
  slug: string;
  title_bn: string;
  title_en: string;
  excerpt_bn: string | null;
  excerpt_en: string | null;
  featured_image: string | null;
  published_at: string;
  reading_time_minutes: number;
  category?: {
    slug: string;
    name_bn: string;
    name_en: string;
  } | null;
}

export function BlogList() {
  const { language } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { categorySlug } = useParams<{ categorySlug?: string }>();

  const basePath = language === 'en' ? '/en' : '/bn';

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [postsResult, categoriesResult] = await Promise.all([
          seoService.getBlogPosts({ page: currentPage, categorySlug }),
          seoService.getBlogCategories()
        ]);
        
        setPosts(postsResult.posts as BlogPost[]);
        setTotalPages(postsResult.totalPages);
        setCategories(categoriesResult as BlogCategoryRow[]);
      } catch (error) {
        console.error('Failed to fetch blog data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentPage, categorySlug]);

  const getTitle = (post: BlogPost) => language === 'bn' ? post.title_bn : post.title_en;
  const getExcerpt = (post: BlogPost) => language === 'bn' ? post.excerpt_bn : post.excerpt_en;
  const getCategoryName = (cat: BlogCategoryRow) => language === 'bn' ? cat.name_bn : cat.name_en;

  const selectedCategory = categories.find(c => c.slug === categorySlug);
  const pageTitle = selectedCategory 
    ? `${getCategoryName(selectedCategory)} - ব্লগ` 
    : (language === 'bn' ? 'ব্লগ' : 'Blog');

  return (
    <Layout>
      <SEOHead
        title={pageTitle}
        description={language === 'bn' 
          ? 'ওয়েব ডেভেলপমেন্ট, ডিজিটাল মার্কেটিং, এসইও এবং প্রযুক্তি বিষয়ক আর্টিকেল পড়ুন।'
          : 'Read articles about web development, digital marketing, SEO, and technology.'}
        keywords={['blog', 'web development', 'digital marketing', 'SEO', 'technology']}
      />

      <div className="container-custom py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'bn' ? 'ব্লগ' : 'Blog'}
          </h1>
          {selectedCategory && (
            <p className="text-lg text-muted-foreground">
              {language === 'bn' ? 'ক্যাটাগরি: ' : 'Category: '}
              <span className="font-medium text-foreground">{getCategoryName(selectedCategory)}</span>
            </p>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link to={`${basePath}/blog`}>
            <Badge variant={!categorySlug ? 'default' : 'outline'} className="cursor-pointer">
              {language === 'bn' ? 'সব' : 'All'}
            </Badge>
          </Link>
          {categories.map(category => (
            <Link key={category.id} to={`${basePath}/blog/category/${category.slug}`}>
              <Badge 
                variant={categorySlug === category.slug ? 'default' : 'outline'} 
                className="cursor-pointer"
              >
                {getCategoryName(category)}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {language === 'bn' ? 'কোনো পোস্ট পাওয়া যায়নি' : 'No posts found'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <Link key={post.id} to={`${basePath}/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  {post.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={post.featured_image} 
                        alt={getTitle(post)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <CardHeader>
                    {post.category && (
                      <Badge variant="secondary" className="w-fit mb-2">
                        {language === 'bn' ? post.category.name_bn : post.category.name_en}
                      </Badge>
                    )}
                    <h2 className="text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {getTitle(post)}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(post.published_at), 'dd MMM yyyy', {
                          locale: language === 'bn' ? bn : enUS
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.reading_time_minutes} {language === 'bn' ? 'মিনিট' : 'min'}
                      </span>
                    </div>
                  </CardHeader>
                  {getExcerpt(post) && (
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3">
                        {getExcerpt(post)}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-md ${
                  currentPage === page 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
