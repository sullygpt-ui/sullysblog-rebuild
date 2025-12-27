'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/queries/products'
import { PriceDisplay } from './PriceDisplay'

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ebook':
        return 'eBook'
      case 'template':
        return 'Template'
      case 'bundle':
        return 'Bundle'
      case 'course':
        return 'Course'
      default:
        return type
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

  return (
    <Link
      href={`/store/${product.slug}`}
      className="group bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Cover Image */}
      <div className="w-full aspect-[4/3] bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {product.cover_image_url ? (
          <Image
            src={product.cover_image_url}
            alt={product.name}
            width={400}
            height={300}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Type Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getTypeColor(product.product_type)}`}>
            {getTypeLabel(product.product_type)}
          </span>
          {product.featured && (
            <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        {product.short_description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {product.short_description}
          </p>
        )}

        {/* Price */}
        <PriceDisplay
          price={product.price}
          compareAtPrice={product.compare_at_price}
          size="sm"
        />
      </div>
    </Link>
  )
}
