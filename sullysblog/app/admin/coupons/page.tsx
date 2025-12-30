import { Metadata } from 'next'
import { getAllCoupons, getCouponStats } from '@/lib/queries/coupons'
import { getAllProducts } from '@/lib/queries/products'
import { CouponsManager } from '@/components/admin/CouponsManager'

export const metadata: Metadata = {
  title: 'Coupons - Admin | SullysBlog',
}

export default async function AdminCouponsPage() {
  const [coupons, stats, products] = await Promise.all([
    getAllCoupons(),
    getCouponStats(),
    getAllProducts()
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Coupons</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage discount codes and promotional offers
        </p>
      </div>

      <CouponsManager
        initialCoupons={coupons}
        initialStats={stats}
        products={products}
      />
    </div>
  )
}
