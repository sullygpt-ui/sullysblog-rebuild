# Resource Directory - Quick Start Guide

This guide will help you get the new resource directory system up and running.

## Step 1: Apply Database Migration

The migration file creates the `resources` and `resource_clicks` tables.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New query**
4. Copy the entire contents of `supabase/migrations/20250101000004_create_resources.sql`
5. Paste into the SQL editor
6. Click **Run**
7. Verify tables were created:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('resources', 'resource_clicks');
   ```

### Option B: Using Supabase CLI (If Docker is running)

```bash
npx supabase db reset
```

## Step 2: Import Existing Resources (Optional)

If you have resources in the WordPress sullys-directory plugin:

### Configure Import Script

1. Open `scripts/import-resources.mjs`
2. Update the WordPress database credentials:
   ```javascript
   const wpConfig = {
     host: 'localhost',        // Your WordPress DB host
     user: 'root',             // Your WordPress DB user
     password: 'yourpassword', // Your WordPress DB password
     database: 'wordpress_db'  // Your WordPress DB name
   }
   ```

### Run Import

```bash
# Install mysql2 dependency
npm install

# Run the import script
node scripts/import-resources.mjs
```

The script will:
- Connect to your WordPress database
- Find all `directory_listing` posts
- Import them to Supabase `resources` table
- Map WordPress categories to new system
- Handle duplicates and errors

**Expected output:**
```
📊 Starting resource import from WordPress...
✅ Connected to WordPress database
📋 Found 45 directory listings in WordPress

✅ Imported: GoDaddy (sponsored - registration)
✅ Imported: Sedo (featured - aftermarket)
⏭️  Skipping "Draft Listing" - status: draft
...

============================================================
📊 Import Summary:
   ✅ Imported: 42
   ⏭️  Skipped: 3
   ❌ Errors: 0
   📋 Total: 45
============================================================
```

## Step 3: Add Resources Manually (Alternative)

If you don't have WordPress data or want to add resources manually:

### Via Supabase Dashboard

1. Go to **Table Editor** → **resources**
2. Click **Insert** → **Insert row**
3. Fill in the fields:
   - `name`: Resource name (e.g., "GoDaddy")
   - `slug`: URL slug (e.g., "godaddy")
   - `category`: One of: registration, aftermarket, portfolio, tools, blogs, books, podcasts, newsletters, forums, conferences, legal, business
   - `short_description`: Brief tagline
   - `full_description`: Detailed description
   - `destination_url`: Where to redirect (e.g., "https://godaddy.com")
   - `redirect_slug`: Slug for /go/ URLs (e.g., "godaddy")
   - `listing_type`: free | sponsored | featured
   - `status`: active
4. Click **Save**

### Via SQL

```sql
INSERT INTO resources (
  name,
  slug,
  category,
  short_description,
  destination_url,
  redirect_slug,
  listing_type,
  status
) VALUES
  ('GoDaddy', 'godaddy', 'registration', 'World''s largest domain registrar', 'https://www.godaddy.com', 'godaddy', 'sponsored', 'active'),
  ('Sedo', 'sedo', 'aftermarket', 'Premium domain marketplace', 'https://sedo.com', 'sedo', 'featured', 'aftermarket'),
  ('Namecheap', 'namecheap', 'registration', 'Affordable domains and hosting', 'https://www.namecheap.com', 'namecheap', 'free', 'active');
```

## Step 4: Test the System

### Test Resource Display

1. Visit `http://localhost:3000/domain-resources`
2. You should see:
   - Category grid at top
   - Categories with resources show counts
   - Featured listings appear first (large cards with ⭐ badge)
   - Sponsored listings appear in grid (with "Sponsored" badge)
   - Free listings appear in "More [Category]" section

### Test Click Tracking

1. Click on any resource link
2. You should be redirected through `/go/[slug]`
3. Check that the click was tracked:
   ```sql
   SELECT
     r.name,
     rc.clicked_at,
     rc.ip_address,
     rc.referer
   FROM resource_clicks rc
   JOIN resources r ON rc.resource_id = r.id
   ORDER BY rc.clicked_at DESC
   LIMIT 10;
   ```

## Step 5: Configure Sponsored Listings

To upgrade a free listing to sponsored:

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

To create a featured listing:

```sql
UPDATE resources
SET
  listing_type = 'featured',
  monthly_fee = 100.00,
  start_date = CURRENT_DATE,
  end_date = CURRENT_DATE + INTERVAL '1 year',
  status = 'active'
WHERE slug = 'sedo';
```

## Troubleshooting

### Resources Not Showing

**Check status:**
```sql
SELECT name, status, listing_type FROM resources;
```

Resources only show if:
- `status` is `active` or `grace_period`
- For free listings, any status works

**Fix:**
```sql
UPDATE resources SET status = 'active' WHERE status = 'expired';
```

### Click Tracking Not Working

1. Check browser console for errors
2. Verify `/go/[slug]` route exists: `app/go/[slug]/route.ts`
3. Test redirect manually: `http://localhost:3000/go/godaddy`
4. Check database for click records:
   ```sql
   SELECT * FROM resource_clicks ORDER BY clicked_at DESC LIMIT 5;
   ```

### Import Script Errors

**"Cannot connect to database":**
- Check WordPress DB credentials in `scripts/import-resources.mjs`
- Ensure WordPress database is accessible

**"No listings found":**
- Verify WordPress has directory_listing posts:
  ```sql
  SELECT COUNT(*) FROM wp_posts WHERE post_type = 'directory_listing';
  ```

**Duplicate errors:**
- Script will auto-append post ID to slug if duplicate
- Or manually remove duplicates from WordPress first

## Next Steps

See `docs/RESOURCE_MANAGEMENT.md` for:
- Complete feature documentation
- Analytics queries
- Revenue management
- Admin UI recommendations
- Automated expiration handling

## Support

For issues or questions:
1. Check `docs/RESOURCE_MANAGEMENT.md`
2. Review error messages in console/logs
3. Verify database schema matches migration file
4. Test with a simple free listing first
