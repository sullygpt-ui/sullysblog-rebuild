'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/queries/products'

type BuyButtonProps = {
  product: Product
}

type CouponInfo = {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  discountAmount: number
  newTotal: number
}

export function BuyButton({ product }: BuyButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<CouponInfo | null>(null)
  const [showCouponInput, setShowCouponInput] = useState(false)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return

    setValidatingCoupon(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Please sign in to use coupon codes')
        setValidatingCoupon(false)
        return
      }

      const response = await fetch('/api/store/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          productId: product.id,
          subtotal: product.price
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid coupon code')
        setAppliedCoupon(null)
      } else {
        setAppliedCoupon({
          ...data.coupon,
          discountAmount: data.discountAmount,
          newTotal: data.newTotal
        })
        setError(null)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to validate coupon')
      setAppliedCoupon(null)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setError(null)
  }

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

      const effectivePrice = appliedCoupon ? appliedCoupon.newTotal : product.price

      if (effectivePrice === 0 && !appliedCoupon) {
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
        // Create checkout session (with or without coupon)
        const response = await fetch('/api/store/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            couponCode: appliedCoupon?.code || null
          })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to create checkout session')
        }

        const { url, free } = await response.json()
        if (url) {
          if (free) {
            router.push(url)
          } else {
            window.location.href = url
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  const displayPrice = appliedCoupon ? appliedCoupon.newTotal : product.price

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Coupon Section */}
      {Number(product.price) > 0 && (
        <div className="space-y-2">
          {!showCouponInput && !appliedCoupon ? (
            <button
              type="button"
              onClick={() => setShowCouponInput(true)}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Have a coupon code?
            </button>
          ) : appliedCoupon ? (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Coupon applied: <span className="font-mono">{appliedCoupon.code}</span>
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {appliedCoupon.discount_type === 'percentage'
                    ? `${appliedCoupon.discount_value}% off`
                    : `$${appliedCoupon.discount_value.toFixed(2)} off`}
                  {' '}- You save ${appliedCoupon.discountAmount.toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500"
                disabled={validatingCoupon}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={validatingCoupon || !couponCode.trim()}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:text-gray-400 text-sm font-medium rounded-lg transition-colors"
              >
                {validatingCoupon ? 'Checking...' : 'Apply'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCouponInput(false)
                  setCouponCode('')
                }}
                className="px-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Price Display with Discount */}
      {appliedCoupon && (
        <div className="flex items-center gap-2 text-lg">
          <span className="text-gray-400 line-through">${product.price.toFixed(2)}</span>
          <span className="text-2xl font-bold text-green-600">${appliedCoupon.newTotal.toFixed(2)}</span>
          {appliedCoupon.newTotal === 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
              FREE
            </span>
          )}
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
        ) : displayPrice === 0 ? (
          'Get Free Access'
        ) : (
          `Buy Now - $${displayPrice.toFixed(2)}`
        )}
      </button>
    </div>
  )
}
