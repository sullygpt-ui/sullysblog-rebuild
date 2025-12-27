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

async function createTestAd() {
  const { data, error } = await supabase
    .from('ads')
    .insert({
      name: 'Test Header Banner - TEMPORARY',
      ad_zone: 'header_banner',
      ad_type: 'image',
      content: 'https://placehold.co/728x90/0070ba/white?text=Header+Banner+728x90',
      priority: 1,
      is_active: true
    })
    .select()

  if (error) {
    console.error('Error:', error)
    process.exit(1)
  } else {
    console.log('✅ Test ad created successfully!')
    console.log('ID:', data[0].id)
    console.log('Zone:', data[0].zone)
    console.log('To remove: DELETE FROM ads WHERE id =', data[0].id)
  }
}

createTestAd()
