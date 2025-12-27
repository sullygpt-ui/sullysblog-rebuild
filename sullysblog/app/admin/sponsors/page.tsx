import { createClient } from '@/lib/supabase/server'
import { SponsorsManager } from '@/components/admin/SponsorsManager'

export const metadata = {
  title: 'Sponsors | Admin',
  description: 'Manage sponsorships and view sponsor analytics',
}

export default async function AdminSponsorsPage() {
  const supabase = await createClient()

  // Get all sponsored and featured resources
  const { data: sponsors } = await supabase
    .from('resources')
    .select('*')
    .in('listing_type', ['sponsored', 'featured'])
    .order('listing_type', { ascending: false })
    .order('name', { ascending: true })

  // Get click stats for each sponsor
  const sponsorsWithStats = await Promise.all(
    (sponsors || []).map(async (sponsor) => {
      // Total clicks
      const { count: totalClicks } = await supabase
        .from('resource_clicks')
        .select('*', { count: 'exact', head: true })
        .eq('resource_id', sponsor.id)

      // Clicks last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: recentClicks } = await supabase
        .from('resource_clicks')
        .select('*', { count: 'exact', head: true })
        .eq('resource_id', sponsor.id)
        .gte('clicked_at', thirtyDaysAgo.toISOString())

      // Calculate days until expiration
      let daysUntilExpiration = null
      if (sponsor.end_date) {
        const endDate = new Date(sponsor.end_date)
        const now = new Date()
        const diffTime = endDate.getTime() - now.getTime()
        daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }

      return {
        ...sponsor,
        totalClicks: totalClicks || 0,
        recentClicks: recentClicks || 0,
        daysUntilExpiration
      }
    })
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Sponsor Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all active sponsors and their performance
        </p>
      </div>

      <SponsorsManager sponsors={sponsorsWithStats} />
    </div>
  )
}
