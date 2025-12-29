'use client'

import { useState, useEffect } from 'react'
import type { Resource } from '@/lib/queries/resources'
import Link from 'next/link'

type ResourceCardProps = {
  resource: Resource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [imageError, setImageError] = useState(false)

  // Track impression when card is displayed
  useEffect(() => {
    const trackImpression = async () => {
      try {
        await fetch('/api/resources/track-impression', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resourceId: resource.id,
            pageUrl: window.location.pathname
          })
        })
      } catch (error) {
        console.error('Failed to track resource impression:', error)
      }
    }

    trackImpression()
  }, [resource.id])

  const handleClick = async () => {
    try {
      await fetch('/api/resources/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: resource.id,
          pageUrl: window.location.pathname
        })
      })
    } catch (error) {
      console.error('Failed to track resource click:', error)
    }
  }

  const trackingUrl = `/go/${resource.redirect_slug}`

  // Render based on listing type
  if (resource.listing_type === 'featured') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-6 mb-6 shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            ⭐ Featured Partner
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          {resource.logo_url && !imageError && (
            <div className="flex-shrink-0">
              <img
                src={resource.logo_url}
                alt={resource.name}
                className="w-32 h-32 object-contain bg-white dark:bg-gray-800 rounded-lg p-2"
                onError={() => setImageError(true)}
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {resource.name}
            </h3>
            {resource.short_description && (
              <p className="text-lg text-blue-700 dark:text-blue-300 font-semibold mb-3">
                {resource.short_description}
              </p>
            )}
            {resource.full_description && (
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {resource.full_description}
              </p>
            )}
            <Link
              href={trackingUrl}
              onClick={handleClick}
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-lg transition-all transform hover:scale-105"
            >
              Visit Website →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (resource.listing_type === 'sponsored') {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2 py-1 rounded">
            Sponsored
          </div>
        </div>
        <div className="flex items-start gap-4">
          {resource.logo_url && !imageError && (
            <div className="flex-shrink-0">
              <img
                src={resource.logo_url}
                alt={resource.name}
                className="w-16 h-16 object-contain bg-gray-50 dark:bg-gray-900 rounded p-1"
                onError={() => setImageError(true)}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {resource.name}
            </h4>
            {(resource.full_description || resource.short_description) && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {resource.full_description || resource.short_description}
              </p>
            )}
            <Link
              href={trackingUrl}
              onClick={handleClick}
              className="inline-block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold text-sm transition-colors"
            >
              Visit {resource.name} →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Free listing
  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-700 dark:border-gray-800 last:border-0">
      <Link
        href={trackingUrl}
        onClick={handleClick}
        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
      >
        {resource.name}:
      </Link>
      {(resource.short_description || resource.full_description) && (
        <span className="text-sm text-gray-300">
          {resource.short_description || resource.full_description}
        </span>
      )}
    </div>
  )
}
