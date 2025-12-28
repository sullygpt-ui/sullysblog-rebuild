'use client'

import { useState } from 'react'
import type { DomainForSale } from '@/lib/queries/domains'

type DomainBuyButtonProps = {
  domain: DomainForSale
}

export function DomainBuyButton({ domain }: DomainBuyButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleBuyClick = async () => {
    // If using external URL, just redirect
    if (domain.paypal_link) {
      window.open(domain.paypal_link, '_blank')
      return
    }

    // Otherwise, create Stripe checkout session
    setLoading(true)

    try {
      const response = await fetch('/api/domains/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId: domain.id })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Error creating checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBuyClick}
      disabled={loading}
      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white text-sm font-semibold rounded transition-colors whitespace-nowrap"
    >
      {loading ? '...' : 'Buy Now'}
    </button>
  )
}
