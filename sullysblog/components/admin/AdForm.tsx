'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export type AdFormData = {
  id?: string
  name: string
  ad_zone: string
  ad_type: string
  content: string
  link_url: string | null
  priority: number
  is_active: boolean
  start_date: string | null
  end_date: string | null
}

interface AdFormProps {
  initialData?: AdFormData
  mode: 'create' | 'edit'
}

const AD_ZONES = [
  { value: 'header_banner', label: 'Header Banner' },
  { value: 'sidebar_top', label: 'Sidebar - Top' },
  { value: 'sidebar_middle', label: 'Sidebar - Middle' },
  { value: 'sidebar_bottom', label: 'Sidebar - Bottom' },
  { value: 'home_sponsor_1', label: 'Homepage Sponsor 1' },
  { value: 'home_sponsor_2', label: 'Homepage Sponsor 2' },
  { value: 'home_sponsor_3', label: 'Homepage Sponsor 3' },
  { value: 'home_sponsor_4', label: 'Homepage Sponsor 4' },
  { value: 'resources_top', label: 'Resources Page - Top' },
  { value: 'content_top', label: 'Article Content - Top' },
  { value: 'content_middle', label: 'Article Content - Middle' },
  { value: 'content_bottom', label: 'Article Content - Bottom' },
  { value: 'footer', label: 'Footer' },
]

const AD_TYPES = [
  { value: 'html', label: 'HTML' },
  { value: 'script', label: 'Script' },
  { value: 'image', label: 'Image' },
]

export function AdForm({ initialData, mode }: AdFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload')
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<AdFormData>(initialData || {
    name: '',
    ad_zone: 'sidebar_top',
    ad_type: 'html',
    content: '',
    link_url: null,
    priority: 0,
    is_active: true,
    start_date: null,
    end_date: null,
  })
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!formData.id) return
    if (!confirm('Are you sure you want to delete this ad? This cannot be undone.')) return

    setDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/ads/${formData.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete ad')
      }

      if (result.archived) {
        alert('This ad has analytics data and was deactivated instead of deleted.')
      }

      router.push('/admin/ads')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to delete ad')
      setDeleting(false)
    }
  }

  const handleArchive = async () => {
    if (!formData.id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/ads/${formData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to archive ad')
      }

      router.push('/admin/ads')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to archive ad')
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError(null)

    try {
      const uploadData = new FormData()
      uploadData.append('file', file)

      const response = await fetch('/api/admin/upload-ad-image', {
        method: 'POST',
        body: uploadData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload image')
      }

      setFormData({ ...formData, content: result.url })
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = mode === 'create'
        ? '/api/admin/ads'
        : `/api/admin/ads/${formData.id}`

      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save ad')
      }

      router.push('/admin/ads')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ad Name
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Homepage Sidebar Ad"
          />
        </div>

        {/* Ad Zone */}
        <div>
          <label htmlFor="ad_zone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ad Zone
          </label>
          <select
            id="ad_zone"
            required
            value={formData.ad_zone}
            onChange={(e) => setFormData({ ...formData, ad_zone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {AD_ZONES.map((zone) => (
              <option key={zone.value} value={zone.value}>
                {zone.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ad Type */}
        <div>
          <label htmlFor="ad_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ad Type
          </label>
          <select
            id="ad_type"
            required
            value={formData.ad_type}
            onChange={(e) => setFormData({ ...formData, ad_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {AD_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content - different UI based on ad type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {formData.ad_type === 'image' ? 'Ad Image' : 'Ad Content'}
          </label>

          {formData.ad_type === 'image' ? (
            <div className="space-y-4">
              {/* Toggle between upload and URL */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={imageInputMode === 'upload'}
                    onChange={() => setImageInputMode('upload')}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Upload Image</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={imageInputMode === 'url'}
                    onChange={() => setImageInputMode('url')}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Use URL</span>
                </label>
              </div>

              {imageInputMode === 'upload' ? (
                <div>
                  {formData.content && formData.content.startsWith('http') ? (
                    <div className="relative inline-block mb-4">
                      <img
                        src={formData.content}
                        alt="Ad preview"
                        className="max-w-md h-auto rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, content: '' })
                          if (imageInputRef.current) imageInputRef.current.value = ''
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                        title="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                      <input
                        type="file"
                        ref={imageInputRef}
                        onChange={handleImageUpload}
                        accept="image/png,image/jpeg,image/gif,image/webp"
                        className="hidden"
                        id="ad-image-upload"
                      />
                      <label
                        htmlFor="ad-image-upload"
                        className="flex flex-col items-center cursor-pointer"
                      >
                        {uploadingImage ? (
                          <div className="flex items-center gap-2 text-gray-500">
                            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Uploading...</span>
                          </div>
                        ) : (
                          <>
                            <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Click to upload ad image</span>
                            <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, WebP (max 5MB)</span>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="url"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/ad-image.jpg"
                />
              )}

              {/* Preview for URL mode */}
              {imageInputMode === 'url' && formData.content && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Preview:</p>
                  <img
                    src={formData.content}
                    alt="Ad preview"
                    className="max-w-md h-auto rounded-lg border border-gray-300 dark:border-gray-600"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
            </div>
          ) : (
            <textarea
              id="content"
              required
              rows={10}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder={formData.ad_type === 'script' ? 'Enter your ad script here' : 'Enter your ad HTML here'}
            />
          )}
        </div>

        {/* Link URL */}
        <div>
          <label htmlFor="link_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Link URL (optional)
          </label>
          <input
            type="url"
            id="link_url"
            value={formData.link_url || ''}
            onChange={(e) => setFormData({ ...formData, link_url: e.target.value || null })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
          />
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Priority (higher = shown first)
          </label>
          <input
            type="number"
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Is Active */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Active (ad will be displayed)
          </label>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date (optional)
            </label>
            <input
              type="date"
              id="start_date"
              value={formData.start_date || ''}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date (optional)
            </label>
            <input
              type="date"
              id="end_date"
              value={formData.end_date || ''}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <button
          type="submit"
          disabled={loading || deleting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Ad' : 'Update Ad'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>

        {mode === 'edit' && (
          <>
            <div className="flex-1" /> {/* Spacer */}
            {formData.is_active && (
              <button
                type="button"
                onClick={handleArchive}
                disabled={loading || deleting}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Archiving...' : 'Archive'}
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || deleting}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        )}
      </div>
    </form>
  )
}
