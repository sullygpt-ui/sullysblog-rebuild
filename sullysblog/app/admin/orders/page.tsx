import { Metadata } from 'next'
import { getAllOrders, getOrderStats } from '@/lib/queries/orders'
import { OrdersManager } from '@/components/admin/OrdersManager'

export const metadata: Metadata = {
  title: 'Orders - Admin | SullysBlog',
}

export default async function AdminOrdersPage() {
  const orders = await getAllOrders()
  const stats = await getOrderStats()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and manage customer orders
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
          <p className="text-2xl font-bold text-blue-600">${stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Free Claims</p>
          <p className="text-2xl font-bold text-gray-600">{stats.freeOrders}</p>
        </div>
      </div>

      {/* Orders Table */}
      <OrdersManager initialOrders={orders} />
    </div>
  )
}
