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

async function removeTestAd() {
  const { error } = await supabase
    .from('ads')
    .delete()
    .eq('name', 'Test Header Banner - TEMPORARY')

  if (error) {
    console.error('Error:', error)
    process.exit(1)
  } else {
    console.log('✅ Test banner removed successfully!')
  }
}

removeTestAd()
