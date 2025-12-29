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
      section: post.category?.name || 'Domain Investing',
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
    keywords: post.category?.name,
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

  // Fetch post
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // Track view (fire and forget - don't await)
  const supabase = await createClient()
  supabase.rpc('increment_post_views', { post_slug: slug })

  // Fetch related data in parallel for performance
  const [relatedPosts, comments] = await Promise.all([
    getRelatedPosts(post.category_id, post.id, 4),
    getCommentsByPostId(post.id)
  ])

  const baseUrl = 'https://sullysblog.com'

  return (
    <>
      <ArticleJsonLd
        title={post.title}
        description={post.seo_description || post.excerpt || post.title}
        url={`${baseUrl}/${post.slug}`}
        imageUrl={post.featured_image_url || undefined}
        datePublished={post.published_at || post.created_at}
        dateModified={post.updated_at}
        authorName="Michael Sullivan"
        categoryName={post.category?.name}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: baseUrl },
          { name: 'Blog', url: `${baseUrl}/blog` },
          ...(post.category ? [{ name: post.category.name, url: `${baseUrl}/category/${post.category.slug}` }] : []),
          { name: post.title, url: `${baseUrl}/${post.slug}` },
        ]}
      />
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
