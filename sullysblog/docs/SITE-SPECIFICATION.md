# SullysBlog.com - Complete Site Specification

## Table of Contents

1. [Overview](#overview)
2. [What This Site Does (Plain English)](#what-this-site-does-plain-english)
3. [Technology Stack](#technology-stack)
4. [Site Architecture](#site-architecture)
5. [Public Features](#public-features)
6. [Admin Features](#admin-features)
7. [Database Schema](#database-schema)
8. [API Reference](#api-reference)
9. [Authentication & Security](#authentication--security)
10. [Third-Party Integrations](#third-party-integrations)
11. [Scheduled Tasks](#scheduled-tasks)
12. [File Structure](#file-structure)
13. [Environment Variables](#environment-variables)

---

## Overview

SullysBlog.com is a domain investing blog and educational platform built with Next.js 16 and Supabase. It provides:

- A blog for domain investing content
- A digital product store (ebooks, templates, courses)
- A domain name dictionary/glossary
- Domains for sale listings
- A resource directory for domain tools
- An advertising platform
- Newsletter subscription

---

## What This Site Does (Plain English)

### For Visitors

**Reading Blog Posts**
Visitors can browse articles about domain investing. Posts are organized by categories (like "Domain Sales", "Domain Investing", etc.). Each post has a featured image, excerpt, and full content. Visitors can also leave comments on posts.

**Learning Domain Terms**
The Domain Name Dictionary explains industry terminology. Each term has a short definition (shown in listings) and a full detailed explanation on its own page.

**Buying Digital Products**
The store sells educational products like ebooks and templates. Visitors can:
- Browse products with descriptions and prices
- Purchase using credit card (via Stripe)
- Download purchased files from their orders page
- Claim free products without payment

**Viewing Domains for Sale**
A listings page shows domains available for purchase, with prices and images.

**Finding Resources**
The resource directory lists useful domain tools and services, organized by category. Some resources are sponsored (paid placements), some are featured, and some are free listings.

**Subscribing to Newsletter**
Visitors can subscribe to receive email updates. Subscriptions sync to Mailchimp for email campaigns.

### For Administrators

**Managing Content**
Admins can create, edit, and delete:
- Blog posts (with scheduling for future publish dates)
- Categories for organizing posts
- Dictionary terms
- Custom pages (like About, Contact)

**Managing Products**
Admins can:
- Create products (ebooks, templates, courses, bundles)
- Upload downloadable files
- Set prices (syncs with Stripe)
- Mark products as featured
- Create bundles that include multiple products

**Managing Ads**
Admins can:
- Create image, HTML, or text ads
- Assign ads to zones (header, sidebar, etc.)
- Set priority (higher = more likely to show)
- Schedule start/end dates
- Track impressions and clicks

**Managing Domains**
Admins can list domains for sale with prices and images.

**Managing Resources**
Admins can:
- Add external resources/tools to the directory
- Set listing type (free, sponsored, featured)
- Track click analytics
- Manage expiration dates for paid listings

**Viewing Analytics**
The admin dashboard shows:
- Total posts, views, ads
- Ad performance (impressions, clicks, CTR)
- Resource click statistics
- Recent activity

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16.1.1 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Payments | Stripe |
| Email | Resend |
| Newsletter | Mailchimp |
| Styling | Tailwind CSS 4 |
| Rich Text Editor | TipTap |
| Charts | Recharts |
| Image Processing | React Easy Crop |
| Hosting | Vercel |

---

## Site Architecture

### Request Flow

```
User Browser
     │
     ▼
Vercel Edge (CDN + Rewrites)
     │
     ▼
Next.js Middleware (Auth + Routing)
     │
     ▼
Next.js App Router
     │
     ├──► Page Components (for pages)
     │         │
     │         ▼
     │    React Server Components
     │         │
     │         ▼
     │    Supabase Queries
     │
     └──► API Routes (for data operations)
               │
               ▼
          Supabase Database
               │
               ▼
          External Services (Stripe, Mailchimp, Resend)
```

### Key Directories

```
/app                 → Pages and API routes
/components          → React components (52 total)
/lib/queries         → Database query functions
/lib/supabase        → Database clients
/lib/email           → Email templates and sending
/public              → Static assets
/docs                → Documentation
```

---

## Public Features

### 1. Homepage (`/`)

**What it shows:**
- 4 sponsor ad banners (if active ads exist)
- Recent blog posts (6 posts)
- Featured products from the store
- Featured dictionary terms
- Sidebar with additional content

**How it works:**
The page fetches data from Supabase on each request:
- Recent published posts with categories
- Featured dictionary terms
- Featured products
- Checks if sponsor ads exist

### 2. Blog (`/blog`)

**What it shows:**
- Paginated list of all published posts (12 per page)
- Post cards with title, excerpt, image, date, category
- Pagination controls

**How it works:**
- Fetches posts where `status = 'published'`
- Orders by `published_at` descending
- Supports page query parameter for pagination

### 3. Individual Blog Post (`/[slug]`)

**What it shows:**
- Post title, author, date, category
- Featured image
- Full post content (HTML)
- Social share buttons
- Related posts (same category)
- Comments section
- Sponsor ad banners (same 4 as homepage)
- Sidebar

**How it works:**
- Looks up post by slug
- Increments view count (fire-and-forget)
- Fetches related posts from same category
- Fetches approved comments
- Generates SEO metadata and JSON-LD structured data

### 4. Category Pages (`/category/[slug]`)

**What it shows:**
- All posts in the specified category
- Category name and description
- Paginated post list

**How it works:**
- Looks up category by slug
- Fetches posts where `category_id` matches
- Only shows published posts

### 5. Domain Name Dictionary (`/domain-name-dictionary`)

**What it shows:**
- Alphabetical listing of all terms (A-Z sections)
- Each term shows name and short definition
- Links to individual term pages

**How it works:**
- Fetches all dictionary terms
- Groups them by first letter
- Displays in alphabetical sections

### 6. Dictionary Term Page (`/domain-name-dictionary/[term]`)

**What it shows:**
- Term name
- Full detailed definition
- Related terms (optional)

**How it works:**
- Looks up term by slug
- Displays full_definition content

### 7. Store (`/store`)

**What it shows:**
- Grid of available products
- Product cards with image, name, price, type
- Free products show "Free" badge
- Sale prices show strikethrough original price

**How it works:**
- Fetches products where `status = 'active'`
- Orders by `display_order`
- Displays product type badges (ebook, template, course, bundle)

### 8. Product Page (`/store/[slug]`)

**What it shows:**
- Product name and description
- Cover image
- Price (or "Free")
- Buy button (or "Get Free" button)
- List of included files
- For bundles: list of included products

**How it works:**
- Fetches product by slug
- Fetches associated product files
- For bundles: fetches included products
- Buy button creates Stripe checkout session
- Free products use claim endpoint

### 9. Checkout Success (`/store/checkout/success`)

**What it shows:**
- Confirmation message
- Order details
- Links to download purchased files

**How it works:**
- Stripe redirects here after payment
- Session ID passed in URL
- Displays order confirmation

### 10. My Orders (`/store/orders`) - Protected

**What it shows:**
- List of user's past orders
- Order date, total, items
- Download links for purchased files

**How it works:**
- Requires authenticated user
- Fetches orders for current user
- Shows download links with access verification

### 11. Domains for Sale (`/domains-for-sale`)

**What it shows:**
- Grid of domains available for purchase
- Domain name, price, image
- Buy/inquiry buttons

**How it works:**
- Fetches domains where `is_active = true`
- Highlighted domains shown prominently

### 12. Resource Directory (`/domain-resources`)

**What it shows:**
- Categorized list of domain tools and services
- Sponsored/featured listings shown prominently
- Click tracking on resource links

**How it works:**
- Fetches active resources
- Groups by category
- Tracks clicks via `/api/resources/track-click`

### 13. Contact Page (`/contact`)

**What it shows:**
- Contact form (name, email, message)
- Contact information

**How it works:**
- Form submits to `/api/contact`
- Sends email via Resend to admin

### 14. RSS Feeds

**Available feeds:**
- `/rss.xml` - All posts
- `/category/[slug]/feed` - Category-specific feed
- `/api/feed?cat=[slug]` - Direct API endpoint

**How it works:**
- Generates RSS 2.0 XML
- Includes title, excerpt, full content, dates
- Cached for 1 hour

---

## Admin Features

### Admin Dashboard (`/admin`)

**Displays:**
- Total posts count
- Total categories count
- Total ads count
- Total post views
- Ad impressions and CTR
- Recent posts list
- Store visibility toggle

### Post Management (`/admin/posts`)

**Features:**
- List all posts with status, date, views
- Create new posts
- Edit existing posts
- Delete posts
- Rich text editor (TipTap)
- Featured image upload
- Category assignment
- SEO title and description
- Scheduling (publish at future date)
- Status: Draft, Scheduled, Published

### Category Management (`/admin/categories`)

**Features:**
- List all categories
- Create/edit/delete categories
- Auto-generate slugs
- Set display order

### Product Management (`/admin/products`)

**Features:**
- List all products
- Create products (ebook, template, course, bundle)
- Upload cover images
- Upload downloadable files
- Set prices (syncs to Stripe)
- Create bundles with included products
- Mark as featured
- Set display order

### Ad Management (`/admin/ads`)

**Features:**
- List all ads with performance stats
- Create image/HTML/text ads
- Assign to zones (header_banner, sidebar, etc.)
- Set priority (higher = more likely to show)
- Schedule start/end dates
- View impressions and clicks

### Domain Management (`/admin/domains`)

**Features:**
- List domains for sale
- Add/edit/delete domains
- Set prices
- Upload images
- Toggle active status
- Mark as highlighted/featured

### Resource Management (`/admin/resources`)

**Features:**
- List all resources
- Add external links/tools
- Set listing type (free, sponsored, featured)
- Set monthly fees for paid listings
- Track expiration dates
- View click analytics

### Order Management (`/admin/orders`)

**Features:**
- View all orders
- Order details with items
- Customer information
- Payment status

### Dictionary Management (`/admin/dictionary`)

**Features:**
- List all terms
- Add/edit/delete terms
- Short and full definitions

### Page Management (`/admin/pages`)

**Features:**
- Edit custom pages (About, Contact, etc.)
- Rich text content editor
- SEO metadata

### Analytics (`/admin/analytics`)

**Features:**
- Resource click tracking
- Top performing resources
- Clicks by category
- Clicks over time (chart)
- Revenue tracking

---

## Database Schema

### Content Tables

**posts**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| slug | text | URL slug (unique) |
| title | text | Post title |
| content | text | HTML content |
| excerpt | text | Short summary |
| featured_image_url | text | Image URL |
| category_id | uuid | Foreign key to categories |
| status | text | draft, scheduled, published |
| published_at | timestamp | Publish date |
| view_count | integer | Number of views |
| seo_title | text | SEO meta title |
| seo_description | text | SEO meta description |

**categories**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Category name |
| slug | text | URL slug |
| description | text | Category description |

**dictionary_terms**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| term | text | The term |
| slug | text | URL slug |
| short_definition | text | Brief definition |
| full_definition | text | Detailed explanation |

**comments**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| post_id | uuid | Foreign key to posts |
| parent_id | uuid | For nested replies |
| author_name | text | Commenter name |
| author_email | text | Commenter email |
| content | text | Comment text |
| status | text | pending, approved, spam |

### E-Commerce Tables

**products**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Product name |
| slug | text | URL slug |
| description | text | Full description |
| price | numeric | Price in dollars |
| product_type | text | ebook, template, course, bundle |
| stripe_product_id | text | Stripe product ID |
| stripe_price_id | text | Stripe price ID |
| status | text | draft, active, archived |
| featured | boolean | Show on homepage |

**product_files**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| product_id | uuid | Foreign key to products |
| file_name | text | Display name |
| file_path | text | Storage path |
| file_size | integer | Size in bytes |

**orders**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to users |
| order_number | text | Human-readable order # |
| total | numeric | Total amount |
| status | text | pending, completed, refunded |
| stripe_session_id | text | Stripe checkout session |

**order_items**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| order_id | uuid | Foreign key to orders |
| product_id | uuid | Foreign key to products |
| price_at_purchase | numeric | Price when purchased |

**download_access**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Who has access |
| product_id | uuid | What product |
| order_id | uuid | From which order |
| download_count | integer | Times downloaded |

### Advertising Tables

**ads**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Internal name |
| ad_zone | text | Placement zone |
| ad_type | text | image, html, text_link |
| content | text | Image URL or HTML |
| link_url | text | Click destination |
| is_active | boolean | Currently active |
| priority | integer | Selection weight |
| start_date | date | When to start showing |
| end_date | date | When to stop showing |

**ad_impressions**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| ad_id | uuid | Which ad was shown |
| page_url | text | Where it was shown |
| created_at | timestamp | When |

**ad_clicks**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| ad_id | uuid | Which ad was clicked |
| page_url | text | Where it was clicked |
| created_at | timestamp | When |

### Resource Tables

**resources**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Resource name |
| slug | text | URL slug |
| category | text | Resource category |
| destination_url | text | External link |
| listing_type | text | free, sponsored, featured |
| monthly_fee | numeric | For paid listings |
| status | text | active, grace_period, expired |
| start_date | date | Listing start |
| end_date | date | Listing expiration |

---

## API Reference

### Public APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/feed` | GET | RSS feed (supports `?cat=` param) |
| `/api/contact` | POST | Submit contact form |
| `/api/newsletter/subscribe` | POST | Subscribe to newsletter |
| `/api/comments` | POST | Submit comment |
| `/api/ads/track-impression` | POST | Track ad view |
| `/api/ads/track-click` | POST | Track ad click |

### Store APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/store/checkout` | POST | Create Stripe checkout |
| `/api/store/claim-free` | POST | Claim free product |
| `/api/store/download/[fileId]` | GET | Get download URL |

### Webhook APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhooks/stripe` | POST | Handle Stripe events |

### Admin APIs (Protected)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/posts` | GET/POST | List/create posts |
| `/api/admin/posts/[id]` | GET/PUT/DELETE | Post operations |
| `/api/admin/products` | GET/POST | List/create products |
| `/api/admin/products/[id]` | GET/PUT/DELETE | Product operations |
| `/api/admin/ads` | GET/POST | List/create ads |
| `/api/admin/ads/[id]` | GET/PUT/DELETE | Ad operations |
| `/api/admin/domains` | GET/POST | List/create domains |
| `/api/admin/resources` | GET/POST | List/create resources |
| `/api/admin/upload-*` | POST | Various file uploads |

---

## Authentication & Security

### How Authentication Works

1. **User Login**: Email/password submitted to Supabase Auth
2. **Session Created**: JWT token stored in cookies
3. **Middleware Check**: Each request checks auth status
4. **Protected Routes**: Unauthorized users redirected

### Protected Routes

| Route Pattern | Protection |
|---------------|------------|
| `/admin/*` | Admin role required |
| `/store/orders` | Logged in required |
| `/store/checkout` | Logged in required |

### Security Measures

- **Row Level Security (RLS)**: Database-level access control
- **Middleware**: Server-side route protection
- **Webhook Verification**: Stripe signature validation
- **Cron Secret**: Validates scheduled job requests
- **Signed URLs**: Temporary download links (1-hour expiry)

---

## Third-Party Integrations

### Stripe (Payments)

**Purpose**: Process payments for products and domains

**How it works**:
1. User clicks "Buy" on product
2. Server creates Stripe checkout session
3. User completes payment on Stripe
4. Stripe sends webhook to `/api/webhooks/stripe`
5. Server creates order and grants download access

**Synced data**:
- Products have `stripe_product_id` and `stripe_price_id`
- Orders store `stripe_session_id` and `stripe_payment_intent_id`

### Mailchimp (Newsletter)

**Purpose**: Manage email newsletter subscribers

**How it works**:
1. User submits email on subscribe form
2. Server saves to local `newsletter_subscribers` table
3. Server syncs to Mailchimp list
4. If Mailchimp fails, local save still succeeds

### Resend (Email)

**Purpose**: Send transactional emails

**Email types**:
- Contact form submissions
- Expiration warnings (7-day, 3-day)
- Grace period notifications
- Renewal confirmations
- Ad expiration warnings

---

## Scheduled Tasks

### Publish Scheduled Posts

**Endpoint**: `/api/cron/publish-scheduled`
**Schedule**: Hourly (configured in vercel.json)

**What it does**:
1. Finds posts where `status = 'scheduled'`
2. Checks if `published_at <= now`
3. Updates status to `'published'`

### Check Expirations

**Endpoint**: `/api/cron/check-expirations`
**Schedule**: Daily at 9 AM (configured in vercel.json)

**What it does**:
1. Checks resources for upcoming expiration
2. Sends 7-day warning email
3. Sends 3-day warning email
4. Notifies when grace period starts
5. Notifies when downgraded to free
6. Checks ads for expiration
7. Sends ad warning emails

---

## File Structure

```
sullysblog/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Homepage
│   ├── layout.tsx                # Root layout
│   ├── [slug]/page.tsx           # Dynamic post pages
│   ├── blog/page.tsx             # Blog listing
│   ├── category/[slug]/page.tsx  # Category pages
│   ├── store/                    # Store pages
│   ├── admin/                    # Admin pages
│   ├── auth/                     # Auth pages
│   ├── api/                      # API routes
│   └── ...
│
├── components/                   # React components
│   ├── layout/                   # Layout components
│   ├── ui/                       # UI components
│   ├── admin/                    # Admin components
│   ├── ads/                      # Ad components
│   ├── blog/                     # Blog components
│   └── seo/                      # SEO components
│
├── lib/                          # Business logic
│   ├── queries/                  # Database queries
│   │   ├── posts.ts
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   ├── ads.ts
│   │   └── ...
│   ├── supabase/                 # Database clients
│   │   ├── server.ts
│   │   ├── client.ts
│   │   └── admin.ts
│   └── email/                    # Email system
│       ├── sender.ts
│       ├── templates.ts
│       └── notifications.ts
│
├── public/                       # Static files
├── docs/                         # Documentation
├── middleware.ts                 # Route middleware
├── next.config.ts                # Next.js config
├── vercel.json                   # Vercel config
├── redirects.json                # Legacy redirects
└── tailwind.config.ts            # Tailwind config
```

---

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `ADMIN_EMAIL` | Email for admin notifications |
| `CRON_SECRET` | Secret for cron job validation |

### Optional

| Variable | Description |
|----------|-------------|
| `MAILCHIMP_API_KEY` | Mailchimp API key |
| `MAILCHIMP_LIST_ID` | Mailchimp audience ID |
| `MAILCHIMP_SERVER_PREFIX` | Mailchimp server (e.g., us21) |
| `CONTACT_EMAIL` | Contact form destination |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL |

---

## Summary

SullysBlog.com is a full-featured domain investing platform with:

- **Content Management**: Blog posts, categories, dictionary, custom pages
- **E-Commerce**: Digital product store with Stripe payments
- **Advertising**: Managed ad system with tracking
- **Resource Directory**: Curated links with paid placements
- **Domain Sales**: Listing and selling domain names
- **Newsletter**: Email subscription with Mailchimp sync
- **Analytics**: View counts, ad performance, click tracking
- **SEO**: Meta tags, structured data, RSS feeds
- **Admin Dashboard**: Full content and business management

The site is built on modern technologies (Next.js 16, Supabase, Stripe) and deployed on Vercel with automatic deployments from GitHub.
