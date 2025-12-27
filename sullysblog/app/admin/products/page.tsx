import { Metadata } from 'next'
import { getAllProducts } from '@/lib/queries/products'
import { ProductsManager } from '@/components/admin/ProductsManager'

export const metadata: Metadata = {
  title: 'Products - Admin | SullysBlog',
}

export default async function AdminProductsPage() {
  const products = await getAllProducts()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your digital products, ebooks, templates, and courses
        </p>
      </div>

      <ProductsManager initialProducts={products} />
    </div>
  )
}
