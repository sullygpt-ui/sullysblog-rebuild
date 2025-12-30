import { CustomersManager } from '@/components/admin/CustomersManager'

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View all customers and their purchase history
        </p>
      </div>

      <CustomersManager />
    </div>
  )
}
