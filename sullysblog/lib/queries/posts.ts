import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database'

type Post = Database['public']['Tables']['posts']['Row']
type Category = Database['public']['Tables']['categories']['Row']

export type PostWithCategory = Post & {
  category: Category | null
}

export async function getPostBySlug(slug: string): Promise<PostWithCategory | null> {
  const supabase = await createClient()

  // Fetch post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (postError || !post) {
    return null
  }

  // Fetch category manually (relationship syntax doesn't work)
  let category = null
  if (post.category_id) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('*')
      .eq('id', post.category_id)
      .single()

    category = categoryData
  }

  return {
    ...post,
    category
  }
}

export async function getRelatedPosts(
  categoryId: string | null,
  currentPostId: string,
  limit: number = 4
): Promise<PostWithCategory[]> {
  if (!categoryId) {
    return []
  }

  const supabase = await createClient()

  // Fetch related posts from same category
  const { data: posts } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, featured_image_url, published_at, category_id')
    .eq('category_id', categoryId)
    .eq('status', 'published')
    .neq('id', currentPostId)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (!posts || posts.length === 0) {
    return []
  }

  // Fetch category for display
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single()

  return posts.map(post => ({
    ...post,
    // Fill in required fields with defaults for the type
    content: '',
    author_id: '',
    status: 'published' as const,
    created_at: post.published_at || new Date().toISOString(),
    updated_at: post.published_at || new Date().toISOString(),
    view_count: 0,
    seo_title: null,
    seo_description: null,
    wordpress_id: null,
    wordpress_url: null,
    category
  }))
}

export async function getAllPosts(
  page: number = 1,
  perPage: number = 12
): Promise<{ posts: PostWithCategory[], total: number }> {
  const supabase = await createClient()
  const offset = (page - 1) * perPage

  // Fetch posts with count
  const { data: posts, count, error } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + perPage - 1)

  if (error || !posts) {
    return { posts: [], total: 0 }
  }

  // Get unique category IDs
  const categoryIds = [...new Set(posts.map(p => p.category_id).filter(Boolean))] as string[]

  // Fetch all categories at once
  let categoryMap = new Map<string, Category>()
  if (categoryIds.length > 0) {
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .in('id', categoryIds)

    if (categories) {
      categoryMap = new Map(categories.map(c => [c.id, c]))
    }
  }

  // Combine posts with categories
  const postsWithCategories = posts.map(post => ({
    ...post,
    category: post.category_id ? (categoryMap.get(post.category_id) || null) : null
  }))

  return {
    posts: postsWithCategories,
    total: count || 0
  }
}
