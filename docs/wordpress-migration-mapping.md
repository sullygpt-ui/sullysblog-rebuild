# WordPress to Supabase Data Migration Mapping

## Overview
This document maps WordPress database tables to the new Supabase schema for SullysBlog.com migration.

**WordPress Database Prefix:** `wp_5sn88nclkq_`
**Content:** 624 posts, 160 pages, 21 categories, 102 dictionary terms

---

## Table Mapping

### 1. Users & Authors

**WordPress → Supabase**

```sql
-- Source: wp_5sn88nclkq_users
SELECT
    ID as wordpress_id,
    user_email as email,
    display_name as name,
    user_registered as created_at,
    -- Map user roles (wp_5sn88nclkq_usermeta where meta_key = 'wp_5sn88nclkq_capabilities')
    CASE
        WHEN meta_value LIKE '%administrator%' THEN 'admin'
        ELSE 'author'
    END as role
FROM wp_5sn88nclkq_users
JOIN wp_5sn88nclkq_usermeta ON ID = user_id;

-- Target: users table
INSERT INTO users (email, name, role, created_at);
```

---

### 2. Categories

**WordPress → Supabase**

```sql
-- Source: wp_5sn88nclkq_terms + wp_5sn88nclkq_term_taxonomy
SELECT
    t.term_id,
    t.name,
    t.slug,
    tt.description
FROM wp_5sn88nclkq_terms t
JOIN wp_5sn88nclkq_term_taxonomy tt ON t.term_id = tt.term_id
WHERE tt.taxonomy = 'category';

-- Target: categories table
-- Expected count: 21 categories
```

---

### 3. Posts

**WordPress → Supabase**

```sql
-- Source: wp_5sn88nclkq_posts
SELECT
    p.ID as wordpress_id,
    p.post_name as slug,
    p.post_title as title,
    p.post_content as content,
    p.post_excerpt as excerpt,
    p.post_author, -- Map to users.id
    p.post_status, -- Map: 'publish' → 'published', 'draft' → 'draft', 'future' → 'scheduled'
    p.post_date as published_at,
    p.post_modified as updated_at,
    CONCAT('https://sullysblog.com/', p.post_name, '/') as wordpress_url,
    -- Get featured image from postmeta
    (SELECT meta_value FROM wp_5sn88nclkq_postmeta
     WHERE post_id = p.ID AND meta_key = '_thumbnail_id') as featured_image_id,
    -- Get category
    (SELECT term_id FROM wp_5sn88nclkq_term_relationships tr
     JOIN wp_5sn88nclkq_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
     WHERE tr.object_id = p.ID AND tt.taxonomy = 'category'
     LIMIT 1) as category_id,
    -- Get Yoast SEO data
    (SELECT meta_value FROM wp_5sn88nclkq_postmeta
     WHERE post_id = p.ID AND meta_key = '_yoast_wpseo_title') as seo_title,
    (SELECT meta_value FROM wp_5sn88nclkq_postmeta
     WHERE post_id = p.ID AND meta_key = '_yoast_wpseo_metadesc') as seo_description
FROM wp_5sn88nclkq_posts p
WHERE p.post_type = 'post'
AND p.post_status IN ('publish', 'draft', 'future');

-- Target: posts table
-- Expected count: ~624 posts
```

**Featured Image URL Resolution:**
```sql
-- Get actual image URL from attachment ID
SELECT guid
FROM wp_5sn88nclkq_posts
WHERE ID = [featured_image_id]
AND post_type = 'attachment';
```

---

### 4. Pages

**WordPress → Supabase**

```sql
-- Source: wp_5sn88nclkq_posts (post_type = 'page')
SELECT
    p.ID as wordpress_id,
    p.post_name as slug,
    p.post_title as title,
    p.post_content as content,
    p.post_status, -- Map: 'publish' → 'published', 'draft' → 'draft'
    p.post_date as created_at,
    p.post_modified as updated_at,
    CONCAT('https://sullysblog.com/', p.post_name, '/') as wordpress_url,
    -- Yoast SEO
    (SELECT meta_value FROM wp_5sn88nclkq_postmeta
     WHERE post_id = p.ID AND meta_key = '_yoast_wpseo_title') as seo_title,
    (SELECT meta_value FROM wp_5sn88nclkq_postmeta
     WHERE post_id = p.ID AND meta_key = '_yoast_wpseo_metadesc') as seo_description
FROM wp_5sn88nclkq_posts p
WHERE p.post_type = 'page'
AND p.post_status IN ('publish', 'draft')
-- Exclude dictionary term pages (they have their own table)
AND p.ID NOT IN (
    SELECT page_id FROM wp_5sn88nclkq_domain_dictionary WHERE page_id IS NOT NULL
);

-- Target: pages table
-- Expected count: ~160 pages (minus dictionary term pages)
```

