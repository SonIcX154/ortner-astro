import type { APIRoute } from 'astro';
import { getPosts, getExcerpt } from '../lib/wordpress';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getPosts({ perPage: 20 });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Christine Ortner - Blog</title>
    <description>Neueste Beiträge von Christine Ortner</description>
    <link>${site}/blog</link>
    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml" />
    <language>de-at</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${posts.map(post => `
    <item>
      <title><![CDATA[${post.title.rendered}]]></title>
      <description><![CDATA[${getExcerpt(post, 300)}]]></description>
      <link>${site}/blog/${post.slug}</link>
      <guid>${site}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?
        `<enclosure url="${post._embedded['wp:featuredmedia'][0].source_url}" type="image/jpeg" />` : ''}
    </item>`).join('')}
  </channel>
</rss>`.trim();

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
