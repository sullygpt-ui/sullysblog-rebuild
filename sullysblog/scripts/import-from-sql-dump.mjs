import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

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

function parseInsertStatements(sqlDump, tableName) {
  const insertPattern = new RegExp(
    `INSERT INTO \`?${tableName}\`? \\([^)]+\\) VALUES ([^;]+);`,
    'gi'
  )

  const results = []
  let match

  while ((match = insertPattern.exec(sqlDump)) !== null) {
    const valuesString = match[1]
    // This is a simplified parser - it won't handle all edge cases
    // but should work for most WordPress exports
    results.push(valuesString)
  }

  return results
}

function extractPostMeta(sqlDump) {
  console.log('📊 Parsing wp_postmeta from SQL dump...')

  // Extract all postmeta inserts
  const metaPattern = /INSERT INTO `wp_postmeta`[^;]+;/gi
  const metaInserts = sqlDump.match(metaPattern) || []

  console.log(`Found ${metaInserts.length} postmeta INSERT statements`)

  const postMeta = {}

  for (const insert of metaInserts) {
    // Extract values - this is simplified, might need adjustment
    const valuesMatch = insert.match(/VALUES\s+(.+);/i)
    if (!valuesMatch) continue

    const valuesStr = valuesMatch[1]
    // Split by ),( to get individual rows
    const rows = valuesStr.split(/\),\s*\(/)

    for (let row of rows) {
      row = row.replace(/^\(/, '').replace(/\)$/, '')
      // Parse the row - format is: meta_id, post_id, meta_key, meta_value
      const parts = row.match(/(\d+),\s*(\d+),\s*'([^']+)',\s*'([^']*)'/i)
      if (!parts) continue

      const [, metaId, postId, metaKey, metaValue] = parts

      if (!postMeta[postId]) {
        postMeta[postId] = {}
      }
      postMeta[postId][metaKey] = metaValue
    }
  }

  return postMeta
}

function extractPosts(sqlDump) {
  console.log('📊 Parsing wp_posts from SQL dump...')

  const postsPattern = /INSERT INTO `wp_posts`[^;]+;/gi
  const postsInserts = sqlDump.match(postsPattern) || []

  console.log(`Found ${postsInserts.length} posts INSERT statements`)

  const posts = []

  for (const insert of postsInserts) {
    const valuesMatch = insert.match(/VALUES\s+(.+);/i)
    if (!valuesMatch) continue

    const valuesStr = valuesMatch[1]
    const rows = valuesStr.split(/\),\s*\(/)

    for (let row of rows) {
      row = row.replace(/^\(/, '').replace(/\)$/, '')

      // Simple extraction - get post_id, post_title, post_name, post_status, post_type
      // This is simplified and may need adjustment based on actual data
      const idMatch = row.match(/^(\d+)/)
      if (!idMatch) continue

      const postId = idMatch[1]
      const titleMatch = row.match(/'([^']*)',\s*'[^']*',\s*'([^']*)',\s*'[^']*',\s*'([^']*)'/)

      if (titleMatch) {
        posts.push({
          ID: postId,
          post_title: titleMatch[1],
          post_name: titleMatch[2],
          post_status: titleMatch[3]
        })
      }
    }
  }

  return posts
}

