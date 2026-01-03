# SullysBlog Complete Website Specification

**Version**: 1.0
**Last Updated**: December 31, 2025
**Site URL**: https://sullysblog.com

---

## Table of Contents

1. [Overview](#1-overview)
2. [Public Pages (Frontend)](#2-public-pages-frontend)
3. [Admin Pages (Backend)](#3-admin-pages-backend)
4. [Database Schema](#4-database-schema)
5. [API Endpoints](#5-api-endpoints)
6. [Authentication System](#6-authentication-system)
7. [Third-Party Integrations](#7-third-party-integrations)
8. [File Structure](#8-file-structure)
9. [Technical Stack](#9-technical-stack)
10. [Environment Configuration](#10-environment-configuration)

---

## 1. Overview

SullysBlog is a full-featured domain investing blog and e-commerce platform built with Next.js. The site includes:

- **Blog**: Articles about domain investing with categories, comments, and view tracking
- **Store**: Digital products (e-books, templates, bundles, courses) with Stripe payments
- **Domain Marketplace**: Domains for sale with integrated checkout
- **Resource Directory**: Curated list of 100+ domain industry tools and services
- **Domain Dictionary**: Glossary of 50+ domain investing terms
- **Advertising Platform**: Managed ad campaigns with impression/click tracking
- **Newsletter**: Email subscriber collection with Mailchimp integration

---

## 2. Public Pages (Frontend)

### 2.1 Home Page
**URL**: `/`

**Purpose**: Main landing page showcasing the blog

**Features**:
- Hero section with site branding
- 4 sponsor ad slots in hero area
- Recent blog posts (paginated, 12 per page)
- Sticky sidebar with:
  - Category navigation
  - Recent posts widget
  - Newsletter signup form
- Full SEO metadata and Open Graph tags
- JSON-LD schema markup for WebSite

---

### 2.2 Blog Archive
**URL**: `/blog`

**Purpose**: Paginated list of all published blog posts

**Features**:
- Post cards showing:
  - Featured image
  - Title
  - Excerpt (first 150 characters)
  - Publication date
  - View count
  - Category badges
- Pagination (12 posts per page)
- Left sidebar with category filters
- Recent posts widget

---

### 2.3 Blog Post Detail
**URL**: `/{post-slug}`

**Purpose**: Individual blog post display

**Features**:
- Full post content (HTML rendered)
- Featured image at top
- Author byline and date
- Category breadcrumbs
- View count (tracked on page load)
- Comment section:
  - Displays approved comments
  - Comment submission form (name, email, website, comment)
  - Threaded replies supported
  - Comments require approval before display
- Related posts in sidebar
- Ad zones for monetization
- Social sharing metadata

---

### 2.4 Category Archive
**URL**: `/category/{category-slug}`

**Purpose**: All posts within a specific category

**Features**:
- Category title and description
- Paginated post list
- Same layout as blog archive
- Category-specific RSS feed available

---

### 2.5 Store / Playbooks
**URL**: `/store`

**Purpose**: Digital product catalog

**Features**:
- Product grid display
- Filter by product type:
  - E-books
  - Templates
  - Bundles
  - Courses
- Product cards showing:
  - Cover image
  - Product name
  - Short description
  - Price (with strikethrough for discounts)
  - Product type badge
  - "Featured" badge if applicable
- Link to user's downloads (if logged in)

**Visibility**: Can be toggled on/off from admin dashboard

---

### 2.6 Product Detail
**URL**: `/store/{product-slug}`

**Purpose**: Individual product page

**Features**:
- Large cover image
- Full product description
- Price display with:
  - Current price
  - Compare-at price (strikethrough if discounted)
  - Percentage savings calculated
- For bundles: List of included products
- File list preview (names only, not downloadable until purchased)
- Coupon code input field
- Buy button (redirects to checkout)
- Related products section

---

### 2.7 Checkout
**URL**: `/store/checkout`

**Purpose**: Review order before payment

**Requires**: User must be logged in

**Features**:
- Order summary with product details
- Coupon code validation
- Discount display
- Total calculation
- For 100% discount (free): Completes order immediately
- For paid orders: Redirects to Stripe Checkout
- Success redirect to `/store/checkout/success`

---

### 2.8 Orders / Downloads
**URL**: `/store/orders`

**Purpose**: User's purchase history and downloads

**Requires**: User must be logged in

**Features**:
- List of all orders with:
  - Order number
  - Order date
  - Products purchased
  - Order total
- Download buttons for each file
- Download count tracking
- File sizes displayed

---

### 2.9 Domains for Sale
**URL**: `/domains-for-sale`

**Purpose**: Marketplace for premium domains

**Features**:
- Domain listings with:
  - Domain name
  - Price
  - Description/notes
  - Small icon (50x50)
  - "Highlighted" badge for featured domains
- Buy button for each domain
- Stripe checkout integration
- Purchase confirmation email sent to buyer

---

### 2.10 Domain Resources
**URL**: `/domain-resources`

**Purpose**: Curated directory of domain industry tools and services

**Features**:
- 20 categories:
  - Appraisal & Valuation
  - Auctions
  - Blogs
  - Books
  - Brokers
  - Buy/Sell Domains (Aftermarket)
  - Business Tools
  - Conferences & Events
  - Domain Tools
  - Escrow Services
  - Expired/Drops
  - Forums & Communities
  - Hosting & Parking
  - Legal Resources
  - Marketplaces
  - News
  - Newsletters
  - Podcasts
  - Portfolio Management
  - Registration

- Three listing types:
  - **Featured** (gold): Premium placement, full-width on some views
  - **Sponsored** (blue): Paid listings with logo
  - **Free** (gray): Basic listings

- Resource cards showing:
  - Logo (if available)
  - Resource name
  - Short description
  - Category
  - External link (tracked)

- Click tracking for analytics

---

### 2.11 Domain Dictionary
**URL**: `/domain-name-dictionary`

**Purpose**: Glossary of domain investing terminology

**Features**:
- 50+ terms defined
- Grouped alphabetically (A-Z sections)
- Each term shows:
  - Term name
  - Short definition
- Click term for full definition page
- Schema.org DefinedTermSet markup

---

### 2.12 Dictionary Term Detail
**URL**: `/domain-name-dictionary/{term-slug}`

**Purpose**: Full definition of a single term

**Features**:
- Term name as heading
- Full definition (can include HTML formatting)
- Related terms section
- Sponsored ads section
- Schema.org DefinedTerm markup
- Back to dictionary link

---

### 2.13 About Page
**URL**: `/about`

**Purpose**: Information about the author/site

**Features**:
- Dynamic content from `pages` table
- Author biography
- Social media links
- Contact information

---

### 2.14 Contact Page
**URL**: `/contact`

**Purpose**: Contact form for visitors

**Features**:
- Contact form with:
  - Name (required)
  - Email (required)
  - Subject
  - Message (required)
- Form submission sends email to site owner
- Sponsor ads section
- Social media links

---

### 2.15 RSS Feeds
**URLs**:
- `/rss.xml` - Main feed
- `/category/{slug}/feed` - Category feeds
- `/?feed=rss2` - WordPress-compatible URL

**Purpose**: Syndication feeds for blog posts

**Features**:
- Standard RSS 2.0 format
- Full post content in feed
- Publication dates
- Category information
- WordPress URL compatibility for migration

---

### 2.16 Authentication Pages

**Login**: `/auth/login`
- Email/password form
- "Forgot password?" link
- Link to registration
- Redirects to store after login

**Register**: `/auth/register`
- Email/password registration
- Creates user profile
- Redirects to store after registration

**Forgot Password**: `/auth/forgot-password`
- Email input
- Sends password reset link
- Success confirmation message

**Reset Password**: `/auth/reset-password`
- New password input
- Confirm password input
- Validates reset token from email link

---

## 3. Admin Pages (Backend)

All admin pages require authentication and admin role. Accessible at `/admin/*`

### 3.1 Admin Login
**URL**: `/admin/login`

**Features**:
- Email/password form
- Forgot password link
- Redirects to dashboard on success

---

### 3.2 Dashboard
**URL**: `/admin`

**Purpose**: Overview of site metrics and quick actions

**Features**:
- Key metrics cards:
  - Total posts
  - Total views
  - Active ads
  - Categories count
- Recent posts list with status
- Store visibility toggle
- Quick navigation to all sections

---

### 3.3 Posts Management
**URL**: `/admin/posts`

**Purpose**: Create, edit, and manage blog posts

**Features**:
- Post list with columns:
  - Title
  - Status (Draft/Scheduled/Published)
  - Categories
  - Publication date
  - View count
  - Actions (Edit/Delete)
- Search and filter by status
- Bulk actions
- Create new post button

---

### 3.4 Post Editor
**URL**: `/admin/posts/{id}` or `/admin/posts/new`

**Purpose**: Create or edit a blog post

**Features**:
- Title input
- Slug input (auto-generated from title)
- WYSIWYG content editor (TipTap):
  - Bold, italic, underline
  - Headings (H1-H6)
  - Bullet and numbered lists
  - Blockquotes
  - Links
  - Images
  - Code blocks
- Featured image upload
- Category multi-select (can assign multiple categories)
- Status selection:
  - Draft
  - Scheduled
  - Published
- Publication date picker
- SEO section:
  - Meta title
  - Meta description
  - Meta keywords
  - "Generate with AI" button (uses Claude)
- Save/Publish buttons

---

### 3.5 Categories
**URL**: `/admin/categories`

**Purpose**: Manage post categories

**Features**:
- Category list with:
  - Name
  - Slug
  - Post count
  - Actions
- Create new category
- Edit category name/slug
- Delete category (if no posts)

---

### 3.6 Products
**URL**: `/admin/products`

**Purpose**: Manage digital products for sale

**Features**:
- Product list with:
  - Name
  - Type
  - Price
  - Status
  - Featured flag
  - Actions
- Filter by type and status
- Create/Edit/Delete products

---

### 3.7 Product Editor
**URL**: `/admin/products/{id}`

**Purpose**: Edit product details and files

**Product Fields**:
- Name
- Slug
- Short description (for catalog)
- Full description (HTML)
- Product type: E-book, Template, Bundle, Course
- Price
- Compare-at price (for showing discounts)
- Cover image upload
- Featured toggle
- Status: Draft, Active, Archived
- Display order

**Files Section**:
- Upload product files
- Reorder files
- Delete files
- Shows file name, size, type

**For Bundles**:
- Select which products to include
- Order of included products

---

### 3.8 Coupons
**URL**: `/admin/coupons`

**Purpose**: Manage discount codes

**Features**:
- Coupon list with:
  - Code
  - Discount (% or $)
  - Usage (current/max)
  - Status
  - Expiration
  - Actions

**Coupon Editor Fields**:
- Code (auto-uppercase)
- Description
- Discount type: Percentage or Fixed Amount
- Discount value
- Maximum uses (total)
- Maximum uses per user
- Start date
- Expiration date
- Minimum purchase amount
- Applies to: All products or Specific products
- Product selector (if specific)
- Status: Active, Inactive, Archived

---

### 3.9 Orders
**URL**: `/admin/orders`

**Purpose**: View and manage customer orders

**Features**:
- Order list with:
  - Order number
  - Customer email
  - Date
  - Total
  - Status
  - Items count
- Order detail view:
  - Customer information
  - Products purchased
  - Coupon used (if any)
  - Stripe payment details
  - Order status

---

### 3.10 Customers
**URL**: `/admin/customers`

**Purpose**: View customer information

**Features**:
- Customer list with:
  - Email
  - Total orders
  - Total spent
  - First order date
  - Last order date
- Export to CSV functionality

---

### 3.11 Domains
**URL**: `/admin/domains`

**Purpose**: Manage domains for sale

**Features**:
- Domain list with:
  - Domain name
  - Price
  - Status (Active/Sold)
  - Highlighted flag
  - Actions
- Create/Edit/Delete domains

**Domain Editor Fields**:
- Domain name
- Price
- Description/notes
- Icon image (50x50)
- PayPal link (optional alternative)
- Active toggle
- Highlighted toggle (featured)

---

### 3.12 Ads Management
**URL**: `/admin/ads`

**Purpose**: Manage advertising campaigns

**Features**:
- Ad list with:
  - Name
  - Zone/Placement
  - Status
  - Impressions
  - Clicks
  - CTR
  - Dates
  - Actions

**Ad Zones Available**:
- home_sponsor_1 through home_sponsor_4
- sidebar
- post_top
- post_bottom
- resources_featured

---

### 3.13 Ad Editor
**URL**: `/admin/ads/{id}` or `/admin/ads/new`

**Purpose**: Create or edit an ad campaign

**Fields**:
- Campaign name
- Ad zone selection
- Ad type: Image, HTML, or Text Link
- For Image: Upload creative, set dimensions
- For HTML: Enter HTML code
- For Text Link: Title and description
- Click URL (destination)
- Alt text (for images)
- Active toggle
- Start date
- End date
- Priority (weight for random selection)

---

### 3.14 Resources
**URL**: `/admin/resources`

**Purpose**: Manage domain resource listings

**Features**:
- Resource list with:
  - Name
  - Category
  - Listing type
  - Status
  - Monthly fee
  - Expiration
  - Actions
- Filter by category, type, status
- Reorder within category (up/down arrows)

**Resource Editor Fields**:
- Name
- Slug
- Category (dropdown of 20 categories)
- Short description (for cards)
- Full description
- Destination URL
- Logo upload
- Listing type: Free, Sponsored, Featured
- Monthly fee (for paid listings)
- Start date
- End date
- Status: Active, Grace Period, Expired, Draft
- Display order

---

### 3.15 Dictionary
**URL**: `/admin/dictionary`

**Purpose**: Manage domain dictionary terms

**Features**:
- Term list with:
  - Term
  - Short definition preview
  - Actions
- Create/Edit/Delete terms

**Term Editor Fields**:
- Term
- Slug
- Short definition (for list view)
- Full definition (HTML, for detail page)

---

### 3.16 Pages
**URL**: `/admin/pages`

**Purpose**: Manage static pages (About, Contact, etc.)

**Features**:
- Page list
- Edit page content
- Page editor with:
  - Title
  - Slug
  - Content (WYSIWYG)
  - Meta description

---

### 3.17 Analytics
**URL**: `/admin/analytics`

**Purpose**: View performance metrics

**Features**:
- Ad performance:
  - Impressions by campaign
  - Clicks by campaign
  - CTR calculations
  - Charts over time
- Resource analytics:
  - Click counts by resource
  - Top performing resources
  - Category breakdown

---

### 3.18 Calendar
**URL**: `/admin/calendar`

**Purpose**: Editorial calendar for posts

**Features**:
- Monthly calendar view
- Shows posts by publication date:
  - Published posts (green)
  - Scheduled posts (blue)
  - Drafts by creation date (gray)
- Click post to edit
- Click empty date to create new scheduled post
- Navigate between months

---

## 4. Database Schema

### 4.1 Content Tables

#### posts
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| slug | TEXT | URL-friendly identifier (unique) |
| title | TEXT | Post title |
| content | TEXT | HTML content |
| excerpt | TEXT | Short summary |
| featured_image_url | TEXT | Cover image URL |
| author_id | UUID | Reference to user |
| status | TEXT | 'draft', 'scheduled', or 'published' |
| published_at | TIMESTAMP | When to publish |
| view_count | INTEGER | Number of views |
| seo_title | TEXT | Meta title |
| seo_description | TEXT | Meta description |
| seo_keywords | TEXT | Meta keywords |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update |

#### categories
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Category name |
| slug | TEXT | URL identifier (unique) |
| description | TEXT | Category description |
| created_at | TIMESTAMP | Creation date |

#### post_categories (Junction Table)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| post_id | UUID | Reference to posts |
| category_id | UUID | Reference to categories |

#### comments
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| post_id | UUID | Reference to posts |
| parent_id | UUID | Parent comment (for replies) |
| author_name | TEXT | Commenter name |
| author_email | TEXT | Commenter email |
| author_url | TEXT | Commenter website |
| content | TEXT | Comment text |
| status | TEXT | 'pending', 'approved', or 'spam' |
| is_first_time | BOOLEAN | First-time commenter flag |
| created_at | TIMESTAMP | Comment date |

#### dictionary_terms
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| term | TEXT | The term |
| slug | TEXT | URL identifier (unique) |
| short_definition | TEXT | Brief definition |
| full_definition | TEXT | Complete definition (HTML) |
| created_at | TIMESTAMP | Creation date |

#### pages
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| slug | TEXT | URL identifier (unique) |
| title | TEXT | Page title |
| content | TEXT | HTML content |
| meta_description | TEXT | SEO description |
| created_at | TIMESTAMP | Creation date |

---

### 4.2 E-Commerce Tables

#### products
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Product name |
| slug | TEXT | URL identifier (unique) |
| short_description | TEXT | Brief description |
| description | TEXT | Full description (HTML) |
| price | DECIMAL | Current price |
| compare_at_price | DECIMAL | Original price (for discounts) |
| product_type | TEXT | 'ebook', 'template', 'bundle', 'course' |
| cover_image_url | TEXT | Product image |
| featured | BOOLEAN | Featured flag |
| display_order | INTEGER | Sort order |
| status | TEXT | 'draft', 'active', 'archived' |
| stripe_product_id | TEXT | Stripe product ID |
| stripe_price_id | TEXT | Stripe price ID |
| created_at | TIMESTAMP | Creation date |

#### product_files
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| product_id | UUID | Reference to products |
| file_name | TEXT | Display name |
| file_path | TEXT | Storage path |
| file_size | INTEGER | Size in bytes |
| file_type | TEXT | MIME type |
| display_order | INTEGER | Sort order |

#### bundle_items
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| bundle_product_id | UUID | The bundle product |
| included_product_id | UUID | Product included in bundle |
| display_order | INTEGER | Sort order |

#### orders
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Customer reference |
| order_number | TEXT | Display order number (unique) |
| status | TEXT | 'pending', 'completed', 'refunded', 'failed' |
| subtotal | DECIMAL | Before discount |
| discount_amount | DECIMAL | Discount applied |
| total | DECIMAL | Final amount |
| customer_email | TEXT | Customer email |
| coupon_id | UUID | Coupon used (if any) |
| stripe_session_id | TEXT | Stripe checkout session |
| stripe_payment_intent_id | TEXT | Stripe payment intent |
| completed_at | TIMESTAMP | Completion time |
| created_at | TIMESTAMP | Order creation |

#### order_items
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | Reference to orders |
| product_id | UUID | Reference to products |
| product_name | TEXT | Name at purchase time |
| price_at_purchase | DECIMAL | Price paid |

#### download_access
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Customer reference |
| product_id | UUID | Product reference |
| order_id | UUID | Order reference |
| download_count | INTEGER | Times downloaded |
| last_downloaded_at | TIMESTAMP | Last download |
| granted_at | TIMESTAMP | Access granted |

#### coupons
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| code | TEXT | Coupon code (unique, uppercase) |
| description | TEXT | Internal description |
| discount_type | TEXT | 'percentage' or 'fixed_amount' |
| discount_value | DECIMAL | Discount amount |
| max_uses | INTEGER | Total usage limit |
| max_uses_per_user | INTEGER | Per-user limit |
| current_uses | INTEGER | Times used |
| starts_at | TIMESTAMP | Valid from |
| expires_at | TIMESTAMP | Valid until |
| minimum_purchase | DECIMAL | Minimum order amount |
| applies_to | TEXT | 'all' or 'specific_products' |
| status | TEXT | 'active', 'inactive', 'archived' |

#### coupon_products
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| coupon_id | UUID | Reference to coupons |
| product_id | UUID | Reference to products |

#### coupon_usages
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| coupon_id | UUID | Reference to coupons |
| order_id | UUID | Reference to orders |
| user_id | UUID | Customer reference |
| discount_amount | DECIMAL | Discount given |
| used_at | TIMESTAMP | Usage time |

---

### 4.3 Domain Tables

#### domains_for_sale
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| domain_name | TEXT | The domain |
| price | DECIMAL | Asking price |
| notes | TEXT | Description |
| image_url | TEXT | Icon (50x50) |
| paypal_link | TEXT | PayPal button link |
| is_active | BOOLEAN | Available for sale |
| is_highlighted | BOOLEAN | Featured listing |
| created_at | TIMESTAMP | Creation date |

#### resources
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Resource name |
| slug | TEXT | URL identifier (unique) |
| category | TEXT | Category code |
| short_description | TEXT | Brief description |
| full_description | TEXT | Detailed description |
| destination_url | TEXT | External link |
| logo_url | TEXT | Logo image |
| listing_type | TEXT | 'free', 'sponsored', 'featured' |
| monthly_fee | DECIMAL | Monthly cost (paid listings) |
| start_date | DATE | Listing start |
| end_date | DATE | Listing expiration |
| status | TEXT | 'active', 'grace_period', 'expired', 'draft' |
| display_order | INTEGER | Sort order within category |
| created_at | TIMESTAMP | Creation date |

#### resource_clicks
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| resource_id | UUID | Reference to resources |
| ip_address | TEXT | Visitor IP |
| user_agent | TEXT | Browser info |
| clicked_at | TIMESTAMP | Click time |

#### resource_impressions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| resource_id | UUID | Reference to resources |
| ip_address | TEXT | Visitor IP |
| clicked_at | TIMESTAMP | Impression time |

---

### 4.4 Advertising Tables

#### ads
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Campaign name |
| ad_zone | TEXT | Placement location |
| ad_type | TEXT | 'image', 'html', 'text_link' |
| content | TEXT | Image URL or HTML |
| link_url | TEXT | Click destination |
| is_active | BOOLEAN | Active flag |
| start_date | DATE | Campaign start |
| end_date | DATE | Campaign end |
| priority | INTEGER | Selection weight |
| width | INTEGER | Image width |
| height | INTEGER | Image height |
| created_at | TIMESTAMP | Creation date |

#### ad_impressions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| ad_id | UUID | Reference to ads |
| ip_address | TEXT | Visitor IP |
| user_agent | TEXT | Browser info |
| created_at | TIMESTAMP | Impression time |

#### ad_clicks
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| ad_id | UUID | Reference to ads |
| ip_address | TEXT | Visitor IP |
| user_agent | TEXT | Browser info |
| created_at | TIMESTAMP | Click time |

#### advertisers
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| business_name | TEXT | Company name |
| contact_name | TEXT | Contact person |
| contact_email | TEXT | Email address |
| company_url | TEXT | Website |
| notes | TEXT | Internal notes |
| created_at | TIMESTAMP | Creation date |

---

### 4.5 User Tables

#### user_profiles
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (matches auth.users) |
| display_name | TEXT | User's display name |
| avatar_url | TEXT | Profile image |
| role | TEXT | 'customer' or 'admin' |
| created_at | TIMESTAMP | Creation date |

#### newsletter_subscribers
| Column | Type | Description |
|--------|------|-------------|
| email | TEXT | Email address (unique) |
| subscribed_at | TIMESTAMP | Subscription date |

---

### 4.6 Configuration Tables

#### settings
| Column | Type | Description |
|--------|------|-------------|
| key | TEXT | Setting name (unique) |
| value | JSONB | Setting value |

---

## 5. API Endpoints

### 5.1 Public APIs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/contact` | Submit contact form |
| POST | `/api/comments` | Submit blog comment |
| POST | `/api/newsletter/subscribe` | Newsletter signup |
| GET | `/api/feed` | RSS feed (supports `?cat=slug` for category) |

### 5.2 Store APIs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/store/checkout` | Create checkout session |
| POST | `/api/store/validate-coupon` | Validate coupon code |
| GET | `/api/store/download/{fileId}` | Download product file |

### 5.3 Domain APIs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/domains/checkout` | Create domain purchase session |

### 5.4 Tracking APIs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/ads/track-impression` | Record ad impression |
| POST | `/api/ads/track-click` | Record ad click |
| POST | `/api/resources/track-impression` | Record resource impression |
| POST | `/api/resources/track-click` | Record resource click |

### 5.5 Webhook APIs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/webhooks/stripe` | Handle Stripe events |

### 5.6 Cron APIs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/cron/publish-scheduled` | Publish scheduled posts |
| GET | `/api/cron/check-expirations` | Check ad/resource expirations |

### 5.7 Admin APIs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/posts` | Create post |
| PUT | `/api/admin/posts/{id}` | Update post |
| DELETE | `/api/admin/posts/{id}` | Delete post |
| POST | `/api/admin/categories` | Create category |
| PUT | `/api/admin/categories/{id}` | Update category |
| DELETE | `/api/admin/categories/{id}` | Delete category |
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/{id}` | Update product |
| DELETE | `/api/admin/products/{id}` | Delete product |
| POST | `/api/admin/coupons` | Create coupon |
| PUT | `/api/admin/coupons/{id}` | Update coupon |
| DELETE | `/api/admin/coupons/{id}` | Delete coupon |
| POST | `/api/admin/ads` | Create ad |
| PUT | `/api/admin/ads/{id}` | Update ad |
| DELETE | `/api/admin/ads/{id}` | Delete ad |
| POST | `/api/admin/domains` | Create domain |
| PUT | `/api/admin/domains/{id}` | Update domain |
| DELETE | `/api/admin/domains/{id}` | Delete domain |
| POST | `/api/admin/resources` | Create resource |
| PUT | `/api/admin/resources/{id}` | Update resource |
| DELETE | `/api/admin/resources/{id}` | Delete resource |
| PUT | `/api/admin/pages/{slug}` | Update page |
| POST | `/api/admin/generate-seo` | Generate SEO with AI |
| POST | `/api/admin/upload-post-image` | Upload post image |
| POST | `/api/admin/upload-product-image` | Upload product image |
| POST | `/api/admin/upload-product-file` | Upload product file |
| POST | `/api/admin/upload-domain-image` | Upload domain icon |
| POST | `/api/admin/upload-ad-image` | Upload ad creative |
| POST | `/api/admin/upload-logo` | Upload resource logo |
| GET | `/api/admin/customers` | List customers |
| GET | `/api/admin/customers/export` | Export customers CSV |

---

## 6. Authentication System

### 6.1 Technology
- **Provider**: Supabase Auth
- **Method**: Email/Password
- **Session**: Cookie-based (SSR compatible)

### 6.2 User Roles
| Role | Access |
|------|--------|
| Customer | Store, orders, downloads |
| Admin | Full admin panel access |

### 6.3 Protected Routes
| Pattern | Requirement |
|---------|-------------|
| `/admin/*` | Admin role |
| `/store/checkout` | Authenticated |
| `/store/orders` | Authenticated |

### 6.4 Auth Flow
1. User submits email/password
2. Supabase validates credentials
3. Session created and stored in cookies
4. Middleware checks session on protected routes
5. User profile loaded from `user_profiles` table
6. Role determines access level

---

## 7. Third-Party Integrations

### 7.1 Supabase
**Purpose**: Database, Authentication, File Storage

**Features Used**:
- PostgreSQL database
- Row Level Security (RLS)
- Auth with email/password
- Storage buckets for files
- Service role for admin operations

**Storage Buckets**:
- `post-images` - Blog featured images
- `product-images` - Product covers
- `product-files` - Downloadable files
- `domain-images` - Domain icons
- `ad-images` - Ad creatives
- `resource-logos` - Resource logos

---

### 7.2 Stripe
**Purpose**: Payment processing

**Features Used**:
- Checkout Sessions
- Webhooks
- Customer management
- Product/Price sync

**Webhook Events Handled**:
- `checkout.session.completed` - Process successful payment

**Payment Flows**:
- Product purchases (store)
- Domain purchases
- Supports coupons/discounts

---

### 7.3 Resend
**Purpose**: Transactional email

**Email Types Sent**:
- Order confirmation
- Domain purchase confirmation
- Contact form submissions
- Password reset (via Supabase SMTP)

**Configuration**:
- Custom domain: `contact.sullysblog.com`
- From address: `noreply@contact.sullysblog.com`

---

### 7.4 Mailchimp
**Purpose**: Email marketing

**Features Used**:
- Subscriber management
- Audience tagging
- Newsletter list

**Triggers**:
- Newsletter signup
- Purchase completion
- Domain purchase

**Tags Applied**:
- `customer` - Made a purchase
- `domain-purchase` - Bought a domain
- `newsletter-subscriber` - Newsletter signup

---

### 7.5 Anthropic Claude AI
**Purpose**: SEO content generation

**Model**: `claude-sonnet-4-20250514`

**Use Case**:
- Generate meta title from post content
- Generate meta description
- Generate meta keywords

**Endpoint**: `/api/admin/generate-seo`

---

### 7.6 Google Analytics
**Purpose**: Site analytics

**Tracking ID**: `G-64FBS1RLFD`

---

## 8. File Structure

```
sullysblog/
├── app/                          # Next.js App Router
│   ├── (routes)/                 # Public pages
│   │   ├── page.tsx              # Home
│   │   ├── blog/                 # Blog archive
│   │   ├── [slug]/               # Post detail
│   │   ├── category/[slug]/      # Category archive
│   │   ├── store/                # Store pages
│   │   ├── domains-for-sale/     # Domain marketplace
│   │   ├── domain-resources/     # Resource directory
│   │   ├── domain-name-dictionary/  # Dictionary
│   │   ├── about/                # About page
│   │   ├── contact/              # Contact page
│   │   └── auth/                 # Auth pages
│   ├── admin/                    # Admin pages
│   │   ├── page.tsx              # Dashboard
│   │   ├── posts/                # Post management
│   │   ├── categories/           # Category management
│   │   ├── products/             # Product management
│   │   ├── coupons/              # Coupon management
│   │   ├── orders/               # Order management
│   │   ├── customers/            # Customer management
│   │   ├── domains/              # Domain management
│   │   ├── ads/                  # Ad management
│   │   ├── resources/            # Resource management
│   │   ├── dictionary/           # Dictionary management
│   │   ├── pages/                # Static page management
│   │   ├── analytics/            # Analytics dashboard
│   │   ├── calendar/             # Editorial calendar
│   │   └── login/                # Admin login
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin APIs
│   │   ├── auth/                 # Auth APIs
│   │   ├── store/                # Store APIs
│   │   ├── domains/              # Domain APIs
│   │   ├── ads/                  # Ad tracking APIs
│   │   ├── resources/            # Resource tracking APIs
│   │   ├── webhooks/             # Webhook handlers
│   │   └── cron/                 # Cron job endpoints
│   ├── rss.xml/                  # RSS feed route
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── admin/                    # Admin components
│   ├── blog/                     # Blog components
│   ├── store/                    # Store components
│   ├── domains/                  # Domain components
│   ├── ads/                      # Ad components
│   ├── resources/                # Resource components
│   ├── layout/                   # Layout components
│   ├── ui/                       # UI components
│   ├── seo/                      # SEO components
│   └── providers/                # Context providers
├── lib/                          # Utilities
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── admin.ts              # Admin client (service role)
│   ├── queries/                  # Database queries
│   ├── stripe.ts                 # Stripe utilities
│   ├── mailchimp.ts              # Mailchimp utilities
│   └── utils.ts                  # Helper functions
├── middleware.ts                 # Route middleware
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
└── package.json                  # Dependencies
```

---

## 9. Technical Stack

### 9.1 Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | React framework |
| React | 19.2.3 | UI library |
| Tailwind CSS | 4.x | Styling |
| TipTap | 2.10.3 | Rich text editor |
| Recharts | 2.15.0 | Charts/graphs |
| React Markdown | 10.1.0 | Markdown rendering |

### 9.2 Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase | 2.89.0 | Database & Auth |
| Stripe | 20.1.0 | Payments |
| Resend | 4.0.1 | Email |
| Sharp | 0.34.5 | Image processing |
| Anthropic SDK | 0.71.2 | AI integration |

### 9.3 Development
| Technology | Purpose |
|------------|---------|
| TypeScript | Type safety |
| ESLint | Code linting |
| Puppeteer | PDF generation |

### 9.4 Hosting
| Service | Purpose |
|---------|---------|
| Vercel | Application hosting |
| Supabase | Database & storage |
| Resend | Email delivery |

---

## 10. Environment Configuration

### 10.1 Required Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_KEY=[service-role-key]

# Site
NEXT_PUBLIC_SITE_URL=https://sullysblog.com

# Stripe
STRIPE_SECRET_KEY=sk_live_[key]
STRIPE_WEBHOOK_SECRET=whsec_[key]

# Email (Resend)
RESEND_API_KEY=re_[key]
EMAIL_FROM=SullysBlog <noreply@contact.sullysblog.com>
CONTACT_EMAIL=mike@sullysblog.com

# Mailchimp
MAILCHIMP_API_KEY=[key]-us7
MAILCHIMP_SERVER_PREFIX=us7
MAILCHIMP_LIST_ID=[list-id]

# AI
ANTHROPIC_API_KEY=sk-ant-[key]
```

### 10.2 Optional Variables

```env
# Cron job security
CRON_SECRET=[random-secret]
```

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 31, 2025 | Initial comprehensive documentation |

---

*This document provides a complete specification of the SullysBlog website. For implementation questions, refer to the source code or contact the development team.*
