import { Metadata } from 'next'
import { getCouponReport, getAllCoupons } from '@/lib/queries/coupons'
import { CouponReportDashboard } from '@/components/admin/CouponReportDashboard'

export const metadata: Metadata = {
  title: 'Coupon Report - Admin | SullysBlog',
}

type Props = {
  searchParams: Promise<{ start?: string; end?: string; coupon?: string }>
}

export default async function CouponReportPage({ searchParams }: Props) {
  const params = await searchParams

  // Default to last 30 days
  const endDate = params.end || new Date().toISOString().split('T')[0]
  const startDate = params.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const couponId = params.coupon

  const [reportData, coupons] = await Promise.all([
    getCouponReport(startDate, endDate + 'T23:59:59', couponId),
    getAllCoupons()
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Coupon Report</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track coupon usage and discount performance
        </p>
      </div>

      <CouponReportDashboard
        reportData={reportData}
        coupons={coupons}
        startDate={startDate}
        endDate={endDate}
        selectedCouponId={couponId}
      />
    </div>
  )
}
