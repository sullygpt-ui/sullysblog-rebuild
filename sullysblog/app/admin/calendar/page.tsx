import { Metadata } from 'next'
import { getPostsForCalendar } from '@/lib/queries/posts'
import { PostCalendar } from '@/components/admin/PostCalendar'

export const metadata: Metadata = {
  title: 'Content Calendar - Admin | SullysBlog',
}

export default async function AdminCalendarPage() {
  const posts = await getPostsForCalendar()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Calendar</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and manage your blog posts by date
        </p>
      </div>

      <PostCalendar posts={posts} />
    </div>
  )
}
