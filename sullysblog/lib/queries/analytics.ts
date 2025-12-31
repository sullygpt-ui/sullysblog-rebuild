import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for analytics to bypass RLS
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
}

export type AnalyticsData = {
  totalResources: number
  totalClicks: number
  featuredCount: number
  sponsoredCount: number
  freeCount: number
  monthlyRevenue: number
  annualRevenue: number
  topResources: Array<{
    name: string
    clicks: number
    category: string
    listing_type: string
  }>
  clicksByDay: Array<{
    date: string
    clicks: number
  }>
  clicksByCategory: Array<{
    category: string
    clicks: number
  }>
  revenueByMonth: Array<{
    month: string
    revenue: number
  }>
}

export async function getAnalyticsData(days: number = 30): Promise<AnalyticsData> {
  // Use service role to bypass RLS for analytics reads
  const supabase = getServiceClient()

  // Get all resources
  const { data: resources } = await supabase
    .from('resources')
    .select('*')

  const totalResources = resources?.length || 0
  const featuredCount = resources?.filter(r => r.listing_type === 'featured').length || 0
  const sponsoredCount = resources?.filter(r => r.listing_type === 'sponsored').length || 0
  const freeCount = resources?.filter(r => r.listing_type === 'free').length || 0

  // Calculate revenue
  const monthlyRevenue = resources
    ?.filter(r => r.status === 'active' && (r.listing_type === 'featured' || r.listing_type === 'sponsored'))
    .reduce((sum, r) => sum + (r.monthly_fee || 0), 0) || 0

  const annualRevenue = monthlyRevenue * 12

  // Get clicks from past N days
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const { data: clicks } = await supabase
    .from('resource_clicks')
    .select('*, resources!resource_clicks_resource_id_fkey(name, category, listing_type)')
    .gte('clicked_at', cutoffDate.toISOString())
    .order('clicked_at', { ascending: true })

  const totalClicks = clicks?.length || 0

  // Top resources by clicks
  const resourceClickCounts: Record<string, { name: string; clicks: number; category: string; listing_type: string }> = {}

  clicks?.forEach(click => {
    const resource = click.resources as any
    if (resource && click.resource_id) {
      if (!resourceClickCounts[click.resource_id]) {
        resourceClickCounts[click.resource_id] = {
          name: resource.name,
          clicks: 0,
          category: resource.category,
          listing_type: resource.listing_type
        }
      }
      resourceClickCounts[click.resource_id].clicks++
    }
  })

  const topResources = Object.values(resourceClickCounts)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10)

  // Clicks by day
  const clicksByDayMap: Record<string, number> = {}
  clicks?.forEach(click => {
    const date = new Date(click.clicked_at).toLocaleDateString('en-US')
    clicksByDayMap[date] = (clicksByDayMap[date] || 0) + 1
  })

  const clicksByDay = Object.entries(clicksByDayMap)
    .map(([date, clicks]) => ({ date, clicks }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Clicks by category
  const clicksByCategoryMap: Record<string, number> = {}
  clicks?.forEach(click => {
    const resource = click.resources as any
    if (resource) {
      const category = resource.category
      clicksByCategoryMap[category] = (clicksByCategoryMap[category] || 0) + 1
    }
  })

  const clicksByCategory = Object.entries(clicksByCategoryMap)
    .map(([category, clicks]) => ({ category, clicks }))
    .sort((a, b) => b.clicks - a.clicks)

  // Revenue by month (for past year)
  const revenueByMonth: Array<{ month: string; revenue: number }> = []
  for (let i = 11; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

    // Calculate revenue for that month (simplified - assumes current active sponsors)
    revenueByMonth.push({
      month: monthName,
      revenue: monthlyRevenue // In a real system, you'd track historical revenue
    })
  }

  return {
    totalResources,
    totalClicks,
    featuredCount,
    sponsoredCount,
    freeCount,
    monthlyRevenue,
    annualRevenue,
    topResources,
    clicksByDay,
    clicksByCategory,
    revenueByMonth
  }
}
