import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = 'https://digiwebdex.com';

    // Static pages
    const staticPages = [
      { url: '/bn', priority: 1.0, changefreq: 'daily' },
      { url: '/en', priority: 1.0, changefreq: 'daily' },
      { url: '/bn/pricing', priority: 0.9, changefreq: 'weekly' },
      { url: '/en/pricing', priority: 0.9, changefreq: 'weekly' },
      { url: '/bn/domains', priority: 0.9, changefreq: 'weekly' },
      { url: '/en/domains', priority: 0.9, changefreq: 'weekly' },
      { url: '/bn/contact', priority: 0.7, changefreq: 'monthly' },
      { url: '/en/contact', priority: 0.7, changefreq: 'monthly' },
      { url: '/bn/blog', priority: 0.8, changefreq: 'daily' },
      { url: '/en/blog', priority: 0.8, changefreq: 'daily' },
      { url: '/bn/locations', priority: 0.8, changefreq: 'weekly' },
      { url: '/en/locations', priority: 0.8, changefreq: 'weekly' },
    ];

    // Get dynamic pages from database
    const [blogPosts, landingPages, locationPages, categories] = await Promise.all([
      supabase
        .from('blog_posts')
        .select('slug, updated_at, priority, change_frequency')
        .eq('is_published', true)
        .eq('is_indexed', true),
      supabase
        .from('landing_pages')
        .select('slug, updated_at, priority, change_frequency')
        .eq('is_published', true)
        .eq('is_indexed', true),
      supabase
        .from('location_pages')
        .select('slug, updated_at, priority')
        .eq('is_published', true)
        .eq('is_indexed', true),
      supabase
        .from('blog_categories')
        .select('slug, updated_at')
        .eq('is_active', true),
    ]);

    // Build sitemap XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    const today = new Date().toISOString().split('T')[0];

    // Add static pages
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority.toFixed(1)}</priority>\n`;
      xml += '  </url>\n';
    }

    // Add blog posts (both languages)
    if (blogPosts.data) {
      for (const post of blogPosts.data) {
        const lastmod = post.updated_at.split('T')[0];
        for (const lang of ['bn', 'en']) {
          xml += '  <url>\n';
          xml += `    <loc>${baseUrl}/${lang}/blog/${post.slug}</loc>\n`;
          xml += `    <lastmod>${lastmod}</lastmod>\n`;
          xml += `    <changefreq>${post.change_frequency || 'monthly'}</changefreq>\n`;
          xml += `    <priority>${(post.priority || 0.7).toFixed(1)}</priority>\n`;
          xml += '  </url>\n';
        }
      }
    }

    // Add blog categories
    if (categories.data) {
      for (const cat of categories.data) {
        const lastmod = cat.updated_at.split('T')[0];
        for (const lang of ['bn', 'en']) {
          xml += '  <url>\n';
          xml += `    <loc>${baseUrl}/${lang}/blog/category/${cat.slug}</loc>\n`;
          xml += `    <lastmod>${lastmod}</lastmod>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.6</priority>\n`;
          xml += '  </url>\n';
        }
      }
    }

    // Add landing pages
    if (landingPages.data) {
      for (const page of landingPages.data) {
        const lastmod = page.updated_at.split('T')[0];
        for (const lang of ['bn', 'en']) {
          xml += '  <url>\n';
          xml += `    <loc>${baseUrl}/${lang}/${page.slug}</loc>\n`;
          xml += `    <lastmod>${lastmod}</lastmod>\n`;
          xml += `    <changefreq>${page.change_frequency || 'weekly'}</changefreq>\n`;
          xml += `    <priority>${(page.priority || 0.8).toFixed(1)}</priority>\n`;
          xml += '  </url>\n';
        }
      }
    }

    // Add location pages
    if (locationPages.data) {
      for (const page of locationPages.data) {
        const lastmod = page.updated_at.split('T')[0];
        for (const lang of ['bn', 'en']) {
          xml += '  <url>\n';
          xml += `    <loc>${baseUrl}/${lang}/locations/${page.slug}</loc>\n`;
          xml += `    <lastmod>${lastmod}</lastmod>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>${(page.priority || 0.7).toFixed(1)}</priority>\n`;
          xml += '  </url>\n';
        }
      }
    }

    xml += '</urlset>';

    return new Response(xml, { 
      headers: corsHeaders 
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response('Error generating sitemap', { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
});
