import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mqiolwqitoquzdrrwbpj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaW9sd3FpdG9xdXpkcnJ3YnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODA0ODgsImV4cCI6MjA4MjA1NjQ4OH0.CwV5jKFqSy6NzPCG6VcLL6PKXpyl_4KD1GSEe4qV9MU'
)

// Fetch all published posts
const { data: posts, error } = await supabase
  .from('posts')
  .select('id, title, slug, featured_image_url, published_at')
  .eq('status', 'published')
  .order('published_at', { ascending: false })

if (error) {
  console.error('Error:', error)
} else {
  console.log(`\nFound ${posts.length} published posts:\n`)
  posts.forEach((post, index) => {
    console.log(`${index + 1}. "${post.title.substring(0, 60)}"`)
    console.log(`   Slug: ${post.slug}`)
    console.log(`   ID: ${post.id}`)
    console.log(`   Featured Image: ${post.featured_image_url || 'NONE'}`)
    console.log(`   Published: ${post.published_at}`)
    console.log('')
  })
}
