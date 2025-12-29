import { createAdminClient } from '@/lib/supabase/admin'

export type AdReportData = {
  id: string
  name: string
  ad_zone: string
  impressions: number
  clicks: number
  ctr: string
}

export type ResourceReportData = {
  id: string
  name: string
  category: string
  listing_type: string
  impressions: number
  clicks: number
  ctr: string
}

export async function getAdReportData(startDate: string, endDate: string): Promise<AdReportData[]> {
  const supabase = createAdminClient()

  // Fetch all ads
  const { data: ads } = await supabase
    .from('ads')
    .select('id, name, ad_zone')
    .order('name')

  if (!ads) return []

  // For each ad, count impressions and clicks within date range
  const results = await Promise.all(
    ads.map(async (ad) => {
      const [impressionsResult, clicksResult] = await Promise.all([
        supabase
          .from('ad_impressions')
          .select('*', { count: 'exact', head: true })
          .eq('ad_id', ad.id)
          .gte('viewed_at', startDate)
          .lte('viewed_at', endDate),
        supabase
          .from('ad_clicks')
          .select('*', { count: 'exact', head: true })
          .eq('ad_id', ad.id)
          .gte('clicked_at', startDate)
          .lte('clicked_at', endDate),
      ])

      const impressions = impressionsResult.count || 0
      const clicks = clicksResult.count || 0
      const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00'

      return {
        id: ad.id,
        name: ad.name,
        ad_zone: ad.ad_zone,
        impressions,
        clicks,
        ctr,
      }
    })
  )

  return results
}

export async function getResourceReportData(startDate: string, endDate: string): Promise<ResourceReportData[]> {
  const supabase = createAdminClient()

  // Fetch all resources
  const { data: resources } = await supabase
    .from('resources')
    .select('id, name, category, listing_type')
    .order('name')

  if (!resources) return []

  // For each resource, count impressions and clicks within date range
  const results = await Promise.all(
    resources.map(async (resource) => {
      const [impressionsResult, clicksResult] = await Promise.all([
        supabase
          .from('resource_impressions')
          .select('*', { count: 'exact', head: true })
          .eq('resource_id', resource.id)
          .gte('viewed_at', startDate)
          .lte('viewed_at', endDate),
        supabase
          .from('resource_clicks')
          .select('*', { count: 'exact', head: true })
          .eq('resource_id', resource.id)
          .gte('clicked_at', startDate)
          .lte('clicked_at', endDate),
      ])

      const impressions = impressionsResult.count || 0
      const clicks = clicksResult.count || 0
      const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00'

      return {
        id: resource.id,
        name: resource.name,
        category: resource.category,
        listing_type: resource.listing_type,
        impressions,
        clicks,
        ctr,
      }
    })
  )

  return results
}
