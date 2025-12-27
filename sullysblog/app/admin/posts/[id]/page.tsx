import { createClient } from '@/lib/supabase/server'
import { PostForm, type PostFormData } from '@/components/admin/PostForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch the post
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (!post) {
    notFound()
  }

  // Fetch categories for the dropdown
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  const formData: PostFormData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    featured_image_url: post.featured_image_url,
    category_id: post.category_id,
    status: post.status,
    published_at: post.published_at,
    meta_title: post.meta_title,
    meta_description: post.meta_description,
    meta_keywords: post.meta_keywords,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Post</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Update post details
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${post.slug}`}
            target="_blank"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Preview
          </Link>
          <Link
            href="/admin/posts"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Back to Posts
          </Link>
        </div>
      </div>

      <PostForm mode="edit" initialData={formData} categories={categories || []} />
    </div>
  )
}
