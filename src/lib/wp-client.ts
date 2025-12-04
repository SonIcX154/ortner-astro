const WP_URL = 'https://cms.ortner-christine.at/wp-json/wp/v2';

export async function getWPPages() {
  const res = await fetch(`${WP_URL}/pages?per_page=20&status=publish`);
  if (!res.ok) throw new Error('WP Pages fetch failed');
  return res.json();
}

export async function getWPPage(slug: string) {
  const res = await fetch(`${WP_URL}/pages?slug=${slug}&status=publish`);
  if (!res.ok) throw new Error('WP Page fetch failed');
  return res.json();
}

export async function getWPPosts() {
  const res = await fetch(`${WP_URL}/posts?per_page=10&status=publish`);
  if (!res.ok) throw new Error('WP Posts fetch failed');
  return res.json();
}