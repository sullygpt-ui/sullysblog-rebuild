import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getCategoryBySlug, getPostsByCategory } from '@/lib/queries/categories'
import { Pagination } from '@/components/ui/Pagination'
import { Sidebar } from '@/components/layout/Sidebar'
import { StickySidebar } from '@/components/layout/StickySidebar'
import { PlaceholderImage } from '@/components/ui/PlaceholderImage'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found'
    }
  }

  const title = `${category.name} - SullysBlog.com`
  const description = category.description || `Browse all posts in the ${category.name} category on SullysBlog.com`

  return {
    title,
    description,
    openGraph: {
      title: category.name,
      description,
      url: `https://sullysblog.com/category/${category.slug}`,
      type: 'website'
    },
    twitter: {
      card: 'summary',
      title: category.name,
      description
    },
    alternates: {
      canonical: `https://sullysblog.com/category/${category.slug}`
    },
    keywords: `${category.name}, domain investing, domain names`
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = parseInt(pageParam || '1', 10)

  // Fetch category
  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  // Fetch posts for this category
  const { posts, totalCount, totalPages } = await getPostsByCategory(category.id, page, 12)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Category Header */}
          <header className="mb-12">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm">
              <ol className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <li>
                  <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
                    Home
                  </Link>
                </li>
                <li>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400">
                    Blog
                  </Link>
                </li>
                <li>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </li>
                <li className="text-gray-900 dark:text-gray-100 font-medium">
                  {category.name}
                </li>
              </ol>
            </nav>

            {/* Category Info */}
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {category.name}
            </h1>

            {category.description && (
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                {category.description}
              </p>
            )}

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
              {totalCount} {totalCount === 1 ? 'post' : 'posts'}
            </p>
          </header>

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No posts found in this category yet.
              </p>
              <Link
                href="/blog"
                className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← Back to all posts
              </Link>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/${post.slug}`}
                    className="group bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    {/* Featured Image */}
                    <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      {post.featured_image_url ? (
                        <Image
                          src={post.featured_image_url}
                          alt={post.title}
                          width={600}
                          height={340}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <PlaceholderImage className="absolute inset-0" />
                      )}
                    </div>

                    {/* Post Info */}
                    <div className="p-4">
                      {/* Title */}
                      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {post.title}
                      </h2>

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                        {post.published_at && (
                          <time dateTime={post.published_at}>
                            {new Date(post.published_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </time>
                        )}

                        {post.view_count > 0 && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {post.view_count.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <Pagination currentPage={page} totalPages={totalPages} basePath={`/category/${category.slug}`} />
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