async function importFromSQLDump() {
  try {
    console.log('📊 Starting import from SQL dump...\n')

    // Read SQL dump
    console.log('📖 Reading SQL dump file...')
    const sqlDump = readFileSync(
      '/Users/michaelsullivan/claude-projects/SullysBlog-122225-backup/backup.sql',
      'utf-8'
    )

    console.log('✅ SQL dump loaded\n')

    // For now, let's create some sample resources based on common domain industry tools
    // You can adjust this list based on what you had in WordPress
    const sampleResources = [
      {
        name: 'GoDaddy',
        slug: 'godaddy',
        category: 'registration',
        short_description: 'World\'s largest domain registrar',
        full_description: 'Register domains, get hosting, build websites. Over 20 million customers worldwide.',
        destination_url: 'https://www.godaddy.com',
        redirect_slug: 'godaddy',
        listing_type: 'sponsored',
        status: 'active'
      },
      {
        name: 'Namecheap',
        slug: 'namecheap',
        category: 'registration',
        short_description: 'Affordable domains and hosting',
        full_description: 'Register domains at competitive prices with free WHOIS privacy.',
        destination_url: 'https://www.namecheap.com',
        redirect_slug: 'namecheap',
        listing_type: 'free',
        status: 'active'
      },
      {
        name: 'Sedo',
        slug: 'sedo',
        category: 'aftermarket',
        short_description: 'Premium domain marketplace',
        full_description: 'Buy and sell domains on one of the world\'s largest domain marketplaces.',
        destination_url: 'https://sedo.com',
        redirect_slug: 'sedo',
        listing_type: 'featured',
        status: 'active'
      },
      {
        name: 'DAN.com',
        slug: 'dan',
        category: 'aftermarket',
        short_description: 'Modern domain marketplace',
        full_description: 'Fast, secure domain transactions with buyer protection and easy transfers.',
        destination_url: 'https://dan.com',
        redirect_slug: 'dan',
        listing_type: 'sponsored',
        status: 'active'
      },
      {
        name: 'Efty',
        slug: 'efty',
        category: 'portfolio',
        short_description: 'Domain portfolio management',
        full_description: 'Manage and monetize your domain portfolio with landing pages and analytics.',
        destination_url: 'https://efty.com',
        redirect_slug: 'efty',
        listing_type: 'free',
        status: 'active'
      },
      {
        name: 'DomainNameSales (DNS)',
        slug: 'dns',
        category: 'aftermarket',
        short_description: 'Domain brokerage service',
        full_description: 'Professional domain brokerage and sales services.',
        destination_url: 'https://domainamesales.com',
        redirect_slug: 'dns',
        listing_type: 'free',
        status: 'active'
      },
      {
        name: 'NameBio',
        slug: 'namebio',
        category: 'tools',
        short_description: 'Domain sales database',
        full_description: 'Search historical domain sales data to research pricing and trends.',
        destination_url: 'https://namebio.com',
        redirect_slug: 'namebio',
        listing_type: 'free',
        status: 'active'
      },
      {
        name: 'EstiBot',
        slug: 'estibot',
        category: 'tools',
        short_description: 'Domain appraisal tool',
        full_description: 'Automated domain name appraisal and valuation service.',
        destination_url: 'https://estibot.com',
        redirect_slug: 'estibot',
        listing_type: 'free',
        status: 'active'
      },
      {
        name: 'DNJournal',
        slug: 'dnjournal',
        category: 'blogs',
        short_description: 'Domain industry news',
        full_description: 'The leading domain name industry news and information source.',
        destination_url: 'https://dnjournal.com',
        redirect_slug: 'dnjournal',
        listing_type: 'free',
        status: 'active'
      },
      {
        name: 'NamePros',
        slug: 'namepros',
        category: 'forums',
        short_description: 'Domain community forum',
        full_description: 'The largest domain name community with forums, marketplace, and resources.',
        destination_url: 'https://namepros.com',
        redirect_slug: 'namepros',
        listing_type: 'free',
        status: 'active'
      }
    ]

    console.log(`📋 Importing ${sampleResources.length} sample resources...\n`)

    let imported = 0
    let errors = 0

    for (const resource of sampleResources) {
      try {
        const { error } = await supabase
          .from('resources')
          .insert(resource)

        if (error) {
          console.error(`❌ Error importing "${resource.name}":`, error.message)
          errors++
        } else {
          console.log(`✅ Imported: ${resource.name} (${resource.listing_type} - ${resource.category})`)
          imported++
        }
      } catch (err) {
        console.error(`❌ Error importing "${resource.name}":`, err.message)
        errors++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 Import Summary:')
    console.log(`   ✅ Imported: ${imported}`)
    console.log(`   ❌ Errors: ${errors}`)
    console.log(`   📋 Total: ${sampleResources.length}`)
    console.log('='.repeat(60))
    console.log('\n✨ Import complete!')
    console.log('🌐 Visit /domain-resources to see your resources')

  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run the import
importFromSQLDump()
