import { createClient } from '@supabase/supabase-js'

// Use anon key for checking, service role key needed for --fix
const supabase = createClient(
  'https://mqiolwqitoquzdrrwbpj.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaW9sd3FpdG9xdXpkcnJ3YnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODA0ODgsImV4cCI6MjA4MjA1NjQ4OH0.CwV5jKFqSy6NzPCG6VcLL6PKXpyl_4KD1GSEe4qV9MU'
)

// Fetch all dictionary terms
const { data: terms, error } = await supabase
  .from('dictionary_terms')
  .select('id, term, short_definition, full_definition')
  .order('term', { ascending: true })

if (error) {
  console.error('Error fetching terms:', error)
  process.exit(1)
}

console.log(`\n📚 Checking ${terms.length} dictionary terms for formatting issues...\n`)

// Find terms with \r\n characters
const affectedTerms = terms.filter(term => {
  const shortDef = term.short_definition || ''
  const fullDef = term.full_definition || ''
  return shortDef.includes('\r\n') || fullDef.includes('\r\n') ||
         shortDef.includes('\\r\\n') || fullDef.includes('\\r\\n')
})

console.log(`\n🔍 Found ${affectedTerms.length} terms with \\r\\n characters:\n`)

affectedTerms.forEach((term, index) => {
  console.log(`${index + 1}. ${term.term}`)
  if (term.short_definition && (term.short_definition.includes('\r\n') || term.short_definition.includes('\\r\\n'))) {
    console.log(`   Short definition has \\r\\n`)
  }
  if (term.full_definition && (term.full_definition.includes('\r\n') || term.full_definition.includes('\\r\\n'))) {
    console.log(`   Full definition has \\r\\n`)
  }
})

// Check for --fix flag
if (process.argv.includes('--fix')) {
  console.log('\n🔧 Fixing formatting issues...\n')

  for (const term of affectedTerms) {
    // Clean up the definitions - replace \r\n with just \n, and literal \\r\\n with \n
    const cleanShortDef = term.short_definition
      ? term.short_definition.replace(/\\r\\n/g, '\n').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n')
      : term.short_definition

    const cleanFullDef = term.full_definition
      ? term.full_definition.replace(/\\r\\n/g, '\n').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n')
      : term.full_definition

    const { error: updateError } = await supabase
      .from('dictionary_terms')
      .update({
        short_definition: cleanShortDef,
        full_definition: cleanFullDef
      })
      .eq('id', term.id)

    if (updateError) {
      console.error(`❌ Error updating "${term.term}":`, updateError)
    } else {
      console.log(`✅ Fixed: ${term.term}`)
    }
  }

  console.log('\n✨ Done fixing formatting issues!\n')
} else {
  console.log('\n💡 Run with --fix flag to clean up these issues:')
  console.log('   source .env.local && node scripts/fix-dictionary-formatting.mjs --fix\n')
}
