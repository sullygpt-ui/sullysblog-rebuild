'use client'

import { useState, useEffect } from 'react'

type Customer = {
  email: string
  total_orders: number
  total_spent: number
  first_order_date: string
  last_order_date: string
  orders: {
    id: string
    order_number: string
    total: number
    status: string
    created_at: string
    items: {
      product_name: string
      price: number
    }[]
  }[]
}

type CustomerSummary = {
  total_customers: number
  total_revenue: number
  avg_order_value: number
  repeat_customers: number
}

export function CustomersManager() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [summary, setSummary] = useState<CustomerSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'total_spent' | 'total_orders' | 'last_order_date'>('total_spent')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/customers')
      if (!response.ok) throw new Error('Failed to fetch customers')
      const data = await response.json()
      setCustomers(data.customers)
      setSummary(data.summary)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/admin/customers/export')
      if (!response.ok) throw new Error('Failed to export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const filteredCustomers = customers
    .filter(c => c.email.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'total_spent':
          return b.total_spent - a.total_spent
        case 'total_orders':
          return b.total_orders - a.total_orders
        case 'last_order_date':
          return new Date(b.last_order_date).getTime() - new Date(a.last_order_date).getTime()
        default:
          return 0
      }
    })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_customers}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_revenue)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Order Value</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.avg_order_value)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Repeat Customers</p>
            <p className="text-2xl font-bold text-purple-600">{summary.repeat_customers}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="total_spent">Sort by Total Spent</option>
            <option value="total_orders">Sort by Orders</option>
            <option value="last_order_date">Sort by Recent</option>
          </select>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
        >
          Export CSV
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Spent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                First Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCustomers.map((customer) => (
              <>
                <tr key={customer.email} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {customer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {customer.total_orders} {customer.total_orders === 1 ? 'order' : 'orders'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    {formatCurrency(customer.total_spent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(customer.first_order_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(customer.last_order_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setExpandedEmail(expandedEmail === customer.email ? null : customer.email)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      {expandedEmail === customer.email ? 'Hide' : 'View Orders'}
                    </button>
                  </td>
                </tr>
                {expandedEmail === customer.email && (
                  <tr key={`${customer.email}-details`}>
                    <td colSpan={6} className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Order History</p>
                        <div className="space-y-2">
                          {customer.orders.map((order) => (
                            <div
                              key={order.id}
                              className="flex flex-wrap items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                              <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                                #{order.order_number}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(order.created_at)}
                              </span>
                              <span className="text-sm font-semibold text-green-600">
                                {formatCurrency(order.total)}
                              </span>
                              <div className="flex-1 text-sm text-gray-600 dark:text-gray-400">
                                {order.items.map(item => item.product_name).join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No customers found matching your search.' : 'No customers yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
