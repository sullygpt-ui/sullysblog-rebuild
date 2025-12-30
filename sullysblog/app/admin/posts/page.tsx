import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { PostsManager } from '@/components/admin/PostsManager'

export default async function PostsPage() {
  const supabase = createAdminClient()

  // Fetch all posts (including drafts and scheduled)
  const { data: postsData } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      status,
      published_at,
      view_count,
      created_at
    `)
    .order('created_at', { ascending: false })

  // Fetch categories for all posts via junction table
  const postIds = postsData?.map(p => p.id) || []
  const { data: postCategories } = postIds.length > 0 ? await supabase
    .from('post_categories')
    .select('post_id, category:categories(id, name)')
    .in('post_id', postIds) : { data: null }

  // Build a map of post_id -> categories
  type CategoryInfo = { id: string; name: string }
  const categoryMap = new Map<string, CategoryInfo[]>()
  postCategories?.forEach(pc => {
    const existing = categoryMap.get(pc.post_id) || []
    const cat = pc.category as unknown as CategoryInfo | null
    if (cat && cat.id) {
      existing.push(cat)
    }
    categoryMap.set(pc.post_id, existing)
  })

  const posts = postsData?.map(post => ({
    ...post,
    categories: categoryMap.get(post.id) || []
  }))

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
