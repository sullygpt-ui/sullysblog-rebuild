# Resource Management System

This document explains the new resource directory system for SullysBlog, including monetization features for sponsored and featured listings.

## Overview

The resource directory replaces the WordPress sullys-directory plugin with a Next.js + Supabase solution that supports:

- **Three listing tiers**: Free, Sponsored, and Featured
- **Click tracking** via `/go/[slug]` redirects
- **Revenue tracking** and expiration management
- **12 categories** of domain investing resources

## Database Schema

### Tables

#### `resources`
Main table for resource listings.

- `id`: UUID primary key
- `name`: Resource name (e.g., "GoDaddy", "Sedo")
- `slug`: URL-friendly slug
- `category`: Category slug (registration, aftermarket, etc.)
- `short_description`: Brief tagline
- `full_description`: Detailed description
- `destination_url`: The actual URL to redirect to
- `redirect_slug`: Used in `/go/[slug]` URLs for tracking
- `logo_url`: URL to logo image
- **Monetization fields:**
  - `listing_type`: 'free' | 'sponsored' | 'featured'
  - `monthly_fee`: Monthly fee charged (for reporting)
  - `start_date`: When sponsorship started
  - `end_date`: When sponsorship expires
  - `total_revenue`: Total revenue from this listing
  - `status`: 'active' | 'grace_period' | 'expired' | 'draft'
- `display_order`: Sort order within category (lower = first)
- `created_at`, `updated_at`: Timestamps

#### `resource_clicks`
Click tracking for analytics and reporting.

- `id`: UUID primary key
- `resource_id`: Foreign key to resources
- `clicked_at`: Timestamp
- `ip_address`, `user_agent`, `referer`, `page_url`: Tracking data

## Listing Tiers

### Free Listings
- Appear in "More [Category]" section
- Simple link with optional description
- No badge
- Free of charge

### Sponsored Listings
- Appear in grid above free listings
- Include logo, description, and "Sponsored" badge
- Highlighted card design
- Monthly fee (configurable per listing)

### Featured Listings
- Top placement within category
- Large featured card with gradient background
- "⭐ Featured Partner" badge
- Premium styling
- Highest monthly fee

## Categories

1. 🌐 **Registration & Hosting** (`registration`)
2. 💰 **Buy / Sell Domains** (`aftermarket`)
3. 📊 **Portfolio Management** (`portfolio`)
4. 🔧 **Domain Tools** (`tools`)
5. 📰 **Blogs & News** (`blogs`)
6. 📚 **Books** (`books`)
7. 🎙️ **Podcasts** (`podcasts`)
8. 📧 **Newsletters** (`newsletters`)
9. 💬 **Forums & Communities** (`forums`)
10. 📅 **Conferences & Events** (`conferences`)
11. ⚖️ **Legal Resources** (`legal`)
12. 💼 **Business Tools** (`business`)

## Click Tracking

All resource links use `/go/[redirect-slug]` URLs for tracking:

1. User clicks resource link
2. Next.js route handler at `/go/[slug]/route.ts` receives request
3. System logs click data (IP, user agent, referer, timestamp)
4. User is redirected to destination URL (302 redirect)

This enables:
- Analytics on which resources get the most clicks
- Value reporting for sponsors
- Understanding which categories are most popular

## Setup Instructions

### 1. Apply Database Migration

Run the migration to create tables:

```bash
# If using Supabase CLI locally
npx supabase db reset

# Or apply via Supabase Dashboard:
# Copy contents of supabase/migrations/20250101000004_create_resources.sql
# Paste into SQL Editor and run
```

### 2. Import WordPress Resources (Optional)

If migrating from WordPress sullys-directory plugin:

```bash
# Install mysql2 dependency
npm install mysql2

# Update database credentials in scripts/import-resources.mjs
# Then run:
node scripts/import-resources.mjs
```

The import script will:
- Connect to WordPress database
- Fetch all directory_listing posts
- Map WordPress categories to new system
- Import to Supabase resources table
- Handle duplicates and errors gracefully

### 3. Manual Resource Management

Until an admin UI is built, manage resources via Supabase Dashboard:

**To add a resource:**

```sql
INSERT INTO resources (
  name,
  slug,
  category,
  short_description,
  full_description,
  destination_url,
  redirect_slug,
  logo_url,
  listing_type,
  monthly_fee,
  start_date,
  end_date,
  status
) VALUES (
  'GoDaddy',
  'godaddy',
  'registration',
  'World''s largest domain registrar',
  'Register domains, get hosting, build websites. Over 20 million customers worldwide.',
  'https://www.godaddy.com',
  'godaddy',
  'https://example.com/godaddy-logo.png',
  'sponsored',
  50.00,
  '2025-01-01',
  '2025-12-31',
  'active'
);
```

