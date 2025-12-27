import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'

const supabase = createClient(
  'https://mqiolwqitoquzdrrwbpj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaW9sd3FpdG9xdXpkcnJ3YnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ4MDQ4OCwiZXhwIjoyMDgyMDU2NDg4fQ.pfRKSrqadQOfr1GTUVfo4CHJBUIm8UfbVmSaKEnYdSk'
)

console.log('🚀 Creating ads tables...\n')

// Create ads table
console.log('Creating ads table...')
const { error: adsError } = await supabase.from('ads').select('*').limit(1)
if (adsError && adsError.message.includes('does not exist')) {
  console.log('✅ Need to create ads table - please run the SQL manually in Supabase dashboard')
  console.log('📄 Migration file: supabase/migrations/004_create_ads_tables.sql')
} else if (adsError) {
  console.log('Error:', adsError)
} else {
  console.log('✅ ads table already exists')
}
