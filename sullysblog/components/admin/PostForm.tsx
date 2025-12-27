'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RichTextEditor } from '@/components/editor/RichTextEditor'

export type PostFormData = {
  id?: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  featured_image_url: string | null
  category_id: string | null
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
    category_id: null,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      if (mode === 'create') {
        const { error: insertError } = await supabase
          .from('posts')
          .insert([formData])

        if (insertError) throw insertError
      } else {
        const { error: updateError } = await supabase
          .from('posts')
          .update(formData)
          .eq('id', formData.id!)

        if (updateError) throw updateError
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

        {/* Category and Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              id="category_id"
              value={formData.category_id || ''}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

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
            <label htmlFor="published_at" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {formData.status === 'scheduled' ? 'Scheduled For' : 'Published Date'}
            </label>
            <input
              type="datetime-local"
              id="published_at"
              value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData({ ...formData, published_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.status === 'scheduled' && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current time: <span className="font-medium text-gray-700 dark:text-gray-300">{currentTime.toLocaleString()}</span>
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  This post will be automatically published at the scheduled time.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SEO Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SEO Settings</h3>

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
