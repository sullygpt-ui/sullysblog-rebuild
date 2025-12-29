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

  const handleClick = () => {
    // Track click when ad is clicked
    // Use sendBeacon for reliable tracking even when navigating away
    const data = JSON.stringify({
      adId: ad.id,
      pageUrl: window.location.pathname
    })

    // sendBeacon is designed to reliably send data during page unload/navigation
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/ads/track-click', new Blob([data], { type: 'application/json' }))
    } else {
      // Fallback for older browsers
      fetch('/api/ads/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true // Allows request to outlive the page
      }).catch(() => {})
    }
  }

  const renderAdContent = () => {
    if (ad.ad_type === 'image') {
      const imageElement = (
        <img
          src={ad.content}
          alt={ad.name}
          className="max-w-[300px] h-auto mx-auto"
        />
      )

      // Wrap in link if link_url exists
      if (ad.link_url) {
        return (
          <a
            href={ad.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            {imageElement}
          </a>
        )
      }

      return imageElement
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
