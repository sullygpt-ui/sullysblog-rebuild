import { getAnalyticsData } from '@/lib/queries/analytics'
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard'

export const metadata = {
  title: 'Analytics | Admin',
  description: 'Resource directory analytics and insights',
}

export default async function AdminAnalyticsPage() {
  const analytics = await getAnalyticsData(30)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Performance metrics and insights for your resource directory
        </p>
      </div>

      <AnalyticsDashboard data={analytics} />
    </div>
  )
}
