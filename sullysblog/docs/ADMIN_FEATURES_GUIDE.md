# Admin Features - Complete Guide

This guide covers all 5 admin features for the Resource Directory system.

## 📋 Table of Contents

1. [Admin Dashboard](#1-admin-dashboard)
2. [Email Notifications](#2-email-notifications)
3. [Automated Expiration Handler](#3-automated-expiration-handler)
4. [Analytics Dashboard](#4-analytics-dashboard)
5. [Sponsor Portal](#5-sponsor-portal)

---

## 1. Admin Dashboard

**Location:** `/admin/resources`

### Features

- **Full CRUD Operations**: Create, Read, Update, Delete resources
- **Advanced Filtering**: By category, listing type, status
- **Search**: Real-time search across names and descriptions
- **Bulk Stats**: View counts at a glance
- **Visual Status Indicators**: Color-coded badges for types and statuses
- **Expiration Tracking**: See days remaining for each listing

### How to Use

1. **Login**: Visit `/admin/login` and sign in with your Supabase credentials
2. **Navigate**: Click "Resources" in the sidebar
3. **Add Resource**: Click "+ Add Resource" button
4. **Edit Resource**: Click the edit icon on any row
5. **Delete Resource**: Click the delete icon (with confirmation)
6. **Filter**: Use the dropdowns to filter by category, type, or status
7. **Search**: Type in the search box to find specific resources

### Resource Fields

| Field | Description | Required |
|-------|-------------|----------|
| Name | Resource name (e.g., "GoDaddy") | Yes |
| Slug | URL-friendly identifier | Yes |
| Category | One of 12 predefined categories | Yes |
| Short Description | Brief tagline | No |
| Full Description | Detailed description | No |
| Destination URL | Where users are redirected | Yes |
| Redirect Slug | Used in /go/[slug] URLs | Yes |
| Logo URL | Image URL for logo | No |
| Listing Type | free / sponsored / featured | Yes |
| Monthly Fee | Fee charged (for tracking) | No |
| Start Date | When sponsorship started | No |
| End Date | When sponsorship expires | No |
| Status | active / grace_period / expired / draft | Yes |
| Display Order | Sort order (lower = first) | No |

---

## 2. Email Notifications

**Technology:** Resend API

### Notification Types

1. **7-Day Warning** (sent 7 days before expiration)
   - Alert sponsor that expiration is approaching
   - Encourage renewal

2. **3-Day Final Warning** (sent 3 days before expiration)
   - Urgent reminder
   - Explain grace period process

3. **Grace Period Started** (sent on expiration day)
   - Notify that listing entered grace period
   - Still showing as sponsored for 7 more days
   - Renewal opportunity

4. **Downgraded to Free** (sent 7 days after expiration)
   - Listing moved to free tier
   - Offer to upgrade again

5. **Renewal Confirmation** (sent when renewed)
   - Confirmation of successful renewal
   - New expiration date

### Setup

1. **Get Resend API Key**:
   - Sign up at [resend.com](https://resend.com)
   - Create API key
   - Add to `.env.local`:
     ```
     RESEND_API_KEY=re_your_api_key_here
     EMAIL_FROM=SullysBlog <noreply@sullysblog.com>
     ADMIN_EMAIL=admin@sullysblog.com
     ```

2. **Verify Domain** (optional but recommended):
   - Add DNS records in Resend dashboard
   - Use your own domain for professional emails

3. **Test Email System**:
   ```bash
   # Trigger manually from admin
   curl -X POST http://localhost:3000/api/cron/check-expirations \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

---

## 3. Automated Expiration Handler

**Runs:** Daily at 9:00 AM UTC
**Technology:** Vercel Cron + Edge Functions

### What It Does

The cron job runs daily and:

1. **Checks all paid listings** (sponsored/featured)
2. **Sends notifications** based on days until expiration:
   - 7 days before: Warning email
   - 3 days before: Final warning email
   - 0 days (today): Grace period started email
   - 7 days after expiration: Downgrade to free + email

3. **Updates resource status**:
   - On expiration: Changes status to `grace_period`
   - After grace period: Changes `listing_type` to `free`, status to `active`, fee to 0

### Setup

#### Option A: Vercel Cron (Automatic)

Already configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/check-expirations",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Vercel will automatically call this endpoint daily at 9:00 AM UTC.

#### Option B: External Cron Service

If not using Vercel, set up a cron job with any service (GitHub Actions, cron-job.org, etc.):

```bash
curl -X POST https://sullysblog.com/api/cron/check-expirations \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Security

The cron endpoint is protected by a secret:

```bash
# .env.local
CRON_SECRET=your-random-secret-string-here
```

Only requests with the correct Bearer token will be accepted.

### Manual Trigger

You can manually trigger the expiration check from the command line:

```bash
curl -X POST http://localhost:3000/api/cron/check-expirations \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 4. Analytics Dashboard

**Location:** `/admin/analytics`

### Metrics Displayed

#### Summary Cards
- **Total Resources**: Overall resource count
- **Total Clicks (30d)**: Clicks in last 30 days
- **Monthly Revenue**: Current active sponsorships
- **Annual Revenue**: Monthly revenue × 12

#### Resource Distribution
- Count of Featured, Sponsored, and Free listings

#### Clicks Over Time
- Line chart showing daily click trends
- Last 30 days

#### Top Resources
- Top 10 resources by clicks
- Shows name, category, type, and click count

#### Clicks by Category
- Bar chart showing which categories get most engagement

#### Revenue Projection
- Monthly revenue trend over past 12 months

### How to Use

1. Visit `/admin/analytics`
2. View real-time data (refreshes on each page load)
3. Use charts to identify trends:
   - Which resources get the most clicks?
   - Which categories are popular?
   - Is revenue growing?

### Customization

To change the time period (default: 30 days), edit the page:

```typescript
// app/admin/analytics/page.tsx
const analytics = await getAnalyticsData(60) // 60 days instead of 30
```

---

## 5. Sponsor Portal

**Location:** `/admin/sponsors`

### Features

- **Sponsor Overview**: All sponsored and featured listings
- **Revenue Tracking**: Monthly and annual revenue totals
- **Performance Metrics**: Total clicks and 30-day clicks for each sponsor
- **Expiration Monitoring**: See which sponsorships are expiring soon
- **Filters**: View all, featured only, sponsored only, or expiring soon

### Sponsor Card Details

Each sponsor card shows:
- Name and category
- Listing type (featured/sponsored)
- Total clicks (all time)
- Recent clicks (last 30 days)
- Monthly fee
- Total revenue earned
- Start and end dates
- Days remaining until expiration

### Status Colors

- **Green**: 30+ days remaining
- **Yellow**: 8-30 days remaining
- **Orange**: 1-7 days remaining
- **Red**: Expired

### How to Use

1. Visit `/admin/sponsors`
2. View high-level stats at the top
3. Filter sponsors by type or expiration status
4. Click edit icon to manage a sponsor's listing
5. Monitor "Expiring Soon" count to proactively reach out to sponsors

---

## 🔧 Complete Setup Checklist

### 1. Environment Variables

Add to `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Site
NEXT_PUBLIC_SITE_URL=https://sullysblog.com

# Email (Resend)
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=SullysBlog <noreply@sullysblog.com>
ADMIN_EMAIL=admin@sullysblog.com

# Cron Security
CRON_SECRET=generate-random-secret-here
```

### 2. Database Migration

Run the resources migration:

```sql
-- Copy contents of:
supabase/migrations/20250101000004_create_resources.sql

-- And run in Supabase SQL Editor
```

### 3. Install Dependencies

```bash
npm install
```

This will install:
- `resend` - Email service
- `recharts` - Charts for analytics
- `mysql2` - For WordPress import (optional)

### 4. Create Admin User

In Supabase dashboard:
1. Go to Authentication → Users
2. Click "Add user"
3. Create admin account with email/password

### 5. Import Resources (Optional)

If migrating from WordPress:

```bash
# Update credentials in scripts/import-resources.mjs
node scripts/import-resources.mjs
```

### 6. Test the System

1. Login at `/admin/login`
2. Add a test resource at `/admin/resources`
3. Check analytics at `/admin/analytics`
4. View sponsors at `/admin/sponsors`
5. Test email (if configured):
   ```bash
   curl -X POST http://localhost:3000/api/cron/check-expirations \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

---

## 📊 Usage Workflows

### Adding a New Sponsor

1. Go to `/admin/resources`
2. Click "+ Add Resource"
3. Fill in details:
   - Name, category, URLs
   - Set `listing_type` to "sponsored" or "featured"
   - Set `monthly_fee` (e.g., 50.00)
   - Set `start_date` to today
   - Set `end_date` to 1 year from now
   - Set `status` to "active"
4. Click "Create Resource"
5. Sponsor will appear on `/domain-resources` page
6. Clicks will be tracked automatically

### Renewing a Sponsor

1. Go to `/admin/resources`
2. Find the sponsor (search or filter)
3. Click edit icon
4. Update `end_date` to new expiration
5. Update `total_revenue` (+= monthly_fee)
6. Click "Update Resource"

### Monitoring Expirations

1. Go to `/admin/sponsors`
2. Click "Expiring Soon" filter
3. See all sponsors expiring in next 30 days
4. Contact sponsors proactively for renewals

### Viewing Performance

1. Go to `/admin/analytics`
2. Check "Top Resources" to see best performers
3. Share stats with sponsors to demonstrate value
4. Use "Clicks by Category" to optimize content strategy

---

## 🚨 Troubleshooting

### Emails Not Sending

1. Check Resend API key is correct
2. Verify domain in Resend dashboard
3. Check `ADMIN_EMAIL` is set
4. Test manually:
   ```bash
   curl -X POST http://localhost:3000/api/cron/check-expirations \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

### Cron Not Running

1. Check `vercel.json` is deployed
2. Verify in Vercel dashboard → Cron
3. Check logs in Vercel dashboard
4. Ensure `CRON_SECRET` is set in Vercel environment variables

### Charts Not Loading

1. Ensure `recharts` is installed
2. Check browser console for errors
3. Verify analytics data is being fetched

### Resources Not Showing

1. Check resource `status` is "active" or "grace_period"
2. For free listings, any status works
3. Check `/go/[slug]` redirects work
4. Verify Supabase RLS policies allow public read

---

## 📈 Best Practices

### Revenue Tracking

- Update `total_revenue` field when sponsors renew
- Use monthly fees for forecasting
- Export data periodically for accounting

### Email Communication

- Review email templates in `lib/email/templates.ts`
- Customize messaging to match your brand
- Test emails before going live

### Analytics

- Check analytics weekly
- Share top performer stats with sponsors
- Use data to justify pricing

### Sponsor Relations

- Respond to expiring soon notifications promptly
- Offer renewal incentives (e.g., discount for annual)
- Track sponsor satisfaction through click-through rates

---

## 🔐 Security Notes

- Admin routes protected by Supabase Auth
- Cron endpoint protected by secret token
- RLS policies enforce data access rules
- Click tracking uses server-side IP detection
- All sponsor data requires authentication to view

---

## 🎯 Next Steps

Consider adding:
- Automatic payment processing (Stripe integration)
- Sponsor self-service portal (separate login for sponsors)
- Advanced analytics (CTR, conversion tracking)
- Custom email templates per sponsor tier
- A/B testing for different placements
- Bulk operations (import/export sponsors)
- Revenue reporting dashboard
- API for third-party integrations

---

## 📞 Support

Questions? Check:
- `docs/RESOURCE_MANAGEMENT.md` - Technical documentation
- `docs/RESOURCE_QUICK_START.md` - Quick start guide
- Supabase documentation
- Resend documentation
- Recharts documentation
