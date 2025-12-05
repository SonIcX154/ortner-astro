import type { WPPage, WPPost, WPMedia, WPCategory, WPTag } from '../types/wordpress';

const WORDPRESS_API_URL = import.meta.env.WORDPRESS_API_URL;

if (!WORDPRESS_API_URL) {
  throw new Error('WORDPRESS_API_URL environment variable is not set');
}

interface FetchOptions {
  perPage?: number;
  page?: number;
  embed?: boolean;
  orderby?: 'date' | 'modified' | 'title' | 'slug' | 'id' | 'menu_order';
  order?: 'asc' | 'desc';
  status?: 'publish' | 'draft' | 'pending' | 'private' | 'any';
  search?: string;
  slug?: string;
  parent?: number;
  categories?: number[];
  tags?: number[];
}

/**
 * Generic fetch function for WordPress REST API
 */
async function fetchFromWordPress<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    perPage = 100,
    page = 1,
    embed = true,
    orderby = 'date',
    order = 'desc',
    status = 'publish',
    search,
    slug,
    parent,
    categories,
    tags,
  } = options;

  const params = new URLSearchParams({
    per_page: perPage.toString(),
    page: page.toString(),
    orderby,
    order,
    status,
    ...(embed && { _embed: 'true' }),
    ...(search && { search }),
    ...(slug && { slug }),
    ...(parent !== undefined && { parent: parent.toString() }),
  });

  if (categories && categories.length > 0) {
    params.append('categories', categories.join(','));
  }

  if (tags && tags.length > 0) {
    params.append('tags', tags.join(','));
  }

  const url = `${WORDPRESS_API_URL}/${endpoint}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching from WordPress: ${url}`, error);
    throw error;
  }
}

/**
 * Fetch all pages from WordPress
 */
export async function getPages(options: FetchOptions = {}): Promise<WPPage[]> {
  return fetchFromWordPress<WPPage[]>('pages', {
    orderby: 'menu_order',
    order: 'asc',
    ...options,
  });
}

/**
 * Fetch a single page by slug
 */
export async function getPageBySlug(slug: string): Promise<WPPage | null> {
  const pages = await fetchFromWordPress<WPPage[]>('pages', { slug, embed: true });
  return pages.length > 0 ? pages[0] : null;
}

/**
 * Fetch a single page by ID
 */
export async function getPageById(id: number): Promise<WPPage> {
  return fetchFromWordPress<WPPage>(`pages/${id}`, { embed: true });
}

/**
 * Fetch all posts from WordPress
 */
export async function getPosts(options: FetchOptions = {}): Promise<WPPost[]> {
  return fetchFromWordPress<WPPost[]>('posts', options);
}

/**
 * Fetch a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const posts = await fetchFromWordPress<WPPost[]>('posts', { slug, embed: true });
  return posts.length > 0 ? posts[0] : null;
}

/**
 * Fetch a single post by ID
 */
export async function getPostById(id: number): Promise<WPPost> {
  return fetchFromWordPress<WPPost>(`posts/${id}`, { embed: true });
}

/**
 * Fetch media item by ID
 */
export async function getMediaById(id: number): Promise<WPMedia> {
  return fetchFromWordPress<WPMedia>(`media/${id}`);
}

/**
 * Fetch all categories
 */
export async function getCategories(options: FetchOptions = {}): Promise<WPCategory[]> {
  return fetchFromWordPress<WPCategory[]>('categories', {
    perPage: 100,
    orderby: 'id' as any,
    order: 'asc',
    ...options,
  });
}

/**
 * Fetch all tags
 */
export async function getTags(options: FetchOptions = {}): Promise<WPTag[]> {
  return fetchFromWordPress<WPTag[]>('tags', {
    perPage: 100,
    orderby: 'id' as any,
    order: 'asc',
    ...options,
  });
}

/**
 * Get featured image URL from page/post
 */
export function getFeaturedImageUrl(
  item: WPPage | WPPost,
  size: 'thumbnail' | 'medium' | 'medium_large' | 'large' | 'full' = 'full'
): string | null {
  const media = item._embedded?.['wp:featuredmedia']?.[0];
  
  if (!media) {
    return null;
  }

  // Try to get specific size
  if (size !== 'full' && media.media_details?.sizes?.[size]) {
    return media.media_details.sizes[size].source_url;
  }

  // Fallback to source URL
  return media.source_url || null;
}

/**
 * Helper to strip HTML tags from content
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

/**
 * Helper to truncate text intelligently (avoid cutting words)
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  // Try to cut at sentence boundary
  const cutAt = text.lastIndexOf('.', maxLength);
  if (cutAt > maxLength * 0.7) {
    return text.substring(0, cutAt + 1).trim();
  }
  
  // Otherwise cut at word boundary
  const lastSpace = text.lastIndexOf(' ', maxLength);
  if (lastSpace > maxLength * 0.7) {
    return text.substring(0, lastSpace).trim() + '...';
  }
  
  // Fallback: hard cut
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Helper to get excerpt from page/post with smart truncation
 */
export function getExcerpt(
  item: WPPage | WPPost,
  maxLength: number = 155  // Google meta description sweet spot
): string {
  // Try excerpt first
  let text = item.excerpt?.rendered || '';
  
  // Fallback to content if no excerpt
  if (!text.trim()) {
    text = item.content?.rendered || '';
  }
  
  const stripped = stripHtml(text);
  return truncateText(stripped, maxLength);
}
