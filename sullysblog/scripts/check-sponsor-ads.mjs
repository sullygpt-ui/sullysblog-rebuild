import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mqiolwqitoquzdrrwbpj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaW9sd3FpdG9xdXpkcnJ3YnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODA0ODgsImV4cCI6MjA4MjA1NjQ4OH0.CwV5jKFqSy6NzPCG6VcLL6PKXpyl_4KD1GSEe4qV9MU'
)

// Check for sponsor ads
const { data: sponsorAds, error, count } = await supabase
  .from('ads')
  .select('id, name, ad_zone, is_active')
  .in('ad_zone', ['home_sponsor_1', 'home_sponsor_2', 'home_sponsor_3', 'home_sponsor_4'])

if (error) {
  console.error('Error:', error)
} else {
  console.log('\nSponsor ads in database:', sponsorAds?.length || 0)
  console.log('\nAds:')
  sponsorAds?.forEach(ad => {
    console.log(`  - ${ad.name} (${ad.ad_zone}): ${ad.is_active ? 'ACTIVE' : 'inactive'}`)
  })

  const activeCount = sponsorAds?.filter(a => a.is_active).length || 0
  console.log(`\nActive sponsor ads: ${activeCount}`)
}
