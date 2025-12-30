import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database'

type Post = Database['public']['Tables']['posts']['Row']
type Category = Database['public']['Tables']['categories']['Row']

export type PostWithCategories = Post & {
  categories: Category[]
}

// Helper to load categories for a post via junction table
async function loadCategoriesForPost(supabase: any, postId: string): Promise<Category[]> {
  const { data: postCategories } = await supabase
    .from('post_categories')
    .select('category_id')
    .eq('post_id', postId)

  if (!postCategories || postCategories.length === 0) {
    return []
  }

  const categoryIds = postCategories.map((pc: any) => pc.category_id)
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .in('id', categoryIds)
    .order('name')

  return categories || []
}

// Helper to batch load categories for multiple posts
async function loadCategoriesForPosts(supabase: any, postIds: string[]): Promise<Map<string, Category[]>> {
  if (postIds.length === 0) {
    return new Map()
  }

  // Get all post_categories for these posts
  const { data: postCategories } = await supabase
    .from('post_categories')
    .select('post_id, category_id')
    .in('post_id', postIds)

  if (!postCategories || postCategories.length === 0) {
    return new Map()
  }

  // Get unique category IDs
  const categoryIds = [...new Set(postCategories.map((pc: any) => pc.category_id))]

  // Fetch all categories at once
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .in('id', categoryIds)

  if (!categoriesData) {
    return new Map()
  }

  const categories = categoriesData as Category[]
  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  // Build map of post_id -> categories
  const result = new Map<string, Category[]>()
  for (const pc of postCategories) {
    const category = categoryMap.get(pc.category_id)
    if (category) {
      if (!result.has(pc.post_id)) {
        result.set(pc.post_id, [])
      }
      result.get(pc.post_id)!.push(category)
    }
  }

  // Sort categories by name for each post
  for (const [postId, cats] of result) {
    result.set(postId, cats.sort((a, b) => a.name.localeCompare(b.name)))
  }

  return result
}

export async function getPostBySlug(slug: string, allowUnpublished: boolean = false): Promise<PostWithCategories | null> {
  const supabase = await createClient()

  // Fetch post
  let query = supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)

  // Only filter by published status if not allowing unpublished
  if (!allowUnpublished) {
    query = query.eq('status', 'published')
  }

  const { data: post, error: postError } = await query.single()

  if (postError || !post) {
    return null
  }

  // Fetch categories via junction table
  const categories = await loadCategoriesForPost(supabase, post.id)

  return {
    ...post,
    categories
  }
}

export async function getRelatedPosts(
  categoryIds: string[],
  currentPostId: string,
  limit: number = 4
): Promise<PostWithCategories[]> {
  if (!categoryIds || categoryIds.length === 0) {
    return []
  }

  const supabase = await createClient()

  // Find posts that share any of the same categories
  const { data: relatedPostCategories } = await supabase
    .from('post_categories')
    .select('post_id')
    .in('category_id', categoryIds)
    .neq('post_id', currentPostId)

  if (!relatedPostCategories || relatedPostCategories.length === 0) {
    return []
  }

  // Get unique post IDs
  const postIds = [...new Set(relatedPostCategories.map((pc: any) => pc.post_id))]

  // Fetch related posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .in('id', postIds)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (!posts || posts.length === 0) {
    return []
  }

  // Load categories for these posts
  const categoriesMap = await loadCategoriesForPosts(supabase, posts.map(p => p.id))

  return posts.map(post => ({
    ...post,
    categories: categoriesMap.get(post.id) || []
  }))
}

export async function getAllPosts(
  page: number = 1,
  perPage: number = 12
): Promise<{ posts: PostWithCategories[], total: number }> {
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

  // Load categories for all posts
  const categoriesMap = await loadCategoriesForPosts(supabase, posts.map(p => p.id))

  // Combine posts with categories
  const postsWithCategories = posts.map(post => ({
    ...post,
    categories: categoriesMap.get(post.id) || []
  }))

  return {
    posts: postsWithCategories,
    total: count || 0
  }
}
