import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getProductBySlug } from '@/lib/queries/products'
import { PriceDisplay } from '@/components/store/PriceDisplay'
import { BuyButton } from '@/components/store/BuyButton'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { MarkdownContent } from '@/components/ui/MarkdownContent'

// Dynamic page - products change frequently
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: 'Product Not Found - SullysBlog.com',
    }
  }

  return {
    title: `${product.name} - Playbooks & Training | SullysBlog.com`,
    description: product.short_description || product.description || `Get ${product.name} from SullysBlog.com`,
    openGraph: {
      title: product.name,
      description: product.short_description || product.description || undefined,
      url: `https://sullysblog.com/store/${product.slug}`,
      images: product.cover_image_url ? [{ url: product.cover_image_url }] : undefined,
      type: 'website'
    },
    alternates: {
      canonical: `https://sullysblog.com/store/${product.slug}`
    }
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product || product.status !== 'active') {
    notFound()
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ebook': return 'eBook'
      case 'template': return 'Template'
      case 'bundle': return 'Bundle'
      case 'course': return 'Course'
      default: return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ebook':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'template':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'bundle':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'course':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const baseUrl = 'https://sullysblog.com'

  return (
    <>
      <ProductJsonLd
        name={product.name}
        description={product.short_description || product.description || product.name}
        url={`${baseUrl}/store/${product.slug}`}
        imageUrl={product.cover_image_url || undefined}
        price={product.price}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: baseUrl },
          { name: 'Playbooks & Training', url: `${baseUrl}/store` },
          { name: product.name, url: `${baseUrl}/store/${product.slug}` },
        ]}
      />
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <li>
            <Link href="/store" className="hover:text-blue-600 dark:hover:text-blue-400">
              Playbooks & Training
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 dark:text-white font-medium truncate">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          {product.cover_image_url ? (
            <Image
              src={product.cover_image_url}
              alt={product.name}
              width={600}
              height={450}
              className="w-full h-auto object-contain"
              priority
            />
          ) : (
            <div className="w-full aspect-[4/3] flex items-center justify-center">
              <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(product.product_type)}`}>
              {getTypeLabel(product.product_type)}
            </span>
            {product.featured && (
              <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {product.name}
          </h1>

          {/* Short Description */}
          {product.short_description && (
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              {product.short_description}
            </p>
          )}

          {/* Price */}
          <div className="mb-6">
            <PriceDisplay
              price={product.price}
              compareAtPrice={product.compare_at_price}
              size="lg"
            />
          </div>

          {/* Buy Button */}
          <div className="mb-8">
            <BuyButton product={product} />
          </div>

          {/* What's Included (for bundles) */}
          {product.product_type === 'bundle' && product.bundle_items && product.bundle_items.length > 0 && (
            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                What's Included ({product.bundle_items.length} items)
              </h3>
              <ul className="space-y-2">
                {product.bundle_items.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item.included_product.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Files Count */}
          {product.files && product.files.length > 0 && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-6">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {product.files.length} downloadable file{product.files.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Full Description */}
      {product.description && (
        <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            About This Product
          </h2>
          <MarkdownContent content={product.description} />
        </div>
      )}
      </div>
    </>
  )
}
