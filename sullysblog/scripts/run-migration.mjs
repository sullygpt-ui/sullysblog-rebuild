import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Read .env.local
const envFile = readFileSync('.env.local', 'utf-8')
const env = {}
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim()
  }
})

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY
)

async function runMigration() {
  console.log('📊 Running resources migration...\n')

  try {
    // Read the migration file
    const migrationSQL = readFileSync(
      'supabase/migrations/20250101000004_create_resources.sql',
      'utf-8'
    )

    console.log('✅ Migration file loaded')
    console.log('🔄 Executing SQL...\n')

    // Note: Supabase JS client doesn't support raw SQL execution
    // We need to use the REST API directly
    const response = await fetch(
      `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify({ query: migrationSQL })
      }
    )

    if (!response.ok) {
      // If the RPC doesn't exist, we'll need to run it via SQL Editor manually
      console.log('❌ Cannot execute SQL directly via API')
      console.log('\n📋 Please run the migration manually:')
      console.log('\n1. Go to your Supabase Dashboard')
      console.log('2. Open SQL Editor')
      console.log('3. Copy the contents of: supabase/migrations/20250101000004_create_resources.sql')
      console.log('4. Paste and run in SQL Editor')
      console.log('\n💡 Or use Supabase CLI if you have it installed:')
      console.log('   npx supabase db push')
      process.exit(1)
    }

    const data = await response.json()
    console.log('✅ Migration executed successfully!')
    console.log('\n📊 Verifying tables...')

    // Verify the tables exist
    const { data: resources, error: resourcesError } = await supabase
      .from('resources')
      .select('count')
      .limit(0)

    const { data: clicks, error: clicksError } = await supabase
      .from('resource_clicks')
      .select('count')
      .limit(0)

    if (!resourcesError && !clicksError) {
      console.log('✅ Tables created successfully!')
      console.log('   - resources table: ✓')
      console.log('   - resource_clicks table: ✓')
      console.log('\n🎉 Migration complete!')
      console.log('\n💡 Next steps:')
      console.log('   1. Visit /admin/resources to add resources')
      console.log('   2. Or run: node scripts/import-resources.mjs (if importing from WordPress)')
    } else {
      console.log('⚠️  Could not verify tables')
      console.log('   Resources error:', resourcesError?.message)
      console.log('   Clicks error:', clicksError?.message)
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.log('\n📋 Please run the migration manually via Supabase Dashboard SQL Editor')
    process.exit(1)
  }
}

runMigration()