---

### 5. Comments

**WordPress → Supabase**

```sql
-- Source: wp_5sn88nclkq_comments
SELECT
    comment_ID as wordpress_id,
    comment_post_ID, -- Map to posts.id via wordpress_id
    comment_parent, -- Map to comments.id (for nested replies)
    comment_author as author_name,
    comment_author_email as author_email,
    comment_author_url as author_url,
    comment_content as content,
    comment_approved, -- Map: '1' → 'approved', '0' → 'pending', 'spam' → 'spam'
    comment_date as created_at,
    comment_author_IP as ip_address,
    comment_agent as user_agent
FROM wp_5sn88nclkq_comments
WHERE comment_type = ''  -- Regular comments only
ORDER BY comment_date ASC;

-- Target: comments table
```

**Auto-Approve Logic:**
```sql
-- Find commenters with at least 1 approved comment
SELECT DISTINCT comment_author_email
FROM wp_5sn88nclkq_comments
WHERE comment_approved = '1';

-- Target: approved_commenters table
```

---

### 6. Advertiser System

#### 6.1 Advertisers

**WordPress → Supabase**

```sql
-- Source: wp_5sn88nclkq_advertiser_tracker
SELECT
    id as wordpress_id,
    business_name,
    contact as contact_name,
    email as contact_email,
    link_url as company_url,
    notes
FROM wp_5sn88nclkq_advertiser_tracker
WHERE status IN ('active', 'inactive');

-- Target: advertisers table
```

**Current Advertisers (from backup):**
1. Grit Brokerage
2. NSlookup.io
3. .AGT
4. Gname

#### 6.2 Ad Campaigns

**WordPress → Supabase**

```sql
-- Source: wp_5sn88nclkq_advertiser_tracker
SELECT
    id,
    business_name, -- Map to advertisers.id
    start_date,
    end_date,
    status, -- Map: 'active' → 'active', 'inactive' → 'expired'
    monthly_rate as monthly_amount,
    months as duration_months,
    notes
FROM wp_5sn88nclkq_advertiser_tracker;

-- Target: ad_campaigns table
```

**Known Campaigns:**
- Grit Brokerage: $50/month (10/1/25 - 1/1/26)
- Grit Brokerage: $100/month (1/1/26 - 4/1/26)
- NSlookup.io: $100/month (11/21/25 - 2/21/26)
- .AGT: $100/month (11/25/25 - 2/25/26)
- Gname: $100/month (12/9/25 - 3/9/26)

**Current MRR: $450/month**

#### 6.3 Ad Packages

**WordPress → Supabase**

```sql
-- Source: wp_5sn88nclkq_advertising_packages
SELECT
    id,
    package_name as name,
    monthly_price,
    duration_months,
    ad_size, -- Map to placement_type
    description
FROM wp_5sn88nclkq_advertising_packages;

-- Found: "Header Square Banner - 3 Month" ($200/month, 300x250)
```

#### 6.4 Campaign History

**WordPress → Supabase**

```sql
-- Source: wp_5sn88nclkq_advertiser_history
SELECT
    id,
    advertiser_id, -- Original tracker ID
    business_name,
    contact as contact_name,
    email as contact_email,
    link_url as company_url,
    monthly_rate as monthly_amount,
    start_date,
    end_date,
    status,
    notes,
    archived_date as archived_at
FROM wp_5sn88nclkq_advertiser_history;

-- Target: campaign_history table
```

**Note:** Ad creatives (images, HTML, placement info) are NOT in WordPress database. They need to be manually created or extracted from theme code.

---

### 7. Dictionary System

**WordPress → Supabase**

```sql
-- Source: wp_5sn88nclkq_domain_dictionary
SELECT
    id,
    term,
    slug,
    page_id as wordpress_page_id,
    definition as full_definition,
    -- Need to extract short_definition from full_definition (first 100-150 chars)
    SUBSTRING(definition, 1, 150) as short_definition,
    created_at,
    updated_at
FROM wp_5sn88nclkq_domain_dictionary
ORDER BY term ASC;

-- Target: dictionary_terms table
-- Expected count: 102 terms
```

**Sample Terms Found:**
- WIPO, URS, IDNA, Punycode
- SEO, SERP, ccTLD, gTLD
- UDRP, DNS, Registrar, Registry
- Whois, Backorder, Drop Catching
- Premium Domain, Parking Page, PPC
- Aftermarket, End User

---

### 8. Domains for Sale

**WordPress → Supabase**

