# Christine Ortner Portfolio - Astro + WordPress

This is a static portfolio website built with Astro that fetches content from a WordPress CMS via the REST API.

## Architecture

- **Public Site**: Built with Astro, hosted as static files
- **CMS**: WordPress running at `cms.ortner-christine.at` (or locally via VPN)
- **Integration**: WordPress REST API (public endpoints, no authentication required)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure WordPress URL

The WordPress API URL is already configured in `.env`:

```env
WORDPRESS_API_URL=https://cms.ortner-christine.at/wp-json/wp/v2
```

For local development via VPN, uncomment and update the local URL:

```env
# WORDPRESS_API_URL=http://your-local-nas-ip/wp-json/wp/v2
```

### 3. WordPress Configuration

#### Enable REST API (Already enabled by default)

The WordPress REST API is enabled by default. No additional configuration needed for public content.

#### CORS Configuration (If needed)

If you encounter CORS errors during development, add this to your WordPress `functions.php`:

```php
// Allow CORS for REST API
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        return $value;
    });
});
```

#### Recommended WordPress Settings

1. **Permalinks**: Go to Settings → Permalinks and choose "Post name" structure
2. **Pages**: Create your portfolio pages in WordPress
3. **Featured Images**: Set featured images for pages to display them on the Astro site
4. **Excerpts**: Add custom excerpts to pages for better preview cards

## Development

### Run Development Server

```bash
npm run dev
```

The site will be available at `http://localhost:4321`

### Build for Production

```bash
npm run build
```

The static site will be generated in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
├── src/
│   ├── lib/
│   │   └── wordpress.ts        # WordPress API integration functions
│   ├── types/
│   │   └── wordpress.ts        # TypeScript types for WordPress data
│   ├── pages/
│   │   ├── index.astro         # Homepage (lists all pages)
│   │   └── page/
│   │       └── [slug].astro    # Dynamic page routes
│   └── public/
│       └── favicon.svg
├── .env                         # Environment variables (not in git)
└── astro.config.mjs            # Astro configuration
```

## WordPress API Integration

### Available Functions

The `src/lib/wordpress.ts` file provides these functions:

#### Pages
- `getPages(options?)` - Fetch all pages
- `getPageBySlug(slug)` - Fetch a single page by slug
- `getPageById(id)` - Fetch a single page by ID

#### Posts (for future use)
- `getPosts(options?)` - Fetch all posts
- `getPostBySlug(slug)` - Fetch a single post by slug
- `getPostById(id)` - Fetch a single post by ID

#### Media & Helpers
- `getFeaturedImageUrl(item, size?)` - Get featured image URL
- `getExcerpt(item, maxLength?)` - Get excerpt text
- `stripHtml(html)` - Remove HTML tags
- `truncateText(text, maxLength)` - Truncate text

### Example Usage

```astro
---
import { getPages, getFeaturedImageUrl } from '../lib/wordpress';

const pages = await getPages();
---

{pages.map(page => (
  <article>
    <h2>{page.title.rendered}</h2>
    {getFeaturedImageUrl(page) && (
      <img src={getFeaturedImageUrl(page)} alt={page.title.rendered} />
    )}
    <div set:html={page.content.rendered} />
  </article>
))}
```

## How It Works

### Static Site Generation

1. **Build Time**: When you run `npm run build`, Astro fetches all pages from WordPress
2. **Static Paths**: Each WordPress page becomes a static route (`/page/[slug]`)
3. **No Runtime API Calls**: The built site contains all content as static HTML
4. **Rebuild**: To update content, rebuild and redeploy the site

### Benefits

- ✅ **Fast**: Static HTML, no database queries
- ✅ **SEO Friendly**: Fully rendered HTML for search engines
- ✅ **Scalable**: Can be hosted on CDN
- ✅ **Secure**: No WordPress exposed to public
- ✅ **Separation**: Content management separate from public site

## Deployment

### Build the Site

```bash
npm run build
```

### Deploy Options

The `dist/` folder can be deployed to:

- **Netlify**: Drag & drop or connect Git repository
- **Vercel**: Connect Git repository
- **GitHub Pages**: Upload to repository
- **Traditional Hosting**: Upload via FTP/SFTP
- **CDN**: CloudFlare Pages, AWS S3 + CloudFront, etc.

### Automatic Rebuilds

To automatically rebuild when WordPress content changes, you can:

1. **Webhooks**: Configure WordPress to trigger a build webhook
2. **Scheduled Builds**: Set up cron jobs to rebuild periodically
3. **GitHub Actions**: Create workflow to rebuild on schedule or webhook

Example webhook plugin for WordPress: [Jamstack Deployments](https://wordpress.org/plugins/wp-jamstack-deployments/)

## WordPress Content Guidelines

### Page Creation

1. Create pages in WordPress (not posts, unless you want to add blog functionality)
2. Add a featured image for better visual presentation
3. Use the page editor to add content with formatting
4. Set a custom excerpt for homepage preview (optional)

### Content Best Practices

- **Images**: Optimize images before uploading (use WebP format when possible)
- **URLs**: Use descriptive slugs for better SEO
- **Headings**: Use proper heading hierarchy (H2, H3, etc.)
- **Links**: Internal links should use relative paths when possible

## Troubleshooting

### "Error loading content" on Homepage

**Problem**: Cannot connect to WordPress API

**Solutions**:
1. Check WordPress is running and accessible
2. Verify `WORDPRESS_API_URL` in `.env` is correct
3. Check WordPress REST API is enabled (visit `/wp-json` in browser)
4. If using VPN for local development, ensure VPN is connected

### Build Fails with API Error

**Problem**: Build process cannot fetch from WordPress

**Solutions**:
1. Ensure WordPress is accessible from build environment
2. Check WordPress REST API is publicly accessible
3. Verify no authentication is required for pages endpoint
4. Check firewall/security settings

### CORS Errors in Development

**Problem**: Browser blocks API requests during development

**Solution**: Add CORS headers to WordPress (see Configuration section above)

### Images Not Loading

**Problem**: WordPress images return 404

**Solutions**:
1. Verify image URLs are correct in WordPress
2. Check WordPress media library permissions
3. Ensure WordPress URL is correctly configured

## Extending the Site

### Add Blog Posts

To add blog functionality:

1. Create `src/pages/blog/index.astro` for blog listing
2. Create `src/pages/blog/[slug].astro` for individual posts
3. Use `getPosts()` function from wordpress.ts

### Add Custom Post Types

To support custom post types:

1. Register custom post type in WordPress
2. Ensure REST API is enabled for the post type
3. Create fetch function in `wordpress.ts`
4. Add TypeScript types in `wordpress.ts`
5. Create Astro pages for the custom post type

### Add Search

For static search, consider:
- [Pagefind](https://pagefind.app/) - Static search library
- [Fuse.js](https://fusejs.io/) - Client-side fuzzy search
- [Algolia](https://www.algolia.com/) - External search service

## Support

For questions or issues:
- Astro Documentation: https://docs.astro.build
- WordPress REST API: https://developer.wordpress.org/rest-api/
- GitHub Issues: [Your repository URL]

## License

[Your chosen license]