**To upgrade a listing to sponsored:**

```sql
UPDATE resources
SET
  listing_type = 'sponsored',
  monthly_fee = 50.00,
  start_date = CURRENT_DATE,
  end_date = CURRENT_DATE + INTERVAL '1 year',
  status = 'active'
WHERE slug = 'godaddy';
```

**To track revenue:**

```sql
UPDATE resources
SET total_revenue = total_revenue + monthly_fee
WHERE slug = 'godaddy';
```

## Frontend Display

Resources are displayed on `/domain-resources` page:

- **Featured listings**: Full-width cards at top of category
- **Sponsored listings**: 2-column grid with badges
- **Free listings**: Simple list at bottom

Categories without resources are dimmed in the navigation grid.

## Click Analytics

**Get click stats for a resource:**

```sql
SELECT
  r.name,
  COUNT(*) as total_clicks,
  COUNT(CASE WHEN rc.clicked_at > NOW() - INTERVAL '30 days' THEN 1 END) as clicks_last_30_days,
  MAX(rc.clicked_at) as last_click
FROM resources r
LEFT JOIN resource_clicks rc ON r.id = rc.resource_id
WHERE r.slug = 'godaddy'
GROUP BY r.id, r.name;
```

**Top performing resources:**

```sql
SELECT
  r.name,
  r.category,
  r.listing_type,
  COUNT(rc.id) as clicks
FROM resources r
LEFT JOIN resource_clicks rc ON r.id = rc.resource_id
WHERE rc.clicked_at > NOW() - INTERVAL '30 days'
GROUP BY r.id, r.name, r.category, r.listing_type
ORDER BY clicks DESC
LIMIT 10;
```

## Revenue Management

### Expiration Workflow

The WordPress plugin had the following expiration workflow:

1. **7 days before expiration**: Warning notification sent
2. **3 days before expiration**: Final warning
3. **On expiration date**: Listing enters grace period (still shows as sponsored)
4. **During grace period** (default 7 days): Sponsor can renew
5. **After grace period**:
   - Option 1 (recommended): Move to free tier
   - Option 2: Hide listing (draft)
   - Option 3: Delete listing

**To implement in new system**, you would need to:

1. Create a cron job or Edge Function that runs daily
2. Check for listings approaching expiration
3. Send email notifications
4. Update status based on dates

Example SQL for finding expiring listings:

```sql
-- Expiring in 7 days
SELECT * FROM resources
WHERE end_date = CURRENT_DATE + INTERVAL '7 days'
AND status = 'active'
AND listing_type IN ('sponsored', 'featured');

-- Expired but in grace period
SELECT * FROM resources
WHERE end_date < CURRENT_DATE
AND end_date > CURRENT_DATE - INTERVAL '7 days'
AND status = 'grace_period'
AND listing_type IN ('sponsored', 'featured');

-- Grace period ended - move to free
UPDATE resources
SET
  listing_type = 'free',
  status = 'active',
  monthly_fee = 0
WHERE end_date < CURRENT_DATE - INTERVAL '7 days'
AND status = 'grace_period';
```

## Next Steps

### Recommended Admin Features

1. **Admin Dashboard** at `/admin/resources`
   - List all resources with filters
   - Edit resource details
   - View click analytics
   - Manage sponsorships

2. **Sponsorship Management**
   - Form to upgrade listings to sponsored/featured
   - Set start/end dates
   - Track payments and revenue
   - Auto-renewal options

3. **Email Notifications**
   - Expiration warnings (7 days, 3 days, on expiration)
   - Grace period notifications
   - Monthly revenue reports

4. **Analytics Dashboard**
   - Click trends over time
   - Top performing resources
   - Category analytics
   - Revenue by month

5. **Automated Expiration Handling**
   - Daily cron job via Supabase Edge Functions
   - Auto-downgrade expired listings
   - Email notifications

## API Endpoints

### `POST /api/resources/track-click`
Track a click event.

**Request:**
```json
{
  "resourceId": "uuid",
  "pageUrl": "/domain-resources"
}
```

### `GET /go/[slug]`
Redirect with tracking.

- Logs click to database
- Returns 302 redirect to destination_url
- Falls back to homepage if resource not found

## Security

- Public can view active/grace_period resources
- Public can track clicks (for analytics)
- Only authenticated users can manage resources
- Only authenticated users can view click data
- RLS policies enforce these rules

## Files Reference

- `supabase/migrations/20250101000004_create_resources.sql` - Database schema
- `lib/queries/resources.ts` - Query functions
- `app/api/resources/track-click/route.ts` - Click tracking API
- `app/go/[slug]/route.ts` - Redirect handler
- `components/resources/ResourceCard.tsx` - Display component
- `app/domain-resources/page.tsx` - Main resources page
- `scripts/import-resources.mjs` - WordPress import script