```sql
-- Source: wp_5sn88nclkq_posts (post_type = 'domain_sale')
SELECT
    p.ID as wordpress_id,
    p.post_title as domain_name, -- Or get from postmeta '_domain_url'
    p.post_status, -- Map: 'publish' → is_active = true
    (SELECT meta_value FROM wp_5sn88nclkq_postmeta
     WHERE post_id = p.ID AND meta_key = '_domain_url') as domain_name_alt,
    (SELECT meta_value FROM wp_5sn88nclkq_postmeta
     WHERE post_id = p.ID AND meta_key = '_domain_price') as price,
    (SELECT meta_value FROM wp_5sn88nclkq_postmeta
     WHERE post_id = p.ID AND meta_key = '_domain_highlight') as is_highlighted
FROM wp_5sn88nclkq_posts p
WHERE p.post_type = 'domain_sale';

-- Target: domains_for_sale table
```

**PayPal Link Generation:**
```
https://www.paypal.com/cgi-bin/webscr?cmd=_xclick
&business=[PAYPAL_EMAIL]
&item_name=[DOMAIN_NAME] - Domain Name
&amount=[PRICE]
&currency_code=USD
```

---

### 9. URL Redirects

**WordPress → Supabase**

```sql
-- Source: EPS 301 Redirects plugin table (need to identify table name)
-- Likely: wp_5sn88nclkq_redirects or similar

-- Also generate redirects from all content:
SELECT
    CONCAT('https://sullysblog.com/', post_name, '/') as old_url,
    CONCAT('/', post_name) as new_url,
    301 as redirect_type
FROM wp_5sn88nclkq_posts
WHERE post_status = 'publish'
AND post_type IN ('post', 'page');

-- Target: redirects table
-- Expected: 784 URLs (624 posts + 160 pages)
```

---

### 10. Newsletter Subscribers

**WordPress → Supabase**

```sql
-- Source: Mailchimp integration (may not be in WordPress DB)
-- Check for newsletter plugin tables

-- Target: newsletter_subscribers table
-- Sync via Mailchimp API instead
```

---

## Image Migration

### WordPress Uploads Structure
```
wp-content/uploads/
  2009/
  2010/
  ...
  2024/
    01/image.jpg
    02/image.jpg
  2025/
  2026/
```

**Total Size:** 872 MB

### Migration Strategy

1. **Download all images** from WordPress uploads folder
2. **Upload to Supabase Storage** maintaining year/month structure
3. **Update URLs** in content:
   - Find: `https://sullysblog.com/wp-content/uploads/`
   - Replace: `[SUPABASE_STORAGE_URL]/uploads/`
4. **Convert to WebP** (already done in WordPress via WebP Uploads plugin)

---

## Custom Fields & Meta Data

### Post Meta to Preserve

```sql
-- Yoast SEO
_yoast_wpseo_title → posts.seo_title
_yoast_wpseo_metadesc → posts.seo_description

-- Featured Image
_thumbnail_id → Resolve to posts.featured_image_url

-- Custom Fields (check if used)
SELECT DISTINCT meta_key
FROM wp_5sn88nclkq_postmeta
WHERE meta_key NOT LIKE '\_%'
ORDER BY meta_key;
```

---

## Migration Order

1. **Users** (create admin first)
2. **Categories** (21 categories)
3. **Posts** (624 posts - resolve featured images)
4. **Pages** (160 pages - exclude dictionary pages)
5. **Comments** (with parent/child relationships)
6. **Approved Commenters** (from comment history)
7. **Advertisers** (4 active advertisers)
8. **Ad Packages** (1 package template)
9. **Ad Campaigns** (5 active campaigns)
10. **Campaign History** (archived campaigns)
11. **Dictionary Terms** (102 terms)
12. **Domains for Sale** (count TBD)
13. **Redirects** (784 URLs)
14. **Images** (872 MB uploads folder)

---

## Data Validation Checklist

After migration, verify:

- [ ] Post count: 624 posts
- [ ] Page count: 160 pages
- [ ] Category count: 21 categories
- [ ] Dictionary terms: 102 terms
- [ ] Active campaigns: 5 campaigns
- [ ] Current MRR: $450/month
- [ ] All images accessible
- [ ] All URLs redirect properly
- [ ] Comments preserved with threading
- [ ] Featured images display correctly
- [ ] SEO metadata intact

---

## Notes

### Missing from WordPress
- **Ad creatives** (images, HTML, placements) - need to recreate
- **Impression/click tracking** - new feature
- **Stripe integration** - new feature
- **Ad creative storage** - new feature

### WordPress Plugins to Replace
- **EPS 301 Redirects** → redirects table + Cloudflare Worker
- **Yoast SEO** → Next.js metadata API
- **Mailchimp** → API integration
- **Contact Form 7** → Custom Next.js form
- **Advertiser Tracker** → Full ad system rebuild
- **Dictionary Manager** → New dictionary system
- **Domain Sales** → New domains system
