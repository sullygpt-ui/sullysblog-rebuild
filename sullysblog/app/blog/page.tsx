import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAllPosts } from '@/lib/queries/posts'
import { Pagination } from '@/components/ui/Pagination'
import { Sidebar } from '@/components/layout/Sidebar'
import { StickySidebar } from '@/components/layout/StickySidebar'
import { PlaceholderImage } from '@/components/ui/PlaceholderImage'

export const metadata: Metadata = {
  title: 'Blog - Domain Investing Tips and News | SullysBlog.com',
  description: 'Expert insights on domain investing, keyword premium domains, domain tips, selling domains, and generic domains.',
  openGraph: {
    title: 'Blog - SullysBlog.com',
    description: 'Domain investing tips, strategies, and industry news',
    url: 'https://sullysblog.com/blog',
    type: 'website'
  },
  alternates: {
    canonical: 'https://sullysblog.com/blog'
  }
}

type Props = {
  searchParams: Promise<{ page?: string }>
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const perPage = 12

  const { posts, total } = await getAllPosts(page, perPage)
  const totalPages = Math.ceil(total / perPage)

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
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Blog</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Domain investing tips, strategies, and industry news
            </p>
            {total > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Showing {((page - 1) * perPage) + 1}-{Math.min(page * perPage, total)} of {total} posts
              </p>
            )}
          </div>

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
              <svg
                className="w-20 h-20 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No posts yet</h2>
              <p className="text-gray-500 dark:text-gray-400">Check back soon for new content!</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/${post.slug}`}
                    className="group bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    {/* Featured Image */}
                    {post.featured_image_url ? (
                      <div className="w-full aspect-[16/9] bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <Image
                          src={post.featured_image_url}
                          alt={post.title}
                          width={600}
                          height={340}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <PlaceholderImage className="w-full h-48" />
                    )}

                    {/* Post Info */}
                    <div className="p-4">
                      {/* Category Badges */}
                      {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {post.categories.map(category => (
                            <span
                              key={category.id}
                              className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full"
                            >
                              {category.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Title */}
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Meta */}
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {post.published_at && (
                          <time dateTime={post.published_at} className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(post.published_at)}
                          </time>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <Pagination currentPage={page} totalPages={totalPages} basePath="/blog" />
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <StickySidebar>
            <Sidebar />
          </StickySidebar>
        </div>
      </div>
    </div>
  )
}
