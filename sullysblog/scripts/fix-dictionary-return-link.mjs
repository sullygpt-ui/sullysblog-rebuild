import { createClient } from '@supabase/supabase-js'

// Use anon key for checking; for --fix, set SUPABASE_SERVICE_KEY env var
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

console.log(`\n📚 Checking ${terms.length} dictionary terms for "Return to Domain Name Dictionary" link...\n`)

// Function to check for the return link pattern
const hasReturnLink = (text) => {
  if (!text) return false
  return text.includes('Return to Domain Name Dictionary')
}

// Find terms with the link
const affectedTerms = terms.filter(term => {
  return hasReturnLink(term.short_definition) || hasReturnLink(term.full_definition)
})

if (affectedTerms.length === 0) {
  console.log('✅ No terms found with "Return to Domain Name Dictionary" link!\n')
  process.exit(0)
}

console.log(`🔍 Found ${affectedTerms.length} terms with the link:\n`)

affectedTerms.forEach((term, index) => {
  console.log(`${index + 1}. ${term.term}`)
})

// Check for --fix flag
if (process.argv.includes('--fix')) {
  console.log('\n🔧 Removing the links from definitions...\n')

  for (const term of affectedTerms) {
    // Remove the entire WordPress button block containing the Return link
    // The block looks like:
    // <!-- wp:buttons -->
    // <div class="wp-block-buttons"><!-- wp:button ... -->
    // <div class="wp-block-button ..."><a ... href="...domain-name-dictionary">Return to Domain Name Dictionary</a></div>
    // <!-- /wp:button --></div>
    // <!-- /wp:buttons -->

    const cleanText = (text) => {
      if (!text) return text

      return text
        // Remove the entire wp:buttons block containing the return link
        .replace(/<!-- wp:buttons[^>]*-->[\s\S]*?Return to Domain Name Dictionary[\s\S]*?<!-- \/wp:buttons -->/gi, '')
        // Also try simpler pattern in case structure varies
        .replace(/<div[^>]*class="[^"]*wp-block-buttons[^"]*"[^>]*>[\s\S]*?Return to Domain Name Dictionary[\s\S]*?<\/div>\s*<\/div>/gi, '')
        // Remove any remaining wp-block divs with the link
        .replace(/<div[^>]*>[\s\S]*?Return to Domain Name Dictionary[\s\S]*?<\/div>\s*<\/div>/gi, '')
        // Remove plain text "Return to Domain Name Dictionary" with surrounding whitespace
        .replace(/\s*Return to Domain Name Dictionary\s*/gi, '')
        // Clean up excessive newlines
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    }

    const cleanShortDef = cleanText(term.short_definition)
    const cleanFullDef = cleanText(term.full_definition)

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

  console.log('\n✨ Done removing the links!\n')
} else {
  console.log('\n💡 Run with --fix flag to remove the links:')
  console.log('   source .env.local && node scripts/fix-dictionary-return-link.mjs --fix\n')
}
