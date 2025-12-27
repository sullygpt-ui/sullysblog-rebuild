'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Ad = {
  id: string
  name: string
  ad_zone: string
  ad_type: string
  priority: number
  is_active: boolean
  impressions: number
  clicks: number
  ctr: string
}

type AdsTableProps = {
  ads: Ad[]
}

export function AdsTable({ ads }: AdsTableProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleArchive = async (adId: string) => {
    if (!confirm('Archive this ad? It will be deactivated.')) return

    setLoadingId(adId)
    try {
      const response = await fetch(`/api/admin/ads/${adId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false })
      })

      const result = await response.json()

      if (!response.ok) {
        alert(`Error: ${result.error || 'Failed to archive ad'}`)
        return
      }

      router.refresh()
    } catch (error) {
      console.error('Error archiving ad:', error)
      alert('Failed to archive ad')
    } finally {
      setLoadingId(null)
    }
  }

  const handleActivate = async (adId: string) => {
    setLoadingId(adId)
    try {
      const response = await fetch(`/api/admin/ads/${adId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: true })
      })

      if (!response.ok) {
        const result = await response.json()
        alert(`Error: ${result.error || 'Failed to activate ad'}`)
        return
      }

      router.refresh()
    } catch (error) {
      console.error('Error activating ad:', error)
      alert('Failed to activate ad')
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad? This cannot be undone.')) return

    setLoadingId(adId)
    try {
      const response = await fetch(`/api/admin/ads/${adId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        alert(`Error: ${result.error || 'Failed to delete ad'}`)
        return
      }

      if (result.archived) {
        alert('This ad has analytics data and was deactivated instead of deleted.')
      }

      router.refresh()
    } catch (error) {
      console.error('Error deleting ad:', error)
      alert('Failed to delete ad')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Zone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Impressions</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clicks</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">CTR</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {ads.map((ad) => {
            const isLoading = loadingId === ad.id
            return (
              <tr key={ad.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {ad.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {ad.ad_zone}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                  {ad.ad_type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                  {ad.priority}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    ad.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {ad.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                  {ad.impressions.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                  {ad.clicks.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                  {ad.ctr}%
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/ads/${ad.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit
                    </Link>
                    {ad.is_active ? (
                      <button
                        type="button"
                        onClick={() => handleArchive(ad.id)}
                        disabled={isLoading}
                        className="text-yellow-600 dark:text-yellow-400 hover:underline disabled:opacity-50"
                      >
                        {isLoading ? '...' : 'Archive'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleActivate(ad.id)}
                        disabled={isLoading}
                        className="text-green-600 dark:text-green-400 hover:underline disabled:opacity-50"
                      >
                        {isLoading ? '...' : 'Activate'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(ad.id)}
                      disabled={isLoading}
                      className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                    >
                      {isLoading ? '...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
