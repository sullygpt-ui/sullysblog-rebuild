# Category RSS Feeds - Specification Document

## Overview

This document describes the RSS feed system for SullysBlog.com, which allows users and feed readers to subscribe to blog posts by category.

---

## What It Does (Plain English)

RSS (Really Simple Syndication) feeds allow people to subscribe to your blog content using feed reader apps like Feedly, Inoreader, or built-in browser readers. When you publish a new post, subscribers automatically see it in their feed reader without having to visit your website.

The category feeds let subscribers follow only specific topics they're interested in. For example, someone interested only in "Domains" content can subscribe to just that category's feed.

### Key Features

1. **Main RSS Feed** (`/rss.xml`) - Shows all recent posts from all categories
2. **Category Feeds** (`/category/{slug}/feed`) - Shows posts from a specific category only
3. **Legacy URL Support** (`/category/domians/feed`) - Handles a typo URL that was previously shared, redirecting to the correct "domains" category

---

## Available URLs

| URL | Description |
|-----|-------------|
| `https://sullysblog.com/rss.xml` | Main feed with all posts |
| `https://sullysblog.com/category/domains/feed` | Domains category feed |
| `https://sullysblog.com/category/domians/feed` | Typo URL → redirects to domains feed |
| `https://sullysblog.com/category/{any-category}/feed` | Any category's feed |
| `https://sullysblog.com/api/feed?cat={slug}` | Direct API endpoint |

---

## How It Works (Technical)

### Architecture

```
User Request
     ↓
Vercel Edge (vercel.json rewrites)
     ↓
Next.js Middleware (middleware.ts)
     ↓
API Route (/api/feed/route.ts)
     ↓
Supabase Database
     ↓
XML Response
```

### 1. Vercel Edge Rewrites (`vercel.json`)

When a request comes in for `/category/{slug}/feed`, Vercel's edge network intercepts it **before** it reaches the Next.js application. This is the fastest routing layer.

```json
{
  "rewrites": [
    {
      "source": "/category/domians/feed",
      "destination": "/api/feed?cat=domains"
    },
    {
      "source": "/category/:slug/feed",
      "destination": "/api/feed?cat=:slug"
    }
  ]
}
```

**Why this matters:** Vercel rewrites run at the CDN edge, before any application code. This ensures the feed URLs work even if there are conflicting page routes.

### 2. Next.js Middleware (`middleware.ts`)

As a backup layer, the middleware also handles feed URL patterns:

```typescript
// Handle /category/:slug/feed URLs
const categoryFeedMatch = pathname.match(/^\/category\/([^/]+)\/feed\/?$/)
if (categoryFeedMatch) {
  const slug = categoryFeedMatch[1]
  const feedUrl = new URL('/api/feed', request.url)
  // Handle typo "domians" -> "domains"
  feedUrl.searchParams.set('cat', slug === 'domians' ? 'domains' : slug)
  return NextResponse.rewrite(feedUrl)
}
```

### 3. API Route (`/api/feed/route.ts`)

The actual feed generation happens here:

1. **Receives category slug** from query parameter `?cat=domains`
2. **Looks up category** in Supabase database
3. **Fetches posts** that are:
   - Status = 'published'
   - Belong to the requested category
   - Ordered by publish date (newest first)
   - Limited to 50 posts
4. **Generates RSS 2.0 XML** with proper namespaces for content and Dublin Core metadata
5. **Returns response** with `Content-Type: application/xml`

### 4. RSS XML Structure

The generated feed follows RSS 2.0 specification:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SullysBlog.com - {Category Name}</title>
    <link>https://sullysblog.com/category/{slug}</link>
    <description>...</description>
    <language>en-us</language>
    <lastBuildDate>{current date}</lastBuildDate>
    <atom:link href="..." rel="self" type="application/rss+xml"/>
    <image>
      <url>https://sullysblog.com/logo.png</url>
      <title>SullysBlog.com</title>
      <link>https://sullysblog.com</link>
    </image>

    <item>
      <title>{Post Title}</title>
      <link>https://sullysblog.com/{post-slug}</link>
      <guid isPermaLink="true">https://sullysblog.com/{post-slug}</guid>
      <description>{Excerpt}</description>
      <content:encoded><![CDATA[{Full HTML Content}]]></content:encoded>
      <pubDate>{RFC 2822 Date}</pubDate>
      <dc:creator>Michael Sullivan</dc:creator>
      <category>{Category Name}</category>
    </item>
    <!-- More items... -->
  </channel>
</rss>
```

---

## Configuration

### Next.js Config (`next.config.ts`)

Contains `beforeFiles` rewrites as an additional routing layer:

```typescript
async rewrites() {
  return {
    beforeFiles: [
      {
        source: '/category/domians/feed',
        destination: '/api/feed?cat=domains',
      },
      {
        source: '/category/:slug/feed',
        destination: '/api/feed?cat=:slug',
      },
    ],
  };
}
```

### Removed Redirects

Previously, `redirects.json` contained rules that stripped `/feed` from category URLs. These were removed to allow the feed URLs to work:

```json
// REMOVED - these were blocking feed URLs
{
  "source": "/category/:slug/feed/",
  "destination": "/category/:slug",
  "permanent": true
}
```

---

## Caching

The API route sets cache headers for 1 hour:

```typescript
headers: {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=3600'
}
```

- `max-age=3600`: Browsers cache for 1 hour
- `s-maxage=3600`: CDN/Vercel edge caches for 1 hour

---

## Error Handling

| Scenario | Response |
|----------|----------|
| Category not found | 404 "Category not found" |
| Database error | 500 "Error fetching posts" |
| No posts in category | Returns valid RSS with empty item list |

---

## Testing

To test the feeds:

```bash
# Test the typo URL
curl -sL "https://sullysblog.com/category/domians/feed" | head -10

# Test a real category
curl -sL "https://sullysblog.com/category/domains/feed" | head -10

# Test the direct API
curl -sL "https://sullysblog.com/api/feed?cat=domains" | head -10
```

Expected output should start with:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
```

---

## Files Involved

| File | Purpose |
|------|---------|
| `vercel.json` | Edge-level URL rewrites |
| `middleware.ts` | Backup URL handling + typo correction |
| `next.config.ts` | Next.js level rewrites |
| `app/api/feed/route.ts` | RSS feed generation |
| `app/rss.xml/route.ts` | Main site RSS feed |
| `redirects.json` | Legacy redirects (feed rules removed) |

---

## Summary

The category RSS feed system provides:

1. **Clean URLs** - `/category/domains/feed` instead of query strings
2. **Legacy support** - Handles the `/category/domians/feed` typo
3. **Standard RSS 2.0** - Compatible with all feed readers
4. **Full content** - Includes both excerpts and full post HTML
5. **Proper caching** - 1-hour cache for performance
6. **Error handling** - Graceful failures with appropriate status codes
