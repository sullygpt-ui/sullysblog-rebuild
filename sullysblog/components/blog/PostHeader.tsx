import Image from 'next/image'
import Link from 'next/link'
import { PostWithCategories } from '@/lib/queries/posts'
import { PlaceholderImage } from '@/components/ui/PlaceholderImage'

type PostHeaderProps = {
  post: PostWithCategories
}

export function PostHeader({ post }: PostHeaderProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <header className="mb-8">
      {/* Featured Image */}
      {post.featured_image_url ? (
        <div className="w-[75%] mb-6 rounded-lg overflow-hidden mx-auto">
          <Image
            src={post.featured_image_url}
            alt={post.title}
            width={900}
            height={473}
            className="w-full h-auto"
            priority
          />
        </div>
      ) : (
        <div className="w-[75%] mb-6 rounded-lg overflow-hidden mx-auto">
          <PlaceholderImage className="w-full h-64" />
        </div>
      )}

      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {post.title}
      </h1>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        {post.published_at && (
          <time dateTime={post.published_at} className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(post.published_at)}
          </time>
        )}

        {post.categories && post.categories.length > 0 && (
          <>
            <span className="text-gray-400">•</span>
            <div className="flex flex-wrap gap-2">
              {post.categories.map(category => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </>
        )}

        {post.view_count > 0 && (
          <>
            <span className="text-gray-400">•</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {post.view_count.toLocaleString()} views
            </span>
          </>
        )}
      </div>
    </header>
  )
}
