# SullysBlog Rebuild - Complete Project Specification

## Project Overview
Rebuild SullysBlog from WordPress to a modern stack (Cloudflare Pages + Supabase + Next.js) while preserving all existing functionality and adding improved performance, custom advertiser management, and streamlined content management.

**Current Site:**
- 624 blog posts
- 160 pages
- 21 categories
- URL structure: `domain.com/post-name/`
- Single author (expandable to multiple in future)
- ~1 image per post

---

## Tech Stack

### Frontend
- **Framework:** Next.js (React)
- **Hosting:** Cloudflare Pages
- **Styling:** Tailwind CSS (or your preference)
- **Features:** Static generation, edge delivery, fast global performance

### Backend/Database
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (admin login)
- **File Storage:** Supabase Storage (images, ad creatives)
- **Real-time:** Supabase real-time subscriptions (optional for live updates)

### Serverless Functions
- **Cloudflare Workers:** Custom API endpoints, ad click tracking, webhook handlers

### Integrations
- **Payments:** Stripe (primary - recurring subscriptions), PayPal (secondary - one-time)
- **Email:** Mailchimp (newsletter signups)
- **Analytics:** Google Analytics + Cloudflare Analytics
- **Spam Protection:** Cloudflare Turnstile (replaces reCAPTCHA)
- **Image Optimization:** Automatic WebP conversion on upload

---

## Database Schema

### Core Content Tables

