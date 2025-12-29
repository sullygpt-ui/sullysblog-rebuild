import { createAdminClient } from '@/lib/supabase/admin'
import { PostForm } from '@/components/admin/PostForm'
import Link from 'next/link'

export default async function NewPostPage() {
  const supabase = createAdminClient()

  // Fetch categories for the dropdown
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Post</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Write a new blog post
          </p>
        </div>
        <Link
          href="/admin/posts"
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Back to Posts
        </Link>
      </div>

      <PostForm mode="create" categories={categories || []} />
    </div>
  )
}
