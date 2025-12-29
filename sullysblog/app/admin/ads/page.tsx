import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { AdsTable } from '@/components/admin/AdsTable'

export default async function AdsPage() {
  const supabase = createAdminClient()

  // Fetch all ads with their performance
  const { data: ads } = await supabase
    .from('ads')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })

  // Fetch impression and click counts for each ad
  const adsWithStats = await Promise.all(
    (ads || []).map(async (ad) => {
      const [impressionsResult, clicksResult] = await Promise.all([
        supabase.from('ad_impressions').select('*', { count: 'exact', head: true }).eq('ad_id', ad.id),
        supabase.from('ad_clicks').select('*', { count: 'exact', head: true }).eq('ad_id', ad.id),
      ])

      const impressions = impressionsResult.count || 0
      const clicks = clicksResult.count || 0
      const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00'

      return {
        ...ad,
        impressions,
        clicks,
        ctr,
      }
    })
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ad Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your advertisements and track their performance
          </p>
        </div>
        <Link
          href="/admin/ads/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Ad
        </Link>
      </div>

      {/* Ads List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        {adsWithStats.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No ads yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by creating your first advertisement</p>
            <Link
              href="/admin/ads/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Ad
            </Link>
          </div>
        ) : (
          <AdsTable ads={adsWithStats} />
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Ads</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{adsWithStats.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {adsWithStats.filter(ad => ad.is_active).length} active
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Impressions</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {adsWithStats.reduce((sum, ad) => sum + ad.impressions, 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Clicks</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {adsWithStats.reduce((sum, ad) => sum + ad.clicks, 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Average CTR: {
              (() => {
                const totalImpressions = adsWithStats.reduce((sum, ad) => sum + ad.impressions, 0)
                const totalClicks = adsWithStats.reduce((sum, ad) => sum + ad.clicks, 0)
                return totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00'
              })()
            }%
          </p>
        </div>
      </div>
    </div>
  )
}
