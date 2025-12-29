import { Suspense } from 'react'
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
