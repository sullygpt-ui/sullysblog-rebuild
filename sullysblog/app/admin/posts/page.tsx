import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

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
    .order('created_at', { ascending: false })

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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Posts</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {posts?.length || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {posts?.filter(p => p.status === 'published').length || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {posts?.filter(p => p.status === 'scheduled').length || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Draft</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {posts?.filter(p => p.status === 'draft').length || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {posts?.reduce((sum, p) => sum + (p.view_count || 0), 0).toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Published</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {posts?.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 max-w-md">
                      {post.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {post.category?.[0] ? (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {post.category[0].name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">No category</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      post.status === 'published'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : post.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                    {post.view_count?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {post.status === 'scheduled' && post.published_at ? (
                      <span className="text-blue-600 dark:text-blue-400">
                        {new Date(post.published_at).toLocaleString()}
                      </span>
                    ) : post.published_at ? (
                      new Date(post.published_at).toLocaleDateString()
                    ) : (
                      'Not published'
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-3">
                    <Link
                      href={`/${post.slug}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      target="_blank"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="text-green-600 dark:text-green-400 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