#### `posts`
- `id` (uuid, primary key)
- `slug` (text, unique) - for URL: `/post-name/`
- `title` (text)
- `content` (text) - rich text/HTML
- `excerpt` (text, nullable)
- `featured_image_url` (text, nullable)
- `author_id` (uuid, foreign key to users)
- `category_id` (uuid, foreign key to categories)
- `status` (enum: draft, scheduled, published)
- `published_at` (timestamp, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `view_count` (integer, default 0)
- `seo_title` (text, nullable)
- `seo_description` (text, nullable)

#### `pages`
- `id` (uuid, primary key)
- `slug` (text, unique)
- `title` (text)
- `content` (text)
- `status` (enum: draft, published)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `seo_title` (text, nullable)
- `seo_description` (text, nullable)

#### `categories`
- `id` (uuid, primary key)
- `name` (text, unique)
- `slug` (text, unique)
- `description` (text, nullable)
- `created_at` (timestamp)

#### `users`
- `id` (uuid, primary key)
- `email` (text, unique)
- `name` (text)
- `role` (enum: admin, author)
- `bio` (text, nullable)
- `avatar_url` (text, nullable)
- `created_at` (timestamp)

#### `comments`
- `id` (uuid, primary key)
- `post_id` (uuid, foreign key to posts)
- `parent_id` (uuid, nullable, self-reference for replies)
- `author_name` (text)
- `author_email` (text)
- `author_url` (text, nullable)
- `content` (text)
- `status` (enum: pending, approved, spam)
- `is_first_time` (boolean, default true)
- `created_at` (timestamp)
- `ip_address` (text, nullable)

#### `approved_commenters`
- `id` (uuid, primary key)
- `email` (text, unique)
- `approved_at` (timestamp)

---

### Custom Features Tables

#### `advertisers`
- `id` (uuid, primary key)
- `business_name` (text)
- `url` (text)
- `contact_name` (text)
- `contact_email` (text)
- `notes` (text, nullable)
- `created_at` (timestamp)

#### `ad_packages`
- `id` (uuid, primary key)
- `name` (text) - e.g., "3 Month Header - $500/month"
- `monthly_price` (decimal)
- `duration_months` (integer)
- `placement_type` (enum: header, footer, top_squares, sidebar)
- `description` (text, nullable)
- `is_active` (boolean, default true)
- `created_at` (timestamp)

#### `ad_campaigns`
- `id` (uuid, primary key)
- `advertiser_id` (uuid, foreign key to advertisers)
- `package_id` (uuid, foreign key to ad_packages, nullable)
- `stripe_subscription_id` (text, nullable)
- `start_date` (date)
- `end_date` (date)
- `status` (enum: pending, active, cancelled, expired)
- `monthly_amount` (decimal)
- `notes` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `ad_creatives`
- `id` (uuid, primary key)
- `campaign_id` (uuid, foreign key to ad_campaigns)
- `placement` (enum: header, footer, top_square_1, top_square_2, top_square_3, top_square_4, sidebar)
- `creative_type` (enum: image, html, text_link)
- `creative_url` (text, nullable) - image URL if image type
- `creative_html` (text, nullable) - HTML code if html type
- `text_title` (text, nullable) - for text links
- `text_description` (text, nullable) - for text links
- `click_url` (text) - destination URL
- `alt_text` (text, nullable)
- `created_at` (timestamp)

**Ad Size Specifications:**
- Header: 728x90px (exclusive - one at a time)
- Footer: 728x90px (exclusive - one at a time)
- Top Squares (below header): 300x250px (up to 4 simultaneously)
- Sidebar: 300x250px OR text links (unlimited, stack vertically)

#### `ad_impressions`
- `id` (uuid, primary key)
- `creative_id` (uuid, foreign key to ad_creatives)
- `post_id` (uuid, nullable, foreign key to posts) - which page was viewed
- `viewed_at` (timestamp)
- `ip_address` (text, nullable)
- `user_agent` (text, nullable)

#### `ad_clicks`
- `id` (uuid, primary key)
- `creative_id` (uuid, foreign key to ad_creatives)
- `post_id` (uuid, nullable, foreign key to posts)
- `clicked_at` (timestamp)
- `ip_address` (text, nullable)
- `referrer` (text, nullable)

#### `ad_payments`
- `id` (uuid, primary key)
- `campaign_id` (uuid, foreign key to ad_campaigns)
- `stripe_invoice_id` (text, nullable)
- `amount` (decimal)
- `status` (enum: pending, paid, failed, refunded)
- `paid_at` (timestamp, nullable)
- `created_at` (timestamp)

---

#### `dictionary_terms`
- `id` (uuid, primary key)
- `term` (text, unique)
- `slug` (text, unique) - for URL: `/dictionary/term-name/`
- `short_definition` (text) - shown on main dictionary page
- `full_definition` (text) - full page content (can be multiple paragraphs)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `domains_for_sale`
- `id` (uuid, primary key)
- `domain_name` (text, unique)
- `price` (decimal)
- `paypal_link` (text, nullable) - or generate dynamically
- `is_active` (boolean, default true)
- `notes` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

### Supporting Tables

#### `redirects`
- `id` (uuid, primary key)
- `old_url` (text, unique)
- `new_url` (text)
- `redirect_type` (integer, default 301)
- `created_at` (timestamp)

#### `newsletter_subscribers`
- `id` (uuid, primary key)
- `email` (text, unique)
- `mailchimp_id` (text, nullable)
- `subscribed_at` (timestamp)
- `status` (enum: active, unsubscribed)

---

## Core Features (Phase 1 - Launch Blockers)

### 1. Blog System
- Display posts with featured images
- Category filtering
- Individual post pages (`/post-name/`)
- Pagination on homepage/category pages
- Post view counter
- SEO meta tags per post
- Open Graph tags for social sharing
- Author bio display
- Published date display

### 2. Pages
- Static pages with custom content
- Custom URLs (`/page-name/`)
- SEO meta tags

### 3. Categories
- 21 categories from WordPress
- Category archive pages (`/category/category-name/`)
- Post count per category
- Category descriptions

### 4. Comments System
**First-time moderation workflow:**
- New commenter submits comment → status = "pending"
- Admin reviews and approves → adds email to `approved_commenters` table
- Future comments from same email → auto-publish (status = "approved")
- Admin can mark as spam
- Nested replies support (parent_id)
- Spam protection via Cloudflare Turnstile
- Email notification to admin on new comment

### 5. Related Articles
- Show 3-5 related posts at bottom of each post
- Algorithm: Same category first, then recent posts
- Exclude current post
- Display: title, excerpt, featured image thumbnail

### 6. Search
- Full-text search across posts and pages
- Search by title, content, category
- Search results page with pagination

### 7. Contact Form
- Simple contact form (name, email, message)
- Submit via Cloudflare Worker
- Email notification to admin
- Spam protection via Turnstile
- Success/error messages

### 8. Email Newsletter Signup
- Embed Mailchimp signup form
- Or API integration to add subscribers to Mailchimp list
- Display in sidebar or footer
- Confirmation message on signup

### 9. Social Sharing Buttons
- Share to Twitter, Facebook, LinkedIn, Pinterest
- On every post
- Simple share links (no heavy third-party scripts)

### 10. SEO Features
- XML sitemap (auto-generated)
- Robots.txt
- Meta titles and descriptions (customizable per post/page)
- Open Graph tags
- Schema.org markup for articles
- Canonical URLs

### 11. Image Optimization
- Auto-convert uploads to WebP
- Responsive images (multiple sizes)
- Lazy loading
- Alt text support

### 12. URL Redirects
**Critical for migration:**
- Preserve existing URL structure: `/post-name/`
- Cloudflare Worker handles any changed URLs
- 301 permanent redirects
- Import redirect map from WordPress export
- Admin interface to add/edit redirects
- Log 404s to catch missed redirects

---

## Custom Features (Phase 1 - Launch Blockers)

### 13. Advertiser Management System

**Admin Dashboard:**
- View all advertisers (searchable, filterable)
- Add/edit advertiser details
- View revenue dashboard:
  - Current month total revenue
  - Revenue breakdown by advertiser
  - Active campaigns count
  - Payment status overview
  - Upcoming expirations (next 30 days)

**Ad Package Management:**
- Create package templates (name, price, duration, placement type)
- Examples:
  - "Header Exclusive - $500/month (3 months)"
  - "Top Square - $250/month"
  - "Sidebar - $150/month"
  - "Premium Bundle - $1000/month (multiple placements)"

**Campaign Management:**
- Create campaign: select advertiser, package, dates
- Upload ad creative (image or HTML or text link)
- Assign to placement(s)
- Set start/end dates
- Generate Stripe subscription link (recurring monthly)
- Review and manually send invoice email to client
- Track payment status (Stripe webhook updates)
- Cancel campaign (cancels Stripe subscription)

**Ad Display Logic:**
- Ads automatically appear/disappear based on start/end dates
- Header/Footer: exclusive (one at a time per timeframe)
- Top Squares: up to 4 simultaneously (300x250px each)
- Sidebar: unlimited, stack vertically, hide if none active
- Support image ads, HTML ads, and text links

**Impression & Click Tracking:**
- Log impression when ad appears in viewport (not just page load)
- Log click when ad is clicked (via redirect through `/ad-click/[creative_id]`)
- Dashboard shows per campaign:
  - Total impressions
  - Total clicks
  - CTR (click-through rate)
  - Date range filtering (today, this week, this month, all time)
- Can break down by individual creative/placement

**Notifications (Email Alerts):**
- Payment received (Stripe webhook)
- Payment failed (Stripe webhook)
- Campaign starting tomorrow
- Campaign ending in 14 days
- Campaign ending in 7 days
- Campaign ending in 2 days

**Stripe Integration:**
- Create recurring monthly subscriptions
- Auto-charge customer monthly
- Handle failed payments (retry logic)
- Send customer receipts automatically
- Webhook endpoints for:
  - `invoice.paid`
  - `invoice.payment_failed`
  - `customer.subscription.deleted`
- Admin can cancel subscription anytime

### 14. Domain Dictionary (Glossary)

**Main Dictionary Page (`/dictionary/`):**
- Alphabetical list of all terms
- Each term shows: term name + short definition
- Click term to go to full definition page

**Individual Term Pages (`/dictionary/term-name/`):**
- Full definition (rich text, can be multiple paragraphs)
- SEO optimized
- Breadcrumb navigation
- Related terms (optional)

**Auto-linking in Blog Posts:**
- When publishing/updating a post, scan content for dictionary terms
- Replace first occurrence of each term with link to `/dictionary/term-name/`
- Case-insensitive matching
- Store linked version in database (fast page loads)
- Admin button: "Update all posts with dictionary links" (retroactive)
- Background job scans all 624 posts and adds links to newly added terms

**Admin Interface:**
- Add new term (term, slug, short def, full def)
- Edit existing terms
- Delete terms
- Trigger "update all posts" button

### 15. Domains For Sale Widget

**Display:**
- Sidebar widget (or expandable section)
- Show domain name + price
- Click domain → PayPal payment link
- Option to "View all domains for sale" → full page

**Full Domains Page (`/domains-for-sale/`):**
- List all domains
- Searchable/filterable
- Price sorting

**Admin Interface:**
- Add domain (name, price, PayPal link or auto-generate)
- Edit/delete domains
- Mark as sold (is_active = false, hides from display)

---

## Admin Dashboard Requirements

### Content Management
- Create/edit/delete posts
- Rich text editor (WYSIWYG) or Markdown
- Upload/manage images
- Set featured image
- Select category
- Add SEO title/description
- Schedule posts (publish_at date)
- Save as draft
- Preview before publishing

### Editorial Calendar
- Calendar view showing all posts by date
- Color-coded: published (green), scheduled (blue), draft (gray)
- Click post to edit
- Drag-and-drop to reschedule (optional, can be Phase 2)
- Filter by status, category

### Pages Management
- Create/edit/delete pages
- Same editor as posts
- Custom URLs

### Comments Moderation
- View all comments (pending, approved, spam)
- Approve/reject pending comments
- Mark as spam
- Delete comments
- Reply to comments (optional)

### Category Management
- Add/edit categories
- Assign posts to categories

### Advertiser Dashboard
(Covered in detail above in #13)

### Dictionary Management
(Covered in detail above in #14)

### Domains Management
(Covered in detail above in #15)

### Analytics Overview
- Total posts/pages
- Total comments (pending/approved)
- Site traffic (Google Analytics embed)
- Ad revenue (current month)
- Top posts by views

### Settings
- Site title, tagline
- Social media links
- Mailchimp API key
- Stripe API keys
- Google Analytics ID
- Contact email

---

## Migration Strategy

### Phase 1: WordPress Export & Analysis
1. **Export WordPress content:**
   - Use WordPress XML export (Tools → Export)
   - Or direct MySQL database dump
   - Export includes: posts, pages, categories, comments, media URLs

2. **Generate URL mapping:**
   - Export all current URLs (624 posts + 160 pages = 784 URLs)
   - Format: old_url → new_url (or same if preserving structure)
   - Save as CSV/JSON for redirect import

3. **Audit custom functionality:**
   - Document current plugins that need recreation
   - Export advertiser data from custom plugin
   - Export dictionary terms
   - Export domains for sale list

### Phase 2: Database Setup
1. **Create Supabase project**
2. **Run SQL schema** to create all tables
3. **Set up row-level security** (RLS) policies
4. **Configure storage buckets** for images and ad creatives

### Phase 3: Content Migration
1. **Import categories** (21 total)
2. **Import posts** (624 total):
   - Parse WordPress XML or MySQL dump
   - Extract: title, slug, content, excerpt, category, published_at, author
   - Download and re-upload images to Supabase Storage
   - Update image URLs in content
   - Generate SEO fields
   - Import to `posts` table
3. **Import pages** (160 total)
4. **Import comments:**
   - Link to correct post_id
   - Set status based on approval in WordPress
   - Populate `approved_commenters` table
5. **Import custom data:**
   - Advertisers
   - Dictionary terms
   - Domains for sale
6. **Import redirects** from URL mapping

### Phase 4: Frontend Build
1. **Set up Next.js project**
2. **Build core pages:**
   - Homepage (latest posts)
   - Individual post page
   - Category archive pages
   - Individual page
   - Search results
   - Dictionary pages
   - Domains for sale page
   - Contact page
3. **Build components:**
   - Header/nav
   - Footer
   - Sidebar (ads, newsletter signup, domains widget)
   - Comment section
   - Related articles
   - Social share buttons
   - Ad display components (header, footer, top squares, sidebar)
4. **Integrate Supabase:**
   - Fetch posts/pages/categories
   - Submit comments
   - Track ad impressions/clicks
   - Search functionality

### Phase 5: Admin Dashboard Build
1. **Authentication** (Supabase Auth)
2. **Content management** (posts, pages, categories)
3. **Comments moderation**
4. **Advertiser management**
5. **Dictionary management**
6. **Domains management**
7. **Editorial calendar**
8. **Analytics dashboard**

### Phase 6: Integrations
1. **Stripe:**
   - Set up products/prices
   - Implement subscription creation
   - Webhook endpoints (Cloudflare Workers)
   - Invoice generation
2. **Mailchimp:**
   - API integration or embed code
   - Newsletter signup form
3. **Google Analytics:**
   - Add tracking code
   - Set up goals
4. **Cloudflare Workers:**
   - Ad click tracking
   - Redirect handler
   - Webhook receiver
   - Contact form handler

### Phase 7: Testing & Validation
1. **Content verification:**
   - Spot-check random posts for accuracy
   - Verify all images display correctly
   - Check category assignments
   - Test search functionality
2. **URL testing:**
   - Test all 784 URLs (old structure still works)
   - Verify redirects work correctly
   - Check for broken links
3. **Feature testing:**
   - Submit comments (new user + returning user)
   - Test ad display logic (exclusive placements, date ranges)
   - Test dictionary auto-linking
   - Test contact form
   - Test newsletter signup
4. **Admin testing:**
   - Create/edit/delete posts
   - Moderate comments
   - Create ad campaigns
   - Generate invoices
5. **Performance testing:**
   - Page load speeds
   - Lighthouse scores
   - Mobile responsiveness
6. **Cross-browser testing**

### Phase 8: Launch
1. **DNS cutover:**
   - Point domain to Cloudflare Pages
   - Verify SSL certificate
2. **Monitor 404s** (Cloudflare dashboard or custom logging)
3. **Monitor analytics** (traffic, errors)
4. **Monitor ad tracking** (impressions/clicks logging correctly)
5. **Watch for issues** first 48 hours

### Phase 9: WordPress Decommission
1. **Keep WordPress backup** for 30 days (safety net)
2. **Archive database dump**
3. **Cancel WordPress hosting** (after confirming new site stable)

---

## Post-Launch Features (Phase 2 - Can Wait)

### Link Whisper Replacement
- AI-powered internal linking suggestions
- Scan post content, suggest relevant internal links
- One-click to insert links
- Can use Claude API or simpler keyword matching

### Sedo Auction Integration
- Pull live auction data from Sedo API
- Display in sidebar widget or dedicated page
- Show: domain name, current bid, time remaining
- Auto-refresh data (hourly/daily)

### Social Media Auto-Posting
- Replace with Zapier/Make.com integration
- Or build custom: post to Twitter/Pinterest on publish
- Use their APIs, requires OAuth setup

### Advanced Editorial Calendar
- Drag-and-drop rescheduling
- Bulk actions (publish multiple drafts, reschedule)
- Editorial workflow (assign to authors, editor review)

### Email Notifications
- Notify subscribers of new posts
- Can use Mailchimp campaigns or custom email service
- Weekly digest option

### Multi-author Support
- Currently single author, but database supports multiple
- Add author management UI
- Author profiles, bios, avatar uploads
- Filter posts by author

### Tags System
- Currently only categories, but can add tags
- Many-to-many relationship (posts_tags junction table)
- Tag archive pages
- Tag cloud widget

### Advanced Analytics
- Custom analytics dashboard (beyond Google Analytics)
- Track: popular posts, traffic sources, user behavior
- Ad performance metrics (impressions by post, CTR by placement)

### A/B Testing
- Test different headlines, featured images
- Use Cloudflare Workers for traffic splitting

### Site Search Improvements
- Add filters (category, date range)
- Autocomplete suggestions
- Search analytics (what people search for)

---

## Technical Implementation Notes

### Cloudflare Pages Deployment
- Connect GitHub repo
- Auto-deploy on push to main branch
- Environment variables for API keys
- Build command: `npm run build` (Next.js)
- Output directory: `.next` or `out` (static export)

### Supabase Setup
- Project creation
- Database schema execution
- Storage buckets: `post-images`, `ad-creatives`
- Row-level security policies
- API keys (public anon key, service role key)

### Cloudflare Workers
**Ad Click Tracker (`/ad-click/[creative_id]`):**
- Receives click request
- Logs to Supabase (`ad_clicks` table)
- Redirects to actual click_url (302 redirect)

**Redirect Handler:**
- Intercepts all requests
- Checks `redirects` table for old_url match
- Returns 301 redirect if match found
- Otherwise passes through to Next.js app

**Webhook Receiver (Stripe):**
- Endpoint: `/api/webhooks/stripe`
- Verifies webhook signature
- Handles events: invoice.paid, payment_failed, subscription.deleted
- Updates `ad_payments` and `ad_campaigns` tables
- Sends notification emails

**Contact Form Handler:**
- Receives form submission
- Validates with Turnstile token
- Sends email via Resend/SendGrid
- Returns success/error response

### Image Handling
- Upload to Supabase Storage
- Auto-convert to WebP (use Sharp library or Supabase Transform)
- Generate multiple sizes: thumbnail, medium, large
- Store URLs in database
- Lazy loading on frontend

### Dictionary Auto-Linking Implementation
**Option A: On Publish**
- When post is published/updated, trigger function
- Fetch all dictionary terms from database
- Scan post content for term matches (case-insensitive)
- Replace first occurrence with link: `<a href="/dictionary/term-slug">term</a>`
- Store updated content in database

**Option B: Retroactive Update**
- Admin button: "Update All Posts with Dictionary Links"
- Background job (Cloudflare Worker or Supabase Edge Function)
- Iterates through all posts
- Applies linking logic
- Updates database
- Progress indicator for admin

### Performance Optimizations
- Static generation for all posts/pages (Next.js SSG)
- Edge caching via Cloudflare
- Image optimization (WebP, lazy load)
- Minimal JavaScript (avoid heavy libraries)
- CSS bundling and minification
- Database indexes on frequently queried fields (slug, category_id, status)

### Security
- Cloudflare WAF (Web Application Firewall)
- Rate limiting on API endpoints
- Turnstile for forms (spam protection)
- Supabase RLS policies (row-level security)
- Environment variables for secrets (never commit API keys)
- HTTPS enforced
- Content Security Policy headers

---

## File Structure (Next.js)

```
/sullysblog-new/
├── /app/ (or /pages/ if using Pages Router)
│   ├── page.js (homepage)
│   ├── /[slug]/ (individual posts)
│   ├── /category/[slug]/ (category archives)
│   ├── /dictionary/ (dictionary main page)
│   ├── /dictionary/[slug]/ (individual terms)
│   ├── /domains-for-sale/ (domains page)
│   ├── /contact/ (contact form)
│   ├── /search/ (search results)
│   └── /admin/ (admin dashboard - protected)
│       ├── /posts/
│       ├── /pages/
│       ├── /comments/
│       ├── /advertisers/
│       ├── /dictionary/
│       ├── /domains/
│       └── /analytics/
├── /components/
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── Sidebar.jsx
│   ├── AdDisplay.jsx
│   ├── CommentSection.jsx
│   ├── RelatedArticles.jsx
│   ├── SocialShare.jsx
│   └── ...
├── /lib/
│   ├── supabase.js (Supabase client)
│   ├── stripe.js (Stripe client)
│   └── utils.js
├── /public/
│   ├── /images/
│   └── robots.txt
├── /workers/ (Cloudflare Workers)
│   ├── ad-click-tracker.js
│   ├── redirect-handler.js
│   ├── stripe-webhook.js
│   └── contact-form.js
├── package.json
├── next.config.js
└── README.md
```

---

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx (server-side only)

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Mailchimp
MAILCHIMP_API_KEY=xxx
MAILCHIMP_LIST_ID=xxx

# Google Analytics
NEXT_PUBLIC_GA_TRACKING_ID=G-xxx

# Cloudflare (for Workers)
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_API_TOKEN=xxx

# Email (Resend or SendGrid)
RESEND_API_KEY=re_xxx
# or
SENDGRID_API_KEY=SG.xxx

# Site Config
NEXT_PUBLIC_SITE_URL=https://sullysblog.com
ADMIN_EMAIL=your@email.com
```

---

## Prioritized Task List for Claude Code

### Priority 1 (Must Have for Launch)
1. Database schema creation (Supabase SQL)
2. Next.js project setup
3. Homepage (latest posts listing)
4. Individual post pages
5. Category archive pages
6. Static pages
7. Comments system (with moderation logic)
8. Related articles component
9. Search functionality
10. URL preservation / redirects (Cloudflare Worker)
11. SEO meta tags, sitemap
12. Contact form
13. Mailchimp newsletter signup
14. Social share buttons
15. Image optimization pipeline
16. Admin authentication (Supabase Auth)
17. Admin: Create/edit posts
18. Admin: Comments moderation
19. Advertiser management (full system)
20. Ad display logic (all placements)
21. Ad impression/click tracking
22. Stripe integration (subscriptions, webhooks)
23. Dictionary pages + auto-linking
24. Domains for sale widget
25. Content migration scripts (WordPress → Supabase)

### Priority 2 (Post-Launch)
26. Editorial calendar
27. Advanced analytics dashboard
28. Link suggestions (internal linking)
29. Sedo auction widget
30. Social auto-posting
31. Multi-author support
32. Tags system
33. Advanced search filters
34. A/B testing

---

## Success Criteria

### Performance
- Lighthouse score: 90+ (Performance, Accessibility, Best Practices, SEO)
- Page load time: <2 seconds (homepage)
- Time to Interactive: <3 seconds

### SEO
- All 784 URLs accessible (no broken links)
- All redirects working (301 permanent)
- XML sitemap generated
- Meta tags on all pages
- Open Graph tags for social sharing
- No 404s after launch (monitor and fix quickly)

### Functionality
- Comments system working (moderation flow tested)
- Ad display accurate (date-based, placement rules enforced)
- Ad tracking accurate (impressions/clicks logged)
- Stripe payments processing correctly
- Email notifications working
- Contact form deliverable
- Newsletter signups syncing to Mailchimp
- Search returning relevant results
- Dictionary auto-linking working
- Domains widget displaying correctly

### User Experience
- Mobile responsive (all screen sizes)
- Fast navigation (client-side routing)
- Clear admin interface (easy to create posts, manage ads)
- Accessible (WCAG AA compliance)

---

## Rollback Plan

If major issues occur post-launch:
1. **DNS rollback:** Point domain back to WordPress (5 minutes)
2. **Keep WordPress running** on subdomain for 30 days as backup
3. **Database backup:** Daily Supabase exports during first week
4. **Monitor:** Cloudflare analytics, error logs, user feedback

---

## Budget Estimates (Monthly)

**Free Tier (Starting Out):**
- Cloudflare Pages: Free (500 builds/month, unlimited bandwidth)
- Supabase: Free (500MB database, 1GB file storage, 2GB bandwidth)
- Stripe: Free (2.9% + $0.30 per transaction)
- Mailchimp: Free (up to 500 subscribers)
- **Total: $0/month** (just transaction fees)

**Paid Tier (If You Grow):**
- Cloudflare Pages: $20/month (unlimited builds, advanced features)
- Supabase Pro: $25/month (8GB database, 100GB storage, 250GB bandwidth)
- Stripe: Same transaction fees
- Mailchimp Essentials: $13/month (up to 500 subscribers with automation)
- **Total: ~$60/month**

Compare to WordPress hosting: Likely $20-50/month depending on provider

---

## Timeline Estimate

**With Claude Code building:**
- Week 1: Database setup, Next.js scaffolding, core pages (homepage, posts, categories)
- Week 2: Comments, search, admin dashboard (content management)
- Week 3: Advertiser management system, ad display, tracking
- Week 4: Dictionary, domains widget, integrations (Stripe, Mailchimp)
- Week 5: Migration scripts, content import, testing
- Week 6: Refinement, bug fixes, performance optimization
- Week 7: Final testing, prepare for launch
- Week 8: Launch, monitor, iterate

**Total: ~2 months to fully functional site**

Faster if focusing only on MVP (could launch in 3-4 weeks with core features, add advertiser system post-launch).

---

## Notes for Claude Code

### Code Style Preferences
- Use TypeScript (type safety)
- Tailwind CSS for styling (utility-first)
- ESLint + Prettier for code formatting
- Component-based architecture (reusable components)
- Server components where possible (Next.js 13+)
- API routes for server-side logic
- Environment variables for all secrets
- Clear comments for complex logic

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API routes
- E2E tests for critical user flows (Playwright or Cypress)
- Manual testing checklist for admin features

### Documentation
- README with setup instructions
- API documentation (endpoints, parameters)
- Database schema diagram
- Deployment guide
- Admin user guide (how to use dashboard)

### Git Workflow
- Main branch: production-ready code
- Develop branch: ongoing development
- Feature branches: new features
- Pull requests for code review (if team expands)
- Commit messages: descriptive (conventional commits)

---

## Questions for Clarification (If Needed During Build)

1. Exact sidebar dimensions if different from 300x250?
2. Should related articles exclude posts from different categories entirely, or just prefer same category?
3. Contact form - where should emails be sent? (Admin email from env variable?)
4. Domain sale widget - how many to show in collapsed state? (e.g., show 5, "view all" button)
5. Dictionary - should terms be clickable from within other term definitions? (cross-linking)
6. Ad packages - should there be bundle discounts? (e.g., header + sidebar = $600 instead of $650?)
7. Admin - should there be user roles beyond admin? (e.g., editor, author with limited permissions)
8. Comments - should there be email notifications to post author when someone comments?
9. Newsletter - just signup, or also send new post notifications automatically?
10. Analytics - embed Google Analytics iframe in admin, or pull data via API for custom dashboard?

---

## Contact & Handoff

**Project Owner:** Sully (SullysBlog)
**Start Date:** [TBD]
**Expected Launch:** [TBD]

**Handoff to Claude Code:**
This document contains everything needed to rebuild SullysBlog. Please:
1. Review the database schema and create SQL migration scripts
2. Set up the Next.js project structure
3. Build features in priority order (see Priority 1 list)
4. Ask clarifying questions as needed
5. Provide progress updates after each major milestone
6. Flag any technical challenges or alternative approaches

**Success Metrics:**
- All 784 URLs preserved or redirected
- No functionality loss from WordPress version
- Improved performance (Lighthouse 90+)
- Clean, maintainable codebase
- Admin dashboard that's easier to use than WordPress

Let's build something great! 🚀
