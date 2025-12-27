# SullysBlog Supabase Database

Complete database schema for the rebuilt SullysBlog.com on Cloudflare Pages + Supabase.

## Overview

**Source:** WordPress site with 624 posts, 160 pages, 21 categories, 102 dictionary terms, 5 active ad campaigns
**Target:** Supabase PostgreSQL database with modern schema and features
**Current MRR:** $450/month from active advertisers

---

## Database Structure

### Core Content (Blog)
- **users** - Admin and author accounts
- **categories** - 21 blog categories
- **posts** - 624 blog posts with SEO metadata
- **pages** - 160 static pages
- **comments** - Comments with auto-approval workflow
- **approved_commenters** - Auto-approve trusted commenters

### Advertiser Management System
- **advertisers** - Advertiser contact information (4 active)
- **ad_packages** - Package templates for ad placements
- **ad_campaigns** - Active campaigns with dates and pricing (5 active)
- **ad_creatives** - Actual ads to display (image/HTML/text link)
- **ad_impressions** - Impression tracking for analytics
- **ad_clicks** - Click tracking for analytics
- **ad_payments** - Payment history and Stripe integration
- **campaign_history** - Archive of campaign changes/renewals

### Custom Features
- **dictionary_terms** - 102 domain industry terms with definitions
- **domains_for_sale** - Domain listings with PayPal integration

### Supporting Tables
- **redirects** - 784 WordPress URL redirects
- **newsletter_subscribers** - Mailchimp integration

---

## Migration Files

### 1. Schema Migration
**File:** `migrations/001_initial_schema.sql`

Creates all tables, indexes, and triggers.

```bash
# Run via Supabase CLI
supabase db reset
supabase db push
```

Or manually in Supabase SQL Editor:
1. Go to SQL Editor in Supabase Dashboard
2. Paste contents of `001_initial_schema.sql`
3. Run

### 2. Row Level Security
**File:** `migrations/002_row_level_security.sql`

Sets up RLS policies and helper functions.

**Key Features:**
- Public read access to published content
- Admin-only write access
- Auto-approve trusted commenters
- Ad tracking functions
- MRR calculation function

**Helper Functions:**
```sql
-- Check if user is admin
is_admin()

-- Get active ads by placement
get_active_campaigns_by_placement('header')

-- Calculate current MRR
calculate_current_mrr()

-- Get campaigns expiring in X days
get_expiring_campaigns(14)

-- Increment post view count
increment_post_views('post-slug')
```

### 3. Seed Data
**File:** `seeds/001_initial_data.sql`

Seeds database with existing WordPress data:
- 4 active advertisers
- 5 active ad campaigns
- Sample ad packages
- Sample dictionary terms (20/102)
- Sample categories (6/21)

```bash
# Run seed data
supabase db seed
```

---

## Current Data Summary

### Active Advertisers (5 Campaigns)
| Business | Monthly Rate | Start Date | End Date | Status |
|----------|-------------|------------|----------|--------|
| Grit Brokerage | $50 | 2025-10-01 | 2026-01-01 | Active |
| Grit Brokerage | $100 | 2026-01-01 | 2026-04-01 | Active |
| NSlookup.io | $100 | 2025-11-21 | 2026-02-21 | Active |
| .AGT | $100 | 2025-11-25 | 2026-02-25 | Active |
| Gname | $100 | 2025-12-09 | 2026-03-09 | Active |

**Total MRR:** $450/month

### Content to Migrate
- ✅ 624 blog posts
- ✅ 160 pages
- ✅ 21 categories
- ✅ 102 dictionary terms
- ✅ Comments (count TBD)
- ✅ 872 MB images
- ✅ 784 URL redirects

---

## Setup Instructions

### 1. Create Supabase Project

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Initialize
supabase init
```

### 2. Run Migrations

```bash
# Apply schema
supabase db push

# Or reset and apply
supabase db reset
```

### 3. Seed Initial Data

```bash
# Run seed files
supabase db seed
```

### 4. Set Up Storage

Create storage buckets for:
- `uploads` - Blog post images (872 MB)
- `ad-creatives` - Advertiser creative assets

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('uploads', 'uploads', true),
  ('ad-creatives', 'ad-creatives', true);
```

### 5. Configure Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

---

## Migration Scripts

### Python Migration Script
**File:** `../scripts/migrate-wordpress.py`

Migrates WordPress data to Supabase.

