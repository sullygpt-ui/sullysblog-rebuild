import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Sidebar } from '@/components/layout/Sidebar'
import { StickySidebar } from '@/components/layout/StickySidebar'
import { PlaceholderImage } from '@/components/ui/PlaceholderImage'
import { WebSiteJsonLd } from '@/components/seo/JsonLd'
import { AdZone } from '@/components/ads/AdZone'

export const metadata: Metadata = {
  title: 'SullysBlog.com - Domain Investing Tips, Strategies & News',
  description: 'Expert insights on domain investing, keyword premium domains, buying and selling domains, valuation strategies, and industry news from Michael Sullivan.',
  keywords: 'domain investing, domain names, premium domains, keyword domains, domain tips, selling domains, domain valuation, domain flipping',
  openGraph: {
    title: 'SullysBlog.com - Domain Investing Tips & Strategies',
    description: 'Expert insights on domain investing, premium domains, and industry news.',
    url: 'https://sullysblog.com',
    siteName: 'SullysBlog.com',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://sullysblog.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SullysBlog.com - Domain Investing Tips',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SullysBlog.com - Domain Investing Tips & Strategies',
    description: 'Expert insights on domain investing, premium domains, and industry news.',
    creator: '@Sullys_Blog',
    images: ['https://sullysblog.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://sullysblog.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function Home() {
  const supabase = await createClient()

  // Fetch recent published posts
  const { data: recentPostsData } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image_url,
      published_at,
      view_count
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(6)

  // Fetch categories for posts via junction table
  const postIds = recentPostsData?.map(p => p.id) || []
  const { data: postCategories } = postIds.length > 0 ? await supabase
    .from('post_categories')
    .select('post_id, category:categories(id, name, slug)')
    .in('post_id', postIds) : { data: null }

  // Build a map of post_id -> categories
  type CategoryInfo = { id: string; name: string; slug: string }
  const categoryMap = new Map<string, CategoryInfo[]>()
  postCategories?.forEach(pc => {
    const existing = categoryMap.get(pc.post_id) || []
    const cat = pc.category as unknown as CategoryInfo | null
    if (cat && cat.id) {
      existing.push(cat)
    }
    categoryMap.set(pc.post_id, existing)
  })

  const recentPosts = recentPostsData?.map(post => ({
    ...post,
    categories: categoryMap.get(post.id) || []
  }))

  // Fetch some featured dictionary terms
  const { data: featuredTerms } = await supabase
    .from('dictionary_terms')
    .select('term, slug, short_definition')
    .order('term')
    .limit(6)

  // Fetch featured products from the store
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('id, name, slug, short_description, price, compare_at_price, cover_image_url, product_type')
    .eq('status', 'active')
    .eq('featured', true)
    .order('display_order')
    .limit(4)

  // Check if there are any active sponsor ads
  const { count: sponsorAdsCount } = await supabase
    .from('ads')
    .select('*', { count: 'exact', head: true })
    .in('ad_zone', ['home_sponsor_1', 'home_sponsor_2', 'home_sponsor_3', 'home_sponsor_4'])
    .eq('is_active', true)

  const hasSponsorAds = (sponsorAdsCount ?? 0) > 0

  return (
    <>
      <WebSiteJsonLd />
      <div className="min-h-screen">
        {/* Sponsor Ads Section */}
      {hasSponsorAds && (
        <div className="bg-gray-100 dark:bg-gray-900 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <AdZone zone="home_sponsor_1" />
              <AdZone zone="home_sponsor_2" />
              <AdZone zone="home_sponsor_3" />
              <AdZone zone="home_sponsor_4" />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Recent Posts */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Domain Insights</h2>
                <Link
                  href="/blog"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  View All →
                </Link>
              </div>

              <div className="grid gap-8">
                {recentPosts?.map((post) => (
                  <article
                    key={post.id}
                    className="bg-gray-800 dark:bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="md:flex md:items-center">
                      <div className="md:w-1/3 flex-shrink-0">
                        {post.featured_image_url ? (
                          <Image
                            src={post.featured_image_url}
                            alt={post.title}
                            width={400}
                            height={300}
                            className="w-full h-auto"
                          />
                        ) : (
                          <PlaceholderImage className="w-full h-48 md:h-full" />
                        )}
                      </div>
                      <div className="p-4 md:py-3 md:w-2/3">
                        {post.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {post.categories.map(category => (
                              <Link
                                key={category.id}
                                href={`/category/${category.slug}`}
                                className="text-sm font-medium text-blue-400 hover:underline"
                              >
                                {category.name}
                              </Link>
                            ))}
                          </div>
                        )}
                        <h3 className="text-2xl font-bold text-white mb-3">
                          <Link href={`/${post.slug}`} className="hover:text-blue-400 transition-colors">
                            {post.title}
                          </Link>
                        </h3>
                        {post.excerpt && (
                          <p className="text-gray-300 mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="text-sm text-gray-400">
                          <time dateTime={post.published_at}>
                            {new Date(post.published_at).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </time>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {(!recentPosts || recentPosts.length === 0) && (
                <div className="text-center py-12 bg-gray-800 dark:bg-gray-900 rounded-lg">
                  <p className="text-gray-300">No posts yet. Check back soon!</p>
                </div>
              )}
            </section>

            {/* Featured Products */}
            {featuredProducts && featuredProducts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Playbooks & Training</h2>
                  <Link
                    href="/store"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    View All →
                  </Link>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {featuredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/store/${product.slug}`}
                      className="bg-gray-800 dark:bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all group"
                    >
                      {product.cover_image_url ? (
                        <div className="w-full h-48 bg-gray-700 flex items-center justify-center overflow-hidden">
                          <Image
                            src={product.cover_image_url}
                            alt={product.name}
                            width={400}
                            height={200}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-400 text-4xl">
                            {product.product_type === 'ebook' ? '📚' : product.product_type === 'template' ? '📄' : product.product_type === 'course' ? '🎓' : '📦'}
                          </span>
                        </div>
                      )}
                      <div className="p-4">
                        <span className="text-xs font-medium text-blue-400 uppercase">
                          {product.product_type}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1 group-hover:text-blue-400 transition-colors">
                          {product.name}
                        </h3>
                        {product.short_description && (
                          <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                            {product.short_description}
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-2">
                          {product.price === 0 ? (
                            <span className="text-green-400 font-bold">Free</span>
                          ) : (
                            <>
                              <span className="text-white font-bold">${product.price}</span>
                              {product.compare_at_price && product.compare_at_price > product.price && (
                                <span className="text-gray-400 line-through text-sm">${product.compare_at_price}</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Featured Dictionary Terms */}
            {featuredTerms && featuredTerms.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Domain Glossary</h2>
                  <Link
                    href="/domain-name-dictionary"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    View All →
                  </Link>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {featuredTerms.map((term) => (
                    <Link
                      key={term.slug}
                      href={`/domain-name-dictionary/${term.slug}`}
                      className="bg-gray-800 dark:bg-gray-900 p-4 rounded-lg shadow hover:shadow-md hover:bg-gray-700 dark:hover:bg-gray-800 transition-all"
                    >
                      <h3 className="font-bold text-lg text-white mb-2">
                        {term.term}
                      </h3>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {term.short_definition}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
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
      </div>
    </>
  )
}
