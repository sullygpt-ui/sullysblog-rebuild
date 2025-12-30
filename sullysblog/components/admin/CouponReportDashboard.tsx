'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { CouponReportSummary } from '@/lib/queries/coupons'
import type { Coupon } from '@/lib/queries/coupons'

type Props = {
  reportData: CouponReportSummary
  coupons: Coupon[]
  startDate: string
  endDate: string
  selectedCouponId?: string
}

export function CouponReportDashboard({
  reportData,
  coupons,
  startDate,
  endDate,
  selectedCouponId
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [start, setStart] = useState(startDate)
  const [end, setEnd] = useState(endDate)
  const [couponFilter, setCouponFilter] = useState(selectedCouponId || '')
  const [expandedCoupon, setExpandedCoupon] = useState<string | null>(null)

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('start', start)
    params.set('end', end)
    if (couponFilter) {
      params.set('coupon', couponFilter)
    } else {
      params.delete('coupon')
    }
    router.push(`/admin/reports/coupons?${params.toString()}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  const getDiscountBadge = (type: string, value: number) => {
    if (type === 'percentage') {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {value}% OFF
        </span>
      )
    }
    return (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        ${value.toFixed(2)} OFF
      </span>
    )
  }

  const exportCSV = () => {
    const rows = [
      ['Coupon Code', 'Description', 'Discount Type', 'Discount Value', 'Total Uses', 'Total Discount', 'Order Number', 'Customer Email', 'Discount Amount', 'Used At']
    ]

    for (const coupon of reportData.coupons) {
      for (const usage of coupon.usages) {
        rows.push([
          coupon.coupon_code,
          coupon.description || '',
          coupon.discount_type,
          coupon.discount_value.toString(),
          coupon.total_uses.toString(),
          coupon.total_discount.toFixed(2),
          usage.order_number,
          usage.customer_email,
          usage.discount_amount.toFixed(2),
          new Date(usage.used_at).toISOString()
        ])
      }
    }

    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `coupon-report-${start}-to-${end}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Coupon
            </label>
            <select
              value={couponFilter}
              onChange={(e) => setCouponFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-w-[200px]"
            >
              <option value="">All Coupons</option>
              {coupons.map(c => (
                <option key={c.id} value={c.id}>{c.code}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Apply Filters
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Discounts Given</p>
          <p className="text-3xl font-bold text-purple-600">{formatCurrency(reportData.total_discount)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Uses</p>
          <p className="text-3xl font-bold text-blue-600">{reportData.total_uses}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Average Discount</p>
          <p className="text-3xl font-bold text-green-600">
            {reportData.total_uses > 0
              ? formatCurrency(reportData.total_discount / reportData.total_uses)
              : '$0.00'}
          </p>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Coupon Usage</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Coupon Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Uses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Discounted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {reportData.coupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No coupon usage in this date range
                  </td>
                </tr>
              ) : (
                reportData.coupons.map((coupon) => (
                  <>
                    <tr key={coupon.coupon_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-mono font-semibold text-gray-900 dark:text-white">
                            {coupon.coupon_code}
                          </p>
                          {coupon.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {coupon.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getDiscountBadge(coupon.discount_type, coupon.discount_value)}
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {coupon.total_uses}
                      </td>
                      <td className="px-6 py-4 font-medium text-purple-600">
                        {formatCurrency(coupon.total_discount)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setExpandedCoupon(
                            expandedCoupon === coupon.coupon_id ? null : coupon.coupon_id
                          )}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          {expandedCoupon === coupon.coupon_id ? 'Hide Details' : 'View Details'}
                        </button>
                      </td>
                    </tr>
                    {expandedCoupon === coupon.coupon_id && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              Usage Details ({coupon.usages.length} uses)
                            </p>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="text-left text-gray-500 dark:text-gray-400">
                                    <th className="pr-4 py-2">Order #</th>
                                    <th className="pr-4 py-2">Customer</th>
                                    <th className="pr-4 py-2">Discount</th>
                                    <th className="pr-4 py-2">Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {coupon.usages.map((usage, idx) => (
                                    <tr key={idx} className="text-gray-600 dark:text-gray-300">
                                      <td className="pr-4 py-2 font-mono">{usage.order_number}</td>
                                      <td className="pr-4 py-2">{usage.customer_email}</td>
                                      <td className="pr-4 py-2 text-purple-600">{formatCurrency(usage.discount_amount)}</td>
                                      <td className="pr-4 py-2">{formatDate(usage.used_at)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
