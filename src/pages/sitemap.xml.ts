import type { APIRoute } from 'astro';
import { getPages, getPosts } from '../lib/wordpress';

export const GET: APIRoute = async ({ site }) => {
  const [pages, posts] = await Promise.all([
    getPages(),
    getPosts({ perPage: 1000 })
  ]);

  const urls = [
    // Home page
    { url: '/', lastmod: new Date().toISOString(), priority: '1.0' },
    // Blog index
    { url: '/blog', lastmod: new Date().toISOString(), priority: '0.8' },
    // Individual pages
    ...pages.map(page => ({
      url: `/${page.slug}`,
      lastmod: page.modified,
      priority: '0.9'
    })),
    // Individual blog posts
    ...posts.map(post => ({
      url: `/blog/${post.slug}`,
      lastmod: post.modified,
      priority: '0.6'
    }))
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(({ url, lastmod, priority }) => `
  <url>
    <loc>${site}${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority}</priority>
  </url>`).join('')}
</urlset>`.trim();

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
