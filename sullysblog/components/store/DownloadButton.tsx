'use client'

import { useState } from 'react'

type DownloadButtonProps = {
  fileId: string
  fileName: string
}

export function DownloadButton({ fileId, fileName }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/store/download/${fileId}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to get download')
      }

      const data = await response.json()

      if (data.url) {
        // Open download in new tab/window
        window.open(data.url, '_blank')
      }
    } catch (err: any) {
      setError(err.message || 'Download failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400 mr-2">{error}</span>
      )}
      <button
        onClick={handleDownload}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </span>
        )}
      </button>
    </div>
  )
}
