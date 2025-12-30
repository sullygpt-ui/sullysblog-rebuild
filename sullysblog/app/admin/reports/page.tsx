import { Suspense } from 'react'
import Link from 'next/link'
import { ReportsDashboard } from '@/components/admin/ReportsDashboard'
import { getAdReportData, getResourceReportData } from '@/lib/queries/reports'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ReportsPage({
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

  // Add time to make the date range inclusive
  const startDateTime = `${startDate}T00:00:00.000Z`
  const endDateTime = `${endDate}T23:59:59.999Z`

  // Fetch report data
  const [adData, resourceData] = await Promise.all([
    getAdReportData(startDateTime, endDateTime),
    getResourceReportData(startDateTime, endDateTime),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View performance reports for ads and resources
        </p>
      </div>

      {/* Report Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/reports/sales"
          className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sales Report</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View sales by product, date range, and customer details
          </p>
        </Link>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ads & Resources</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Currently viewing ad and resource performance
          </p>
        </div>
      </div>

      {/* Dashboard */}
      <Suspense fallback={<div className="text-gray-500">Loading reports...</div>}>
        <ReportsDashboard
          adData={adData}
          resourceData={resourceData}
          startDate={startDate}
          endDate={endDate}
        />
      </Suspense>
    </div>
  )
}
