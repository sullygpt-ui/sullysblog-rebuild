import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mqiolwqitoquzdrrwbpj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaW9sd3FpdG9xdXpkcnJ3YnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODA0ODgsImV4cCI6MjA4MjA1NjQ4OH0.CwV5jKFqSy6NzPCG6VcLL6PKXpyl_4KD1GSEe4qV9MU'
)

// Fetch first 12 posts (first page)
const { data: posts, error } = await supabase
  .from('posts')
  .select('id, title, slug, featured_image_url')
  .eq('status', 'published')
  .order('published_at', { ascending: false })
  .range(0, 11)

if (error) {
  console.error('Error:', error)
} else {
  console.log('\n📋 First 12 posts on /blog page (what should render):\n')
  posts.forEach((post, index) => {
    console.log(`${index + 1}. "${post.title}"`)
    console.log(`   → URL should be: /${post.slug}`)
    console.log(`   → ID: ${post.id}`)
    console.log(`   → Has Image: ${post.featured_image_url ? 'Yes' : 'No'}`)
    console.log('')
  })

  console.log('\n🔍 Checking for duplicate slugs in first 12:')
  const slugs = posts.map(p => p.slug)
  const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index)
  if (duplicates.length > 0) {
    console.log('⚠️  FOUND DUPLICATE SLUGS:', duplicates)
  } else {
    console.log('✓ No duplicate slugs found')
  }
}
