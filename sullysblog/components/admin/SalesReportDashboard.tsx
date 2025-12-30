'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { SalesReportSummary } from '@/lib/queries/orders'
import type { Product } from '@/lib/queries/products'

type Props = {
  salesData: SalesReportSummary
  products: Product[]
  startDate: string
  endDate: string
  selectedProductId?: string
}

export function SalesReportDashboard({
  salesData,
  products,
  startDate,
  endDate,
  selectedProductId
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [start, setStart] = useState(startDate)
  const [end, setEnd] = useState(endDate)
  const [productFilter, setProductFilter] = useState(selectedProductId || '')
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('start', start)
    params.set('end', end)
    if (productFilter) {
      params.set('product', productFilter)
    } else {
      params.delete('product')
    }
    router.push(`/admin/reports/sales?${params.toString()}`)
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
    return amount === 0 ? 'Free' : `$${amount.toFixed(2)}`
  }

  const getProductTypeColor = (type: string) => {
    switch (type) {
      case 'ebook': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'template': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'bundle': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'course': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const exportCSV = () => {
    const rows = [
      ['Product', 'Type', 'Units Sold', 'Revenue', 'Order Number', 'Customer Email', 'Price', 'Date']
    ]

    for (const product of salesData.products) {
      for (const order of product.orders) {
        rows.push([
          product.product_name,
          product.product_type,
          product.units_sold.toString(),
          product.total_revenue.toFixed(2),
          order.order_number,
          order.customer_email,
          order.price.toFixed(2),
          new Date(order.date).toISOString()
        ])
      }
    }

    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-report-${start}-to-${end}.csv`
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
              Product
            </label>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-w-[200px]"
            >
              <option value="">All Products</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
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
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(salesData.total_revenue)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
          <p className="text-3xl font-bold text-blue-600">{salesData.total_orders}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Units Sold</p>
          <p className="text-3xl font-bold text-purple-600">{salesData.total_units}</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sales by Product</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Units Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {salesData.products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No sales in this date range
                  </td>
                </tr>
              ) : (
                salesData.products.map((product) => (
                  <>
                    <tr key={product.product_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {product.product_name}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProductTypeColor(product.product_type)}`}>
                          {product.product_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {product.units_sold}
                      </td>
                      <td className="px-6 py-4 font-medium text-green-600">
                        {formatCurrency(product.total_revenue)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setExpandedProduct(
                            expandedProduct === product.product_id ? null : product.product_id
                          )}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          {expandedProduct === product.product_id ? 'Hide Orders' : 'View Orders'}
                        </button>
                      </td>
                    </tr>
                    {expandedProduct === product.product_id && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              Order Details ({product.orders.length} orders)
                            </p>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="text-left text-gray-500 dark:text-gray-400">
                                    <th className="pr-4 py-2">Order #</th>
                                    <th className="pr-4 py-2">Customer</th>
                                    <th className="pr-4 py-2">Price</th>
                                    <th className="pr-4 py-2">Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {product.orders.map((order, idx) => (
                                    <tr key={idx} className="text-gray-600 dark:text-gray-300">
                                      <td className="pr-4 py-2 font-mono">{order.order_number}</td>
                                      <td className="pr-4 py-2">{order.customer_email}</td>
                                      <td className="pr-4 py-2">{formatCurrency(order.price)}</td>
                                      <td className="pr-4 py-2">{formatDate(order.date)}</td>
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
