import { createClient } from '@/lib/supabase/server'

export type Resource = {
  id: string
  name: string
  slug: string
  category: string
  short_description: string | null
  full_description: string | null
  destination_url: string
  redirect_slug: string
  logo_url: string | null
  listing_type: 'free' | 'sponsored' | 'featured'
  monthly_fee: number
  start_date: string | null
  end_date: string | null
  total_revenue: number
  status: 'active' | 'grace_period' | 'expired' | 'draft'
  display_order: number
  created_at: string
  updated_at: string
}

export type ResourcesByCategory = {
  [category: string]: {
    label: string
    icon: string
    listings: Resource[]
  }
}

// Categories (lookup - order doesn't matter here, display order is in page components)
const CATEGORY_INFO: Record<string, { label: string; icon: string }> = {
  'appraisal': { label: 'Appraisal & Valuation', icon: '📈' },
  'auctions': { label: 'Auctions', icon: '🔨' },
  'blogs': { label: 'Blogs', icon: '✍️' },
  'books': { label: 'Books', icon: '📚' },
  'brokers': { label: 'Brokers', icon: '🤝' },
  'aftermarket': { label: 'Buy / Sell Domains', icon: '💰' },
  'business': { label: 'Business Tools', icon: '💼' },
  'conferences': { label: 'Conferences & Events', icon: '📅' },
  'tools': { label: 'Domain Tools', icon: '🔧' },
  'escrow': { label: 'Escrow Services', icon: '🔒' },
  'expired': { label: 'Expired / Drops', icon: '⏰' },
  'forums': { label: 'Forums & Communities', icon: '💬' },
  'hosting': { label: 'Hosting & Parking', icon: '🅿️' },
  'legal': { label: 'Legal Resources', icon: '⚖️' },
  'marketplaces': { label: 'Marketplaces', icon: '🏪' },
  'news': { label: 'News', icon: '📰' },
  'newsletters': { label: 'Newsletters', icon: '📧' },
  'podcasts': { label: 'Podcasts', icon: '🎙️' },
  'portfolio': { label: 'Portfolio Management', icon: '📊' },
  'registration': { label: 'Registration', icon: '🌐' },
}

/**
 * Get all active resources grouped by category
 */
export async function getResourcesByCategory(): Promise<ResourcesByCategory> {
  const supabase = await createClient()

  const { data: resources, error } = await supabase
    .from('resources')
    .select('*')
    .in('status', ['active', 'grace_period'])
    .order('listing_type', { ascending: false }) // featured > sponsored > free
    .order('name', { ascending: true }) // alphabetical within each listing type

  if (error) {
    console.error('Error fetching resources:', error)
    return {}
  }

  if (!resources || resources.length === 0) {
    return {}
  }

  // Group by category
  const grouped: ResourcesByCategory = {}

  for (const resource of resources) {
    const category = resource.category

    if (!grouped[category]) {
      const info = CATEGORY_INFO[category] || { label: category, icon: '📁' }
      grouped[category] = {
        label: info.label,
        icon: info.icon,
        listings: []
      }
    }

    grouped[category].listings.push(resource as Resource)
  }

  return grouped
}

/**
 * Get a resource by redirect slug (for /go/ redirects)
 */
export async function getResourceByRedirectSlug(redirectSlug: string): Promise<Resource | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('redirect_slug', redirectSlug)
    .in('status', ['active', 'grace_period'])
    .single()

  if (error || !data) {
    return null
  }

  return data as Resource
}

/**
 * Get click stats for a resource
 */
export async function getResourceClickStats(resourceId: string, days: number = 30) {
  const supabase = await createClient()

  // Total clicks
  const { count: totalClicks } = await supabase
    .from('resource_clicks')
    .select('*', { count: 'exact', head: true })
    .eq('resource_id', resourceId)

  // Recent clicks (within period)
  const { count: recentClicks } = await supabase
    .from('resource_clicks')
    .select('*', { count: 'exact', head: true })
    .eq('resource_id', resourceId)
    .gte('clicked_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())

  // Last click
  const { data: lastClickData } = await supabase
    .from('resource_clicks')
    .select('clicked_at')
    .eq('resource_id', resourceId)
    .order('clicked_at', { ascending: false })
    .limit(1)
    .single()

  return {
    total: totalClicks || 0,
    recent: recentClicks || 0,
    lastClick: lastClickData?.clicked_at || null
  }
}

/**
 * Get all resources (for admin)
 */
export async function getAllResources(): Promise<Resource[]> {
  const supabase = await createClient()

  const { data: resources, error } = await supabase
    .from('resources')
    .select('*')
    .order('category', { ascending: true })
    .order('listing_type', { ascending: false }) // featured > sponsored > free
    .order('name', { ascending: true }) // alphabetical within each

  if (error) {
    console.error('Error fetching all resources:', error)
    return []
  }

  return (resources as Resource[]) || []
}

/**
 * Get top performing resources
 */
export async function getTopResources(limit: number = 10, days: number = 30) {
  const supabase = await createClient()

  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  // This is a simplified version - for better performance, you'd want to use a SQL view
  const { data: clicksData } = await supabase
    .from('resource_clicks')
    .select('resource_id')
    .gte('clicked_at', cutoffDate)

  if (!clicksData || clicksData.length === 0) {
    return []
  }

  // Count clicks per resource
  const clickCounts: Record<string, number> = {}
  for (const click of clicksData) {
    clickCounts[click.resource_id] = (clickCounts[click.resource_id] || 0) + 1
  }

  // Sort by click count
  const sorted = Object.entries(clickCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)

  // Fetch resource details
  const resourceIds = sorted.map(([id]) => id)
  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .in('id', resourceIds)

  if (!resources) {
    return []
  }

  // Match resources with click counts
  return sorted.map(([id, clicks]) => {
    const resource = resources.find(r => r.id === id)
    return {
      resource,
      clicks
    }
  }).filter(item => item.resource !== undefined)
}
