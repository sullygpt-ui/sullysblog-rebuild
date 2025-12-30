'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { RichTextEditor } from '@/components/editor/RichTextEditor'

export type PostFormData = {
  id?: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  featured_image_url: string | null
  category_ids: string[]
  status: 'draft' | 'scheduled' | 'published'
  published_at: string | null
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string | null
}

interface PostFormProps {
  initialData?: PostFormData
  mode: 'create' | 'edit'
  categories: Array<{ id: string; name: string }>
}

export function PostForm({ initialData, mode, categories }: PostFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [generatingSeo, setGeneratingSeo] = useState(false)
  const featuredImageRef = useRef<HTMLInputElement>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const [formData, setFormData] = useState<PostFormData>(initialData || {
    title: '',
    slug: '',
    content: '',
    excerpt: null,
    featured_image_url: null,
    category_ids: [],
    status: 'draft',
    published_at: null,
    meta_title: null,
    meta_description: null,
    meta_keywords: null,
  })

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      // Only auto-generate slug if in create mode or slug is empty
      slug: mode === 'create' || !formData.slug
        ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : formData.slug
    })
  }

  // Handle category toggle
  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId]
    }))
  }

  // Handle status changes with appropriate published_at logic
  const handleStatusChange = (status: 'draft' | 'scheduled' | 'published') => {
    const newFormData = { ...formData, status }

    if (status === 'published' && !formData.published_at) {
      // Publish immediately
      newFormData.published_at = new Date().toISOString()
    } else if (status === 'scheduled' && !formData.published_at) {
      // Default to 1 hour from now for scheduling
      const oneHourFromNow = new Date()
      oneHourFromNow.setHours(oneHourFromNow.getHours() + 1)
      newFormData.published_at = oneHourFromNow.toISOString()
    } else if (status === 'draft') {
      // Clear the published_at for drafts
      newFormData.published_at = null
    }

    setFormData(newFormData)
  }

  // Handle featured image upload
  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError(null)

    try {
      const uploadData = new FormData()
      uploadData.append('file', file)
      if (formData.id) {
        uploadData.append('postId', formData.id)
      }

      const response = await fetch('/api/admin/upload-post-image', {
        method: 'POST',
        body: uploadData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload image')
      }

      setFormData({ ...formData, featured_image_url: result.url })
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  // Remove featured image
  const removeFeaturedImage = () => {
    setFormData({ ...formData, featured_image_url: null })
    if (featuredImageRef.current) {
      featuredImageRef.current.value = ''
    }
  }

  // Generate SEO with AI
  const handleGenerateSeo = async () => {
    if (!formData.title || !formData.content) {
      setError('Please add a title and content before generating SEO')
      return
    }

    setGeneratingSeo(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate SEO')
      }

      setFormData({
        ...formData,
        meta_title: result.meta_title,
        meta_description: result.meta_description,
        meta_keywords: result.meta_keywords
      })
    } catch (err: any) {
      setError(err.message || 'Failed to generate SEO')
    } finally {
      setGeneratingSeo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = mode === 'create' ? '/api/admin/posts' : `/api/admin/posts/${formData.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save post')
      }

      router.push('/admin/posts')
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

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter post title"
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Slug *
          </label>
          <input
            type="text"
            id="slug"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="post-slug"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            URL-friendly version (auto-generated from title)
          </p>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content *
          </label>
          <RichTextEditor
            content={formData.content}
            onChange={(html) => setFormData({ ...formData, content: html })}
            postId={formData.id}
            placeholder="Enter your post content..."
          />
        </div>

        {/* Excerpt */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            rows={3}
            value={formData.excerpt || ''}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value || null })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief summary of the post (optional)"
          />
        </div>

        {/* Categories and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categories
            </label>
            <div className="border border-gray-300 dark:border-gray-700 rounded-md p-3 max-h-48 overflow-y-auto bg-white dark:bg-gray-900">
              {categories.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No categories available</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.category_ids.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {formData.category_ids.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {formData.category_ids.map(id => {
                  const cat = categories.find(c => c.id === id)
                  return cat ? (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded"
                    >
                      {cat.name}
                      <button
                        type="button"
                        onClick={() => handleCategoryToggle(id)}
                        className="hover:text-blue-600 dark:hover:text-blue-100"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ) : null
                })}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status *
            </label>
            <select
              id="status"
              required
              value={formData.status}
              onChange={(e) => handleStatusChange(e.target.value as 'draft' | 'scheduled' | 'published')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Featured Image
          </label>

          {formData.featured_image_url ? (
            <div className="relative inline-block">
              <img
                src={formData.featured_image_url}
                alt="Featured image preview"
                className="max-w-md h-auto rounded-lg border border-gray-300 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={removeFeaturedImage}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
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
                ref={featuredImageRef}
                onChange={handleFeaturedImageUpload}
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
                id="featured-image-upload"
              />
              <label
                htmlFor="featured-image-upload"
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
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload featured image
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      PNG, JPG, GIF, WebP (max 5MB)
                    </span>
                  </>
                )}
              </label>
            </div>
          )}
        </div>

        {/* Published/Scheduled Date */}
        {(formData.status === 'published' || formData.status === 'scheduled') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {formData.status === 'scheduled' ? 'Scheduled For' : 'Published Date'}
            </label>

            {/* Date and Time Inputs */}
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[180px]">
                <label htmlFor="publish_date" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  id="publish_date"
                  value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 10) : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const currentDateTime = formData.published_at ? new Date(formData.published_at) : new Date()
                      const [year, month, day] = e.target.value.split('-').map(Number)
                      currentDateTime.setFullYear(year, month - 1, day)
                      setFormData({ ...formData, published_at: currentDateTime.toISOString() })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-32">
                <label htmlFor="publish_time" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Time</label>
                <input
                  type="time"
                  id="publish_time"
                  value={formData.published_at ? new Date(formData.published_at).toTimeString().slice(0, 5) : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const currentDateTime = formData.published_at ? new Date(formData.published_at) : new Date()
                      const [hours, minutes] = e.target.value.split(':').map(Number)
                      currentDateTime.setHours(hours, minutes, 0, 0)
                      setFormData({ ...formData, published_at: currentDateTime.toISOString() })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Quick Select Buttons */}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, published_at: new Date().toISOString() })}
                className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Now
              </button>
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date()
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  tomorrow.setHours(9, 0, 0, 0)
                  setFormData({ ...formData, published_at: tomorrow.toISOString() })
                }}
                className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Tomorrow 9 AM
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextWeek = new Date()
                  nextWeek.setDate(nextWeek.getDate() + 7)
                  nextWeek.setHours(9, 0, 0, 0)
                  setFormData({ ...formData, published_at: nextWeek.toISOString() })
                }}
                className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Next Week
              </button>
            </div>

            {/* Current Selection Display */}
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Selected:</span>{' '}
                {formData.published_at
                  ? new Date(formData.published_at).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })
                  : 'Not set'}
              </p>
              {formData.status === 'scheduled' && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Current time: {currentTime.toLocaleString()}
                </p>
              )}
            </div>

            {formData.status === 'scheduled' && (
              <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                This post will be automatically published at the scheduled time.
              </p>
            )}
          </div>
        )}
      </div>

      {/* SEO Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SEO Settings</h3>
          <button
            type="button"
            onClick={handleGenerateSeo}
            disabled={generatingSeo || !formData.title || !formData.content}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {generatingSeo ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate with AI
              </>
            )}
          </button>
        </div>

        {/* Meta Title */}
        <div>
          <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Meta Title
          </label>
          <input
            type="text"
            id="meta_title"
            value={formData.meta_title || ''}
            onChange={(e) => setFormData({ ...formData, meta_title: e.target.value || null })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Custom title for search engines (defaults to post title)"
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.meta_title?.length || 0}/60 characters (recommended: 50-60)
          </p>
        </div>

        {/* Meta Description */}
        <div>
          <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Meta Description
          </label>
          <textarea
            id="meta_description"
            rows={3}
            value={formData.meta_description || ''}
            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value || null })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Description for search engines (optional)"
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.meta_description?.length || 0}/160 characters (recommended: 150-160)
          </p>
        </div>

        {/* Meta Keywords */}
        <div>
          <label htmlFor="meta_keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Meta Keywords
          </label>
          <input
            type="text"
            id="meta_keywords"
            value={formData.meta_keywords || ''}
            onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value || null })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="comma, separated, keywords"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Post' : 'Update Post'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
