import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPostBySlug, getRelatedPosts } from '@/lib/queries/posts'
import { getCommentsByPostId } from '@/lib/queries/comments'
import { PostHeader } from '@/components/blog/PostHeader'
import { PostContent } from '@/components/blog/PostContent'
import { RelatedPosts } from '@/components/blog/RelatedPosts'
import { CommentList } from '@/components/blog/CommentList'
import { SocialShare } from '@/components/blog/SocialShare'
import { Sidebar } from '@/components/layout/Sidebar'
import { StickySidebar } from '@/components/layout/StickySidebar'
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { AdZone } from '@/components/ads/AdZone'

// Reserved routes that should not be caught by [slug]
const RESERVED_ROUTES = ['test', 'blog', 'domain-name-dictionary', 'api', 'admin']

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  // Check reserved routes
  if (RESERVED_ROUTES.includes(slug)) {
    return {
      title: 'Not Found',
      description: 'Page not found'
    }
  }

  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found'
    }
  }

  const title = post.seo_title || `${post.title} - SullysBlog.com`
  const description = post.seo_description || post.excerpt || `Read ${post.title} on SullysBlog.com`
  const url = `https://sullysblog.com/${post.slug}`
  const categoryNames = post.categories.map(c => c.name).join(', ')
  const keywords = post.seo_keywords || categoryNames || 'Domain Investing'

  return {
    title,
    description,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || undefined,
      images: post.featured_image_url
        ? [
            {
              url: post.featured_image_url,
              width: 1200,
              height: 630,
              alt: post.title
            }
          ]
        : [],
      type: 'article',
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at,
      authors: ['Michael Sullivan'],
      section: post.categories[0]?.name || 'Domain Investing',
      url
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || undefined,
      images: post.featured_image_url ? [post.featured_image_url] : [],
      creator: '@sullysblog'
    },
    alternates: {
      canonical: url
    },
    keywords,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params

  // Check reserved routes
  if (RESERVED_ROUTES.includes(slug)) {
    notFound()
  }

  // Check if user is authenticated (admin)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = !!user

  // Fetch post - allow unpublished if admin
  const post = await getPostBySlug(slug, isAdmin)

  if (!post) {
    notFound()
  }

  // Check if this is a preview (not published)
  const isPreview = post.status !== 'published'

  // Track view only for published posts (fire and forget - don't await)
  if (!isPreview) {
    supabase.rpc('increment_post_views', { post_slug: slug })
  }

  // Get category IDs for related posts
  const categoryIds = post.categories.map(c => c.id)

  // Fetch related data in parallel for performance
  const [relatedPosts, comments] = await Promise.all([
    getRelatedPosts(categoryIds, post.id, 4),
    getCommentsByPostId(post.id)
  ])

  // Check if there are any active sponsor ads
  const { count: sponsorAdsCount } = await supabase
    .from('ads')
    .select('*', { count: 'exact', head: true })
    .in('ad_zone', ['home_sponsor_1', 'home_sponsor_2', 'home_sponsor_3', 'home_sponsor_4'])
    .eq('is_active', true)

  const hasSponsorAds = (sponsorAdsCount ?? 0) > 0

  const baseUrl = 'https://sullysblog.com'
  const primaryCategory = post.categories[0]

  return (
    <>
      {/* Preview Banner */}
      {isPreview && (
        <div className="bg-yellow-500 text-black py-3 px-4 -mx-4 mb-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="font-semibold">Preview Mode</span>
              <span className="text-sm">
                - This post is <strong>{post.status}</strong> and not visible to the public
              </span>
            </div>
          </div>
        </div>
      )}
      <ArticleJsonLd
        title={post.title}
        description={post.seo_description || post.excerpt || post.title}
        url={`${baseUrl}/${post.slug}`}
        imageUrl={post.featured_image_url || undefined}
        datePublished={post.published_at || post.created_at}
        dateModified={post.updated_at}
        authorName="Michael Sullivan"
        categoryName={primaryCategory?.name}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: baseUrl },
          { name: 'Blog', url: `${baseUrl}/blog` },
          ...(primaryCategory ? [{ name: primaryCategory.name, url: `${baseUrl}/category/${primaryCategory.slug}` }] : []),
          { name: post.title, url: `${baseUrl}/${post.slug}` },
        ]}
      />
      {/* Sponsor Ads Section */}
      {hasSponsorAds && (
        <div className="bg-gray-100 dark:bg-gray-900 py-8 -mx-4 px-4 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AdZone zone="home_sponsor_1" />
              <AdZone zone="home_sponsor_2" />
              <AdZone zone="home_sponsor_3" />
              <AdZone zone="home_sponsor_4" />
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Post Header */}
            <PostHeader post={post} />

          {/* Post Content */}
          <PostContent content={post.content} />

          {/* Social Share */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <SocialShare
              url={`${baseUrl}/${post.slug}`}
              title={post.title}
              description={post.excerpt || undefined}
              imageUrl={post.featured_image_url || undefined}
            />
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}

          {/* Comments Section */}
          <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
            <CommentList comments={comments} postId={post.id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <StickySidebar>
            <Sidebar />
          </StickySidebar>
        </div>
      </div>
    </div>
    </>
  )
}
