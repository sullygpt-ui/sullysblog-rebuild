import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mqiolwqitoquzdrrwbpj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaW9sd3FpdG9xdXpkcnJ3YnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ4MDQ4OCwiZXhwIjoyMDgyMDU2NDg4fQ.pfRKSrqadQOfr1GTUVfo4CHJBUIm8UfbVmSaKEnYdSk'
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

console.log(`\n📚 Checking ${terms.length} dictionary terms for escaped quotes...\n`)

// Find terms with escaped quotes
const affectedTerms = terms.filter(term => {
  const shortDef = term.short_definition || ''
  const fullDef = term.full_definition || ''
  return shortDef.includes('\\"') || fullDef.includes('\\"')
})

if (affectedTerms.length === 0) {
  console.log('✅ No terms found with escaped quotes!\n')
  process.exit(0)
}

console.log(`🔍 Found ${affectedTerms.length} terms with escaped quotes:\n`)

affectedTerms.forEach((term, index) => {
  console.log(`${index + 1}. ${term.term}`)
})

// Check for --fix flag
if (process.argv.includes('--fix')) {
  console.log('\n🔧 Fixing escaped quotes...\n')

  for (const term of affectedTerms) {
    const cleanShortDef = term.short_definition
      ? term.short_definition.replace(/\\"/g, '"')
      : term.short_definition

    const cleanFullDef = term.full_definition
      ? term.full_definition.replace(/\\"/g, '"')
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

  console.log('\n✨ Done fixing escaped quotes!\n')
} else {
  console.log('\n💡 Run with --fix flag to fix the escaped quotes:')
  console.log('   node scripts/fix-dictionary-quotes.mjs --fix\n')
}
