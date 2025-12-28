import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PostsManager } from '@/components/admin/PostsManager'

export default async function PostsPage() {
  const supabase = await createClient()

  // Fetch all posts with categories
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      status,
      published_at,
      view_count,
      created_at,
      category:categories(name)
    `)
    .order('published_at', { ascending: false, nullsFirst: false })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Posts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your blog posts
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Post
        </Link>
      </div>

      <PostsManager initialPosts={posts || []} />
    </div>
  )
}
