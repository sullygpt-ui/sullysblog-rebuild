import { Metadata } from 'next'
import Link from 'next/link'
import { getActiveProducts, getFeaturedProducts } from '@/lib/queries/products'
import { ProductCard } from '@/components/store/ProductCard'

export const metadata: Metadata = {
  title: 'Playbooks & Training - SullysBlog.com',
  description: 'Domain investing playbooks, templates, and training resources to help you succeed in the domain industry.',
  openGraph: {
    title: 'Playbooks & Training - SullysBlog.com',
    description: 'Domain investing playbooks, templates, and training resources',
    url: 'https://sullysblog.com/store',
    type: 'website'
  },
  alternates: {
    canonical: 'https://sullysblog.com/store'
  }
}

type Props = {
  searchParams: Promise<{ type?: string }>
}

export default async function StorePage({ searchParams }: Props) {
  const params = await searchParams
  const typeFilter = params.type

  const allProducts = await getActiveProducts()
  const featuredProducts = await getFeaturedProducts(4)

  // Filter by type if specified
  const products = typeFilter
    ? allProducts.filter(p => p.product_type === typeFilter)
    : allProducts

  const productTypes = [
    { value: 'ebook', label: 'eBooks', count: allProducts.filter(p => p.product_type === 'ebook').length },
    { value: 'template', label: 'Templates', count: allProducts.filter(p => p.product_type === 'template').length },
    { value: 'bundle', label: 'Bundles', count: allProducts.filter(p => p.product_type === 'bundle').length },
    { value: 'course', label: 'Courses', count: allProducts.filter(p => p.product_type === 'course').length },
  ].filter(t => t.count > 0)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Playbooks & Training
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
          Level up your domain investing with expert playbooks, templates, and training resources
        </p>
        <Link
          href="/store/orders"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          My Downloads
        </Link>
      </div>

      {/* Featured Products */}
      {!typeFilter && featuredProducts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Featured Products
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Filter Tabs */}
      {productTypes.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <a
            href="/store"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !typeFilter
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All ({allProducts.length})
          </a>
          {productTypes.map((type) => (
            <a
              key={type.value}
              href={`/store?type=${type.value}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === type.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {type.label} ({type.count})
            </a>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
          <svg
            className="w-20 h-20 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No products available
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Check back soon for new products!
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {typeFilter
              ? `${productTypes.find(t => t.value === typeFilter)?.label || 'Products'}`
              : 'All Products'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
