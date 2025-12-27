# SullysBlog Rebuild - Quick Start Guide

## 🚀 Fast Track to Deployment

### Step 1: Create Supabase Project (5 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create new organization (or use existing)
4. Click "New Project"
   - Name: `sullysblog`
   - Database Password: (generate strong password)
   - Region: `us-east-1` (or closest to you)
5. Wait 2-3 minutes for project creation
6. Copy your project URL and anon key

### Step 2: Deploy Database Schema (10 minutes)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Open `supabase/migrations/001_initial_schema.sql`
4. Copy entire contents and paste into SQL Editor
5. Click **"Run"** (bottom right)
6. ✅ You should see "Success. No rows returned"

7. Repeat for `002_row_level_security.sql`
8. Repeat for `seeds/001_initial_data.sql`

### Step 3: Verify Database (2 minutes)

In SQL Editor, run:

```sql
-- Check tables created
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';
-- Should return 17

-- Check seed data
SELECT business_name FROM advertisers;
-- Should return 4 advertisers

-- Check MRR
SELECT calculate_current_mrr();
-- Should return 450
```

✅ If all checks pass, database is ready!

### Step 4: Set Up Storage (3 minutes)

1. Go to **Storage** in Supabase Dashboard
2. Click **"Create a new bucket"**
3. Create bucket:
   - Name: `uploads`
   - Public: ✅ Yes
4. Create another bucket:
   - Name: `ad-creatives`
   - Public: ✅ Yes

### Step 5: Configure Environment (2 minutes)

1. Copy `.env.example` to `.env.local`
2. Fill in Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   ```
3. Get keys from Supabase Dashboard → Settings → API

---

## 🎯 You're Ready!

### What You Have Now:
✅ Database with 17 tables deployed
✅ 4 advertisers loaded
✅ 5 active campaigns ($450/month MRR)
✅ Sample dictionary terms
✅ Storage buckets ready
✅ RLS security configured

### Next Steps:

**Option A: Build Next.js Frontend**
```bash
npx create-next-app@latest sullysblog --typescript --tailwind --app
cd sullysblog
npm install @supabase/supabase-js
```

**Option B: Migrate WordPress Content**
1. Complete Python migration script (posts, pages, comments)
2. Upload 872 MB of images to Supabase Storage
3. Generate 784 URL redirects

**Option C: Set Up Ad System First**
1. Create admin dashboard in Next.js
2. Build ad upload interface
3. Test ad display components
4. Configure Stripe for payments

---

## 📚 Documentation

- **Database Schema:** `supabase/README.md`
- **Migration Guide:** `docs/wordpress-migration-mapping.md`
- **Full Summary:** `DATABASE_SETUP_COMPLETE.md`

---

## ⚡ Common Commands

### Supabase CLI

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Pull remote schema
supabase db pull

# Push local migrations
supabase db push

# Reset database
supabase db reset
```

### Database Queries

```sql
-- Get all active campaigns
SELECT a.business_name, c.monthly_amount, c.end_date
FROM ad_campaigns c
JOIN advertisers a ON c.advertiser_id = a.id
WHERE c.status = 'active';

-- Get active ads for header
SELECT * FROM get_active_campaigns_by_placement('header');

-- Check expiring campaigns
SELECT * FROM get_expiring_campaigns(14);

-- Calculate MRR
SELECT calculate_current_mrr();
```

---

## 🔥 Total Time: ~25 minutes

You now have a production-ready database with your real advertiser data, ready to connect to a Next.js frontend!

What would you like to build first?
