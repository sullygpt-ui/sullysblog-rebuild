import { Suspense } from 'react'
import Link from 'next/link'
import { GoogleAnalyticsDashboard } from '@/components/admin/GoogleAnalyticsDashboard'

export const metadata = {
  title: 'Google Analytics | Admin',
  description: 'Website traffic analytics from Google Analytics',
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function GoogleAnalyticsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams

  // Default to last 30 days
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const startDate = (params.start as string) || thirtyDaysAgo.toISOString().split('T')[0]
  const endDate = (params.end as string) || today.toISOString().split('T')[0]

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <Link
            href="/admin/analytics"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            Analytics
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Google Analytics</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Google Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Website traffic and visitor behavior from Google Analytics
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <GoogleAnalyticsDashboard
          initialStartDate={startDate}
          initialEndDate={endDate}
        />
      </Suspense>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
      <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg" />
    </div>
  )
}
