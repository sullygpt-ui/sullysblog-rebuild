import Link from 'next/link'
import Image from 'next/image'
import { PostWithCategory } from '@/lib/queries/posts'
import { PlaceholderImage } from '@/components/ui/PlaceholderImage'

type RelatedPostsProps = {
  posts: PostWithCategory[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <aside className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Related Posts</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {posts.map(post => (
          <Link
            key={post.id}
            href={`/${post.slug}`}
            className="group"
          >
            {/* Small Thumbnail */}
            <div className="w-full aspect-video rounded overflow-hidden mb-2 bg-gray-100 dark:bg-gray-800">
              {post.featured_image_url ? (
                <Image
                  src={post.featured_image_url}
                  alt={post.title}
                  width={200}
                  height={112}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <PlaceholderImage className="w-full h-full" />
              )}
            </div>

            {/* Title only */}
            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>
        ))}
      </div>
    </aside>
  )
}
