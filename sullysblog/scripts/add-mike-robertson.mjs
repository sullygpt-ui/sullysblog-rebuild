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

async function addResource() {
  const resource = {
    name: 'Mike Robertson',
    slug: 'mike-robertson',
    category: 'brokers',
    destination_url: 'https://www.mikerobertson.com.au',
    redirect_slug: 'mike-robertson',
    listing_type: 'free',
    monthly_fee: 0,
    status: 'active',
    display_order: 0,
    short_description: 'Australian domain broker with 20+ years experience. Former Director at Directnic and co-founder of Domain Guardians. Specializes in acquisitions, sales, and portfolio management with multiple 7-figure sales.'
  }

  const { data, error } = await supabase
    .from('resources')
    .insert(resource)
    .select()
    .single()

  if (error) {
    console.error('❌ Error adding resource:', error.message)
    process.exit(1)
  }

  console.log('✅ Successfully added Mike Robertson to Brokers!')
  console.log('   ID:', data.id)
  console.log('   Name:', data.name)
  console.log('   Category:', data.category)
  console.log('   URL:', data.destination_url)
}

addResource()
