import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { SalesReportDashboard } from '@/components/admin/SalesReportDashboard'
import { getSalesReport } from '@/lib/queries/orders'
import { getAllProducts } from '@/lib/queries/products'

export const metadata: Metadata = {
  title: 'Sales Report - Admin | SullysBlog',
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function SalesReportPage({
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
  const productId = params.product as string | undefined

  // Add time to make the date range inclusive
  const startDateTime = `${startDate}T00:00:00.000Z`
  const endDateTime = `${endDate}T23:59:59.999Z`

  // Fetch data
  const [salesData, products] = await Promise.all([
    getSalesReport(startDateTime, endDateTime, productId),
    getAllProducts()
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Link href="/admin/reports" className="hover:text-blue-600">Reports</Link>
            <span>/</span>
            <span>Sales</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales Report</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View sales data by product with customer details
          </p>
        </div>
      </div>

      {/* Dashboard */}
      <Suspense fallback={<div className="text-gray-500">Loading report...</div>}>
        <SalesReportDashboard
          salesData={salesData}
          products={products}
          startDate={startDate}
          endDate={endDate}
          selectedProductId={productId}
        />
      </Suspense>
    </div>
  )
}
