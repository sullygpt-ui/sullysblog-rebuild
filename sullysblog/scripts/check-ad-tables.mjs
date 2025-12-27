import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mqiolwqitoquzdrrwbpj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaW9sd3FpdG9xdXpkcnJ3YnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ4MDQ4OCwiZXhwIjoyMDgyMDU2NDg4fQ.pfRKSrqadQOfr1GTUVfo4CHJBUIm8UfbVmSaKEnYdSk'
)

console.log('🔍 Checking for ad-related tables...\n')

const tables = ['ads', 'ad_impressions', 'ad_clicks']

for (const table of tables) {
  const { data, error } = await supabase.from(table).select('*').limit(1)
  if (error) {
    console.log(`❌ ${table}: ${error.message}`)
  } else {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
    console.log(`✅ ${table}: exists (${count || 0} records)`)

    // Show sample data if exists
    if (count > 0 && table === 'ads') {
      const { data: ads } = await supabase.from('ads').select('name, ad_zone, is_active').limit(3)
      console.log('   Sample ads:')
      ads.forEach(ad => console.log(`   - ${ad.name} (${ad.ad_zone}) - ${ad.is_active ? 'Active' : 'Inactive'}`))
    }
  }
}
