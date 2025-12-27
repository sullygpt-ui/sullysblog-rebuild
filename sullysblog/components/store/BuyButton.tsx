'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/queries/products'

type BuyButtonProps = {
  product: Product
}

export function BuyButton({ product }: BuyButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setError(null)

    try {
      // Check if user is logged in
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login with return URL
        router.push(`/auth/login?redirectTo=/store/${product.slug}`)
        return
      }

      if (product.price === 0) {
        // Free product - claim directly
        const response = await fetch('/api/store/claim-free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to claim product')
        }

        const { orderId } = await response.json()
        router.push(`/store/checkout/success?order=${orderId}`)
      } else {
        // Paid product - create Stripe checkout session
        const response = await fetch('/api/store/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to create checkout session')
        }

        const { url } = await response.json()
        if (url) {
          window.location.href = url
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold text-lg rounded-lg transition-colors disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : product.price === 0 ? (
          'Get Free Access'
        ) : (
          `Buy Now - $${product.price.toFixed(2)}`
        )}
      </button>
    </div>
  )
}
