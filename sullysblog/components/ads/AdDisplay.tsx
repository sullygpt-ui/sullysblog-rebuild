'use client'

import { useEffect } from 'react'
import type { Ad } from '@/lib/queries/ads'

type AdDisplayProps = {
  ad: Ad
}

export function AdDisplay({ ad }: AdDisplayProps) {
  useEffect(() => {
    // Track impression when ad is displayed
    const trackImpression = async () => {
      try {
        await fetch('/api/ads/track-impression', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adId: ad.id,
            pageUrl: window.location.pathname
          })
        })
      } catch (error) {
        console.error('Failed to track ad impression:', error)
      }
    }

    trackImpression()
  }, [ad.id])

  const handleClick = async () => {
    // Track click when ad is clicked
    try {
      await fetch('/api/ads/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adId: ad.id,
          pageUrl: window.location.pathname
        })
      })
    } catch (error) {
      console.error('Failed to track ad click:', error)
    }
  }

  const renderAdContent = () => {
    if (ad.ad_type === 'image') {
      return (
        <img
          src={ad.content}
          alt={ad.name}
          className="max-w-[300px] h-auto mx-auto"
        />
      )
    }
    // For HTML and Script types
    return (
      <div
        className="ad-content flex justify-center [&_img]:max-w-[300px]"
        dangerouslySetInnerHTML={{ __html: ad.content }}
      />
    )
  }

  return (
    <div
      className="ad-container mb-6 text-center"
      data-ad-id={ad.id}
      data-ad-zone={ad.ad_zone}
      onClick={handleClick}
    >
      {/* Label for transparency */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center uppercase tracking-wide">
        Advertisement
      </div>

      {/* Ad content */}
      {renderAdContent()}
    </div>
  )
}
