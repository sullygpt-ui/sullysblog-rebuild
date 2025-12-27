import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'

const supabase = createClient(
  'https://mqiolwqitoquzdrrwbpj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaW9sd3FpdG9xdXpkcnJ3YnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODA0ODgsImV4cCI6MjA4MjA1NjQ4OH0.CwV5jKFqSy6NzPCG6VcLL6PKXpyl_4KD1GSEe4qV9MU'
)

console.log('🔄 Generating redirects from WordPress URLs...\n')

//Fetch all posts
const { data: posts } = await supabase
  .from('posts')
  .select('slug')
  .eq('status', 'published')
  .order('slug')

// Fetch all categories
const { data: categories } = await supabase
  .from('categories')
  .select('slug')
  .order('slug')

// Fetch all dictionary terms
const { data: terms } = await supabase
  .from('dictionary_terms')
  .select('slug')
  .order('slug')

const redirects = []

// Post redirects (WordPress used trailing slashes)
console.log(`📝 Found ${posts?.length || 0} posts`)
for (const post of posts || []) {
  redirects.push({
    source: `/${post.slug}/`,
    destination: `/${post.slug}`,
    permanent: true
  })
}

// Category redirects (WordPress may have used /category/ prefix)
console.log(`📂 Found ${categories?.length || 0} categories`)
for (const category of categories || []) {
  // Redirect old WordPress category URLs with trailing slash
  redirects.push({
    source: `/category/${category.slug}/`,
    destination: `/category/${category.slug}`,
    permanent: true
  })
}

// Dictionary term redirects
console.log(`📖 Found ${terms?.length || 0} dictionary terms`)
for (const term of terms || []) {
  redirects.push({
    source: `/domain-name-dictionary/${term.slug}/`,
    destination: `/domain-name-dictionary/${term.slug}`,
    permanent: true
  })
}

// Common WordPress URLs that should redirect
const commonRedirects = [
  // WordPress admin URLs
  { source: '/wp-admin/:path*', destination: '/admin', permanent: true },
  { source: '/wp-login.php', destination: '/', permanent: true },

  // WordPress feeds
  { source: '/feed/', destination: '/rss.xml', permanent: true },
  { source: '/feed', destination: '/rss.xml', permanent: true },
  { source: '/comments/feed/', destination: '/rss.xml', permanent: true },

  // Category feed redirects
  { source: '/category/:slug/feed/', destination: '/category/:slug', permanent: true },
  { source: '/category/:slug/feed', destination: '/category/:slug', permanent: true },

  // Page redirects
  { source: '/page/:path*/', destination: '/:path*', permanent: true },

  // Date-based archive redirects (if WordPress used them)
  { source: '/:year(\\d{4})/:month(\\d{2})/:slug/', destination: '/:slug', permanent: true },
  { source: '/:year(\\d{4})/:month(\\d{2})/:slug', destination: '/:slug', permanent: true },
]

redirects.push(...commonRedirects)

console.log(`\n✅ Generated ${redirects.length} total redirects`)

// Write to JSON file for review
await fs.writeFile(
  './redirects.json',
  JSON.stringify(redirects, null, 2)
)

console.log('📄 Redirects saved to redirects.json')

// Generate Next.js config format
const nextConfigRedirects = `
  // Auto-generated redirects from WordPress migration
  async redirects() {
    return ${JSON.stringify(redirects, null, 6)}
  },
`

await fs.writeFile(
  './redirects-nextjs.txt',
  nextConfigRedirects
)

console.log('📄 Next.js config format saved to redirects-nextjs.txt')
console.log('\n✨ Done! Review the files and add to next.config.js')
