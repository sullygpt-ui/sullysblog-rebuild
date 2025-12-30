import { createAdminClient } from '@/lib/supabase/admin'
import { PostForm, PostFormData } from '@/components/admin/PostForm'
import Link from 'next/link'

type Props = {
  searchParams: Promise<{ date?: string }>
}

export default async function NewPostPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = createAdminClient()

  // Fetch categories for the dropdown
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  // If date is provided from calendar, pre-fill the form
  let initialData: Partial<PostFormData> | undefined
  if (params.date) {
    const selectedDate = new Date(params.date + 'T09:00:00')
    const now = new Date()
    const isInFuture = selectedDate > now

    initialData = {
      title: '',
      slug: '',
      content: '',
      excerpt: null,
      featured_image_url: null,
      category_ids: [],
      status: isInFuture ? 'scheduled' : 'draft',
      published_at: selectedDate.toISOString(),
      meta_title: null,
      meta_description: null,
      meta_keywords: null,
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Post</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Write a new blog post
            {params.date && (
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                (Scheduled for {new Date(params.date).toLocaleDateString()})
              </span>
            )}
          </p>
        </div>
        <Link
          href="/admin/posts"
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Back to Posts
        </Link>
      </div>

      <PostForm mode="create" categories={categories || []} initialData={initialData as PostFormData} />
    </div>
  )
}