**Requirements:**
```bash
pip install python-dotenv supabase-py mysql-connector-python
```

**Usage:**
```bash
python scripts/migrate-wordpress.py \
  --sql-file SullysBlog-122225-backup/backup.sql
```

**What it migrates:**
- ✅ Categories
- ✅ Advertisers
- ✅ Ad campaigns
- ✅ Dictionary terms (sample)
- 🔄 Posts (TODO)
- 🔄 Pages (TODO)
- 🔄 Comments (TODO)
- 🔄 Domains for sale (TODO)
- 🔄 Redirects (TODO)

---

## Database Schema Highlights

### Ad Campaign Date Logic

Campaigns are automatically shown/hidden based on dates:

```sql
-- Get active ads for header placement
SELECT * FROM get_active_campaigns_by_placement('header');

-- Returns only campaigns where:
-- - status = 'active'
-- - start_date <= CURRENT_DATE
-- - end_date >= CURRENT_DATE
```

### Comment Auto-Approval

First-time commenters go to moderation. Approved commenters auto-approve:

```sql
-- Trigger checks approved_commenters table
-- If email exists, comment.status = 'approved'
-- Otherwise, comment.status = 'pending'
```

### Ad Tracking

Impressions and clicks logged client-side:

```typescript
// Log impression when ad enters viewport
await supabase
  .from('ad_impressions')
  .insert({
    creative_id: adId,
    post_id: postId,
    ip_address: clientIp,
  })

// Log click
await supabase
  .from('ad_clicks')
  .insert({
    creative_id: adId,
    post_id: postId,
  })
```

### MRR Calculation

Real-time MRR from active campaigns:

```sql
SELECT calculate_current_mrr();
-- Returns: 450.00
```

---

## Ad Placement Types

| Placement | Description | Size |
|-----------|-------------|------|
| `header` | Exclusive header banner | 728x90 or 300x250 |
| `footer` | Footer banner | Full width |
| `top_square_1` | First square below header | 300x250 |
| `top_square_2` | Second square below header | 300x250 |
| `top_square_3` | Third square below header | 300x250 |
| `top_square_4` | Fourth square below header | 300x250 |
| `sidebar` | Sidebar ad | 300x600 or 300x250 |

---

## Next Steps

1. ✅ **Database schema created**
2. ✅ **RLS policies configured**
3. ✅ **Seed data prepared**
4. ✅ **Migration mapping documented**
5. 🔄 **Complete Python migration script** (partial)
6. 🔄 **Migrate images to Supabase Storage**
7. 🔄 **Build Next.js frontend**
8. 🔄 **Set up Cloudflare Workers**
9. 🔄 **Configure Stripe webhooks**
10. 🔄 **Test full migration**

---

## Useful Queries

### Check Active Campaigns
```sql
SELECT
  a.business_name,
  c.monthly_amount,
  c.start_date,
  c.end_date,
  c.status
FROM ad_campaigns c
JOIN advertisers a ON c.advertiser_id = a.id
WHERE c.status = 'active'
ORDER BY c.end_date;
```

### Get Expiring Campaigns
```sql
SELECT * FROM get_expiring_campaigns(14);
```

### Campaign Analytics
```sql
SELECT
  a.business_name,
  ac.placement,
  COUNT(DISTINCT ai.id) as impressions,
  COUNT(DISTINCT acl.id) as clicks,
  CASE
    WHEN COUNT(DISTINCT ai.id) > 0
    THEN ROUND((COUNT(DISTINCT acl.id)::numeric / COUNT(DISTINCT ai.id) * 100), 2)
    ELSE 0
  END as ctr_percentage
FROM ad_creatives ac
JOIN ad_campaigns camp ON ac.campaign_id = camp.id
JOIN advertisers a ON camp.advertiser_id = a.id
LEFT JOIN ad_impressions ai ON ac.id = ai.creative_id
LEFT JOIN ad_clicks acl ON ac.id = acl.creative_id
WHERE camp.status = 'active'
GROUP BY a.business_name, ac.placement
ORDER BY impressions DESC;
```

---

## Support

For questions or issues:
- Review `../docs/wordpress-migration-mapping.md` for detailed field mapping
- Check Supabase logs for errors
- Validate data after migration with verification queries

---

## Schema Version

**Current Version:** 1.0.0
**Last Updated:** December 22, 2024
**WordPress Backup Date:** December 22, 2024
