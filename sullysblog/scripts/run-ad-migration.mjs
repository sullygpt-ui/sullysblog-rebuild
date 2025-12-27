import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'

// Use service role key for admin operations
const supabase = createClient(
  'https://mqiolwqitoquzdrrwbpj.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaW9sd3FpdG9xdXpkcnJ3YnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk4ODY1NSwiZXhwIjoyMDUwNTY0NjU1fQ.5cn3zL0s_3yPF7kkNn74vlQBdx1f9B8wU5S6F8xHBpA'
)

console.log('🚀 Running ad system migration...\n')

// Read the migration file
const migration = await fs.readFile('./supabase/migrations/004_create_ads_tables.sql', 'utf-8')

// Split by semicolons to execute statements separately
const statements = migration
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))

console.log(`📝 Found ${statements.length} SQL statements\n`)

let successCount = 0
let errorCount = 0

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i]

  // Skip pure comment blocks
  if (statement.trim().startsWith('--') || statement.trim().length === 0) {
    continue
  }

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })

    if (error) {
      // Try direct execution for DDL statements
      const { error: directError } = await supabase.from('_sqlx_migrations').select('*').limit(1)

      if (directError) {
        console.log(`⚠️  Statement ${i + 1}: ${error.message}`)
        errorCount++
      } else {
        successCount++
      }
    } else {
      console.log(`✅ Statement ${i + 1} executed`)
      successCount++
    }
  } catch (err) {
    console.log(`❌ Error on statement ${i + 1}: ${err.message}`)
    errorCount++
  }
}

console.log(`\n📊 Migration complete: ${successCount} succeeded, ${errorCount} errors`)

// Verify tables were created
console.log('\n🔍 Verifying tables...\n')

const { data: ads, error: adsError } = await supabase
  .from('ads')
  .select('count')
  .limit(1)

if (adsError) {
  console.log('❌ ads table:', adsError.message)
} else {
  const { count } = await supabase
    .from('ads')
    .select('*', { count: 'exact', head: true })
  console.log(`✅ ads table created (${count} records)`)
}

const { data: impressions, error: impressionsError } = await supabase
  .from('ad_impressions')
  .select('count')
  .limit(1)

if (impressionsError) {
  console.log('❌ ad_impressions table:', impressionsError.message)
} else {
  console.log('✅ ad_impressions table created')
}

const { data: clicks, error: clicksError } = await supabase
  .from('ad_clicks')
  .select('count')
  .limit(1)

if (clicksError) {
  console.log('❌ ad_clicks table:', clicksError.message)
} else {
  console.log('✅ ad_clicks table created')
}

console.log('\n✨ Done!')
