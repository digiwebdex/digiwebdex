const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'text/plain',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const baseUrl = 'https://digiwebdex.com';

  const robotsTxt = `# Digiwebdex Robots.txt
# Generated dynamically

User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin and auth pages
Disallow: /*/admin/*
Disallow: /*/auth/*
Disallow: /*/dashboard/*

# Allow specific crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: LinkedInBot
Allow: /
`;

  return new Response(robotsTxt, { headers: corsHeaders });
});
