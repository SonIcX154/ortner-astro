const WP_URL = 'https://cms.ortner-christine.at/wp-json/wp/v2';

// Error handling wrapper
async function fetchWP(endpoint: string, fallback: any = []) {
  try {
    const res = await fetch(`${WP_URL}${endpoint}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      console.error(`WP API Error: ${res.status} ${res.statusText}`);
      return fallback;
    }
    return await res.json();
  } catch (error) {
    console.error('WP API fetch failed:', error);
    return fallback;
  }
}

export async function getWPPages() {
  return fetchWP('/pages?per_page=100&status=publish', []);
}

export async function getWPPage(slug: string) {
  return fetchWP(`/pages?slug=${slug}&status=publish`, []);
}

export async function getWPPosts() {
  return fetchWP('/posts?per_page=20&status=publish&_embed', []);
}

export async function getWPPost(slug: string) {
  return fetchWP(`/posts?slug=${slug}&status=publish&_embed`, []);
}

export async function getWPMedia(id: number) {
  return fetchWP(`/media/${id}`, null);
}

export async function getWPSettings() {
  return fetchWP('/settings', { title: 'Christine Ortner', description: '' });
}