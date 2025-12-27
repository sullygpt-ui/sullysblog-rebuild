import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mqiolwqitoquzdrrwbpj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaW9sd3FpdG9xdXpkcnJ3YnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODA0ODgsImV4cCI6MjA4MjA1NjQ4OH0.CwV5jKFqSy6NzPCG6VcLL6PKXpyl_4KD1GSEe4qV9MU'
)

// Fetch all categories with post counts
const { data: categories } = await supabase
  .from('categories')
  .select('*')
  .order('name')

console.log('\n📂 Categories:\n')

for (const cat of categories || []) {
  // Count posts
  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', cat.id)
    .eq('status', 'published')

  console.log(`${cat.name}`)
  console.log(`   Slug: ${cat.slug}`)
  console.log(`   Posts: ${count || 0}`)
  console.log(`   URL: /category/${cat.slug}`)
  console.log()
}
