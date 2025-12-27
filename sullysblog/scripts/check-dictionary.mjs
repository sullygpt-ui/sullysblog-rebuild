import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mqiolwqitoquzdrrwbpj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaW9sd3FpdG9xdXpkcnJ3YnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODA0ODgsImV4cCI6MjA4MjA1NjQ4OH0.CwV5jKFqSy6NzPCG6VcLL6PKXpyl_4KD1GSEe4qV9MU'
)

// Fetch count of all dictionary terms
const { count, error: countError } = await supabase
  .from('dictionary_terms')
  .select('*', { count: 'exact', head: true })

if (countError) {
  console.error('Count Error:', countError)
} else {
  console.log(`\n📊 Total dictionary terms in database: ${count}\n`)
}

// Fetch all dictionary terms
const { data: terms, error } = await supabase
  .from('dictionary_terms')
  .select('term, slug, short_definition')
  .order('term', { ascending: true })

if (error) {
  console.error('Error:', error)
} else {
  console.log(`\n📚 Found ${terms.length} dictionary terms (showing first 10):\n`)
  terms.forEach((termData, index) => {
    console.log(`${index + 1}. ${termData.term}`)
    console.log(`   Slug: ${termData.slug}`)
    console.log(`   URL: /domain-name-dictionary/${termData.slug}`)
    if (termData.short_definition) {
      console.log(`   Definition: ${termData.short_definition.substring(0, 80)}...`)
    }
    console.log('')
  })
}
