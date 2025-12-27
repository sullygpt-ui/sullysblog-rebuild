'use client'

type PriceDisplayProps = {
  price: number
  compareAtPrice?: number | null
  size?: 'sm' | 'md' | 'lg'
}

export function PriceDisplay({ price, compareAtPrice, size = 'md' }: PriceDisplayProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  const compareClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  if (price === 0) {
    return (
      <span className={`font-bold text-green-600 dark:text-green-400 ${sizeClasses[size]}`}>
        Free
      </span>
    )
  }

  return (
    <div className="flex items-baseline gap-2">
      <span className={`font-bold text-gray-900 dark:text-white ${sizeClasses[size]}`}>
        ${price.toFixed(2)}
      </span>
      {compareAtPrice && compareAtPrice > price && (
        <span className={`text-gray-500 line-through ${compareClasses[size]}`}>
          ${compareAtPrice.toFixed(2)}
        </span>
      )}
    </div>
  )
}
