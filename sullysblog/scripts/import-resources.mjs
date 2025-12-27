import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import mysql from 'mysql2/promise'

// Read .env.local
const envFile = readFileSync('.env.local', 'utf-8')
const env = {}
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim()
  }
})

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY
)

// WordPress database connection details
// Update these with your WordPress database credentials
const wpConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'wordpress_sullysblog'
}

// Category mapping from WordPress to our system
const categoryMapping = {
  'domain-registrars': 'registration',
  'domain-hosting': 'registration',
  'marketplaces': 'aftermarket',
  'domain-brokers': 'aftermarket',
  'portfolio-tools': 'portfolio',
  'domain-tools': 'tools',
  'appraisal-tools': 'tools',
  'blogs': 'blogs',
  'news-sites': 'blogs',
  'books': 'books',
  'podcasts': 'podcasts',
  'newsletters': 'newsletters',
  'forums': 'forums',
  'communities': 'forums',
  'conferences': 'conferences',
  'events': 'conferences',
  'legal': 'legal',
  'trademark': 'legal',
  'business-services': 'business',
  'consulting': 'business'
}

// Listing type mapping
const listingTypeMapping = {
  'free': 'free',
  'sponsored': 'sponsored',
  'premium': 'featured',
  'featured': 'featured'
}

async function importResources() {
  let connection

  try {
    console.log('📊 Starting resource import from WordPress...\n')

    // Connect to WordPress database
    connection = await mysql.createConnection(wpConfig)
    console.log('✅ Connected to WordPress database')

    // Get all directory listings from WordPress
    const [posts] = await connection.execute(`
      SELECT p.ID, p.post_title, p.post_name, p.post_status, p.post_date
      FROM wp_posts p
      WHERE p.post_type = 'directory_listing'
      ORDER BY p.post_title ASC
    `)

    console.log(`📋 Found ${posts.length} directory listings in WordPress\n`)

    if (posts.length === 0) {
      console.log('⚠️  No listings found. Make sure:')
      console.log('   1. WordPress database credentials are correct')
      console.log('   2. The sullys-directory plugin has created listings')
      return
    }

    let imported = 0
    let skipped = 0
    let errors = 0

    for (const post of posts) {
      try {
        // Get post meta
        const [meta] = await connection.execute(
          'SELECT meta_key, meta_value FROM wp_postmeta WHERE post_id = ?',
          [post.ID]
        )

        const metaData = {}
        meta.forEach(m => {
          metaData[m.meta_key] = m.meta_value
        })

        // Skip if no destination URL
        if (!metaData._destination_url) {
          console.log(`⏭️  Skipping "${post.post_title}" - no destination URL`)
          skipped++
          continue
        }

        // Skip if not published
        if (post.post_status !== 'publish') {
          console.log(`⏭️  Skipping "${post.post_title}" - status: ${post.post_status}`)
          skipped++
          continue
        }

        // Map category
        const wpCategory = metaData._directory_category || 'tools'
        const category = categoryMapping[wpCategory] || 'tools'

        // Map listing type
        const wpListingType = metaData._listing_type || 'free'
        const listingType = listingTypeMapping[wpListingType] || 'free'

        // Map status
        const wpStatus = metaData._listing_status || 'active'
        let status = 'active'
        if (wpStatus === 'expired') status = 'expired'
        if (wpStatus === 'grace_period') status = 'grace_period'
        if (post.post_status === 'draft') status = 'draft'

        // Generate redirect slug (use existing or create from post name)
        const redirectSlug = metaData._redirect_slug || post.post_name ||
          post.post_title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

        // Get logo URL (featured image)
        let logoUrl = null
        if (metaData._thumbnail_id) {
          const [thumbnail] = await connection.execute(
            'SELECT guid FROM wp_posts WHERE ID = ?',
            [metaData._thumbnail_id]
          )
          if (thumbnail.length > 0) {
            logoUrl = thumbnail[0].guid
          }
        }

        // Prepare resource data
        const resource = {
          name: post.post_title,
          slug: post.post_name || redirectSlug,
          category: category,
          short_description: metaData._short_description || null,
          full_description: metaData._full_description || null,
          destination_url: metaData._destination_url,
          redirect_slug: redirectSlug,
          logo_url: logoUrl,
          listing_type: listingType,
          monthly_fee: parseFloat(metaData._monthly_fee || 0),
          start_date: metaData._start_date || null,
          end_date: metaData._end_date || null,
          total_revenue: parseFloat(metaData._total_revenue || 0),
          status: status,
          display_order: parseInt(metaData._display_order || 999),
          created_at: post.post_date
        }

        // Insert into Supabase
        const { error } = await supabase
          .from('resources')
          .insert(resource)

        if (error) {
          // If duplicate slug, try with a suffix
          if (error.code === '23505') { // Unique violation
            resource.slug = `${resource.slug}-${post.ID}`
            resource.redirect_slug = `${resource.redirect_slug}-${post.ID}`

            const { error: retryError } = await supabase
              .from('resources')
              .insert(resource)

            if (retryError) {
              throw retryError
            }
          } else {
            throw error
          }
        }

        console.log(`✅ Imported: ${post.post_title} (${listingType} - ${category})`)
        imported++

      } catch (error) {
        console.error(`❌ Error importing "${post.post_title}":`, error.message)
        errors++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 Import Summary:')
    console.log(`   ✅ Imported: ${imported}`)
    console.log(`   ⏭️  Skipped: ${skipped}`)
    console.log(`   ❌ Errors: ${errors}`)
    console.log(`   📋 Total: ${posts.length}`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log('\n✅ Database connection closed')
    }
  }
}

// Run the import
importResources()
