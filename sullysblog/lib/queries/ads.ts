import { createAdminClient } from '@/lib/supabase/admin'
import { unstable_noStore as noStore } from 'next/cache'

export type Ad = {
  id: string
  name: string
  ad_zone: string
  ad_type: string
  content: string
  link_url: string | null
  is_active: boolean
  start_date: string | null
  end_date: string | null
  priority: number
  width: number | null
  height: number | null
  created_at: string
  updated_at: string
}

/**
 * Get active ads for a specific zone
 */
export async function getAdsByZone(zone: string): Promise<Ad[]> {
  noStore() // Disable caching for ads - always fetch fresh data
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  // Query ads and filter by date in application code for reliable date handling
  const { data: ads, error } = await supabase
    .from('ads')
    .select('*')
    .eq('ad_zone', zone)
    .eq('is_active', true)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })

  if (error || !ads) {
    console.error('Error fetching ads:', error)
    return []
  }

  // Filter by start_date and end_date in application code
  const nowDate = new Date(now)
  return ads.filter(ad => {
    const startOk = !ad.start_date || new Date(ad.start_date) <= nowDate
    const endOk = !ad.end_date || new Date(ad.end_date) >= nowDate
    return startOk && endOk
  })
}

/**
 * Get a single random ad for a zone (for rotation)
 */
export async function getRandomAdByZone(zone: string): Promise<Ad | null> {
  const ads = await getAdsByZone(zone)

  if (ads.length === 0) {
    return null
  }

  // Weighted random selection based on priority
  const totalPriority = ads.reduce((sum, ad) => sum + (ad.priority || 1), 0)
  let random = Math.random() * totalPriority

  for (const ad of ads) {
    random -= (ad.priority || 1)
    if (random <= 0) {
      return ad
    }
  }

  return ads[0]
}

/**
 * Track an ad impression
 * Note: This is now handled by /api/ads/track-impression
 */
export async function trackAdImpression(
  adId: string,
  pageUrl: string,
  userAgent?: string
): Promise<void> {
  const supabase = createAdminClient()

  await supabase.from('ad_impressions').insert({
    ad_id: adId,
    page_url: pageUrl,
    user_agent: userAgent || null,
    ip_address: null
  })
}

/**
 * Track an ad click
 * Note: This is now handled by /api/ads/track-click
 */
export async function trackAdClick(
  adId: string,
  pageUrl: string,
  userAgent?: string
): Promise<void> {
  const supabase = createAdminClient()

  await supabase.from('ad_clicks').insert({
    ad_id: adId,
    page_url: pageUrl,
    user_agent: userAgent || null,
    ip_address: null
  })
}
