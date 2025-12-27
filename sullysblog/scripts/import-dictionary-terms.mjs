import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Read .env.local
const envFile = readFileSync('.env.local', 'utf-8')
const env = {}
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim()
  }
})

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY // Use service key to bypass RLS
)

console.log('📚 Importing Dictionary Terms from WordPress Backup\n')

// Read the SQL file
const sql = readFileSync('/tmp/dictionary-insert.sql', 'utf-8')

// Extract each term record - pattern: (id,'term','slug',page_id,'definition','created','updated')
// We need to handle escaped quotes and complex HTML content
const terms = []
const pattern = /\((\d+),'([^']+)','([^']+)',(\d+),'((?:[^']|''|\\')*)','[^']+','[^']+'\)/g

let match
let count = 0

// Simple extraction - get term name and slug first
const simplePattern = /\((\d+),'([^']+)','([^']+)',(\d+),/g
while ((match = simplePattern.exec(sql)) !== null) {
  count++
  const [_, id, term, slug, pageId] = match

  // For full definition, we need to extract it differently
  // Find the start of this record and the next
  const recordStart = match.index
  const nextRecord = sql.indexOf(`,(${parseInt(id) + 1},`, recordStart)
  const recordEnd = nextRecord > -1 ? nextRecord : sql.indexOf(');', recordStart)

  let fullRecord = sql.substring(recordStart, recordEnd)

  // Extract the definition (5th field) - it's between the 4th and 5th comma
  // Skip first opening paren and 4 fields
  let fieldCount = 0
  let defStart = -1
  let inQuote = false

  for (let i = 1; i < fullRecord.length; i++) {
    if (fullRecord[i] === "'" && fullRecord[i-1] !== '\\') {
      inQuote = !inQuote
    }
    if (!inQuote && fullRecord[i] === ',') {
      fieldCount++
      if (fieldCount === 4) {
        defStart = i + 2 // Skip comma and opening quote
        break
      }
    }
  }

  let fullDefinition = ''
  if (defStart > -1) {
    // Find the closing quote of the definition
    let defEnd = -1
    inQuote = false
    for (let i = defStart; i < fullRecord.length; i++) {
      if (fullRecord[i] === "'" && fullRecord[i-1] !== '\\') {
        defEnd = i
        break
      }
    }
    if (defEnd > -1) {
      fullDefinition = fullRecord.substring(defStart, defEnd)
      // Unescape quotes
      fullDefinition = fullDefinition.replace(/\\'/g, "'").replace(/\\\\/g, '\\')
    }
  }

  // Create short definition from HTML
  let shortDef = fullDefinition
    .replace(/<[^>]+>/g, '') // Strip HTML
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .replace(/\\r\\n/g, ' ')  // Remove line breaks
    .trim()

  if (shortDef.length > 200) {
    shortDef = shortDef.substring(0, 197) + '...'
  }

  terms.push({
    term,
    slug,
    short_definition: shortDef || `${term} definition`,
    full_definition: fullDefinition || `<p>${term} definition coming soon.</p>`,
    wordpress_page_id: parseInt(pageId)
  })
}

console.log(`✅ Extracted ${terms.length} terms\n`)

// Show first few
console.log('📋 Sample terms:\n')
terms.slice(0, 5).forEach((t, i) => {
  console.log(`${i+1}. ${t.term}`)
  console.log(`   Slug: ${t.slug}`)
  console.log(`   Short: ${t.short_definition.substring(0, 60)}...`)
  console.log()
})

// Check which terms are new (not already in database)
const { data: existing } = await supabase
  .from('dictionary_terms')
  .select('term, slug')

const existingSlugs = new Set(existing?.map(t => t.slug) || [])
const existingTerms = new Set(existing?.map(t => t.term.toLowerCase()) || [])
const newTerms = terms.filter(t =>
  !existingSlugs.has(t.slug) && !existingTerms.has(t.term.toLowerCase())
)

console.log(`\n📊 Status:`)
console.log(`   Total terms in WordPress: ${terms.length}`)
console.log(`   Already in database: ${existingSlugs.size}`)
console.log(`   New terms to import: ${newTerms.length}\n`)

if (newTerms.length === 0) {
  console.log('✅ All terms already imported!')
  process.exit(0)
}

// Import new terms
console.log(`🚀 Importing ${newTerms.length} new terms...`)

const { data, error } = await supabase
  .from('dictionary_terms')
  .insert(newTerms)

if (error) {
  console.error('❌ Error importing:', error)
  process.exit(1)
}

console.log(`\n✅ Successfully imported ${newTerms.length} terms!`)
console.log(`\n📚 Dictionary now has ${terms.length} terms total`)
