const express = require('express');
const { queryAll } = require('../db');
const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
  try {
    const entries = await queryAll('SELECT * FROM sitemap_entries WHERE is_active = true ORDER BY priority DESC');
    const baseUrl = process.env.SITE_URL || 'https://digiwebdex.com';
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    for (const e of entries) {
      xml += `<url><loc>${baseUrl}${e.url}</loc><lastmod>${e.last_modified?.toISOString().split('T')[0]}</lastmod><priority>${e.priority}</priority></url>\n`;
    }
    xml += '</urlset>';
    
    res.header('Content-Type', 'application/xml').send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

router.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${process.env.SITE_URL || 'https://digiwebdex.com'}/sitemap.xml`);
});

module.exports = router;
