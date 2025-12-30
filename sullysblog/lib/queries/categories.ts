import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database'
import { PostWithCategories } from './posts'

type Category = Database['public']['Tables']['categories']['Row']
type Post = Database['public']['Tables']['posts']['Row']

export type CategoryWithCount = Category & {
  post_count: number
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient()

  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !category) {
    return null
  }

  return category
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error || !categories) {
    return []
  }

  return categories
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()

  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !category) {
    return null
  }

  return category
}

export async function getPostsByCategory(
  categoryId: string,
  page: number = 1,
  pageSize: number = 12
): Promise<{ posts: PostWithCategories[], totalCount: number, totalPages: number }> {
  const supabase = await createClient()

  // Calculate offset
  const offset = (page - 1) * pageSize

  // Get post IDs for this category via junction table
  const { data: postCategoryLinks } = await supabase
    .from('post_categories')
    .select('post_id')
    .eq('category_id', categoryId)

  if (!postCategoryLinks || postCategoryLinks.length === 0) {
    return { posts: [], totalCount: 0, totalPages: 0 }
  }

  const postIds = postCategoryLinks.map(pc => pc.post_id)

  // Get total count for this category
  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .in('id', postIds)
    .eq('status', 'published')

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  // Fetch posts
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .in('id', postIds)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (postsError || !posts) {
    return { posts: [], totalCount: 0, totalPages: 0 }
  }

  // Load all categories for these posts
  const postIdsForCategories = posts.map(p => p.id)
  const { data: allPostCategories } = await supabase
    .from('post_categories')
    .select('post_id, category_id')
    .in('post_id', postIdsForCategories)

  // Get unique category IDs
  const allCategoryIds = [...new Set((allPostCategories || []).map(pc => pc.category_id))]

  // Fetch all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .in('id', allCategoryIds)

  const categoryMap = new Map((categories || []).map(c => [c.id, c]))

  // Build map of post_id -> categories
  const postCategoriesMap = new Map<string, Category[]>()
  for (const pc of (allPostCategories || [])) {
    const category = categoryMap.get(pc.category_id)
    if (category) {
      if (!postCategoriesMap.has(pc.post_id)) {
        postCategoriesMap.set(pc.post_id, [])
      }
      postCategoriesMap.get(pc.post_id)!.push(category)
    }
  }

  // Sort categories by name for each post
  for (const [postId, cats] of postCategoriesMap) {
    postCategoriesMap.set(postId, cats.sort((a, b) => a.name.localeCompare(b.name)))
  }

  const postsWithCategories: PostWithCategories[] = posts.map(post => ({
    ...post,
    categories: postCategoriesMap.get(post.id) || []
  }))

  return {
    posts: postsWithCategories,
    totalCount,
    totalPages
  }
}

export async function getCategoriesWithPostCount(): Promise<CategoryWithCount[]> {
  const supabase = await createClient()

  // Get all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (!categories) {
    return []
  }

  // Get post count for each category via junction table
  const categoriesWithCount: CategoryWithCount[] = await Promise.all(
    categories.map(async (category) => {
      // Get post IDs for this category
      const { data: postCategoryLinks } = await supabase
        .from('post_categories')
        .select('post_id')
        .eq('category_id', category.id)

      if (!postCategoryLinks || postCategoryLinks.length === 0) {
        return { ...category, post_count: 0 }
      }

      const postIds = postCategoryLinks.map(pc => pc.post_id)

      // Count published posts
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .in('id', postIds)
        .eq('status', 'published')

      return {
        ...category,
        post_count: count || 0
      }
    })
  )

  // Filter out categories with no posts
  return categoriesWithCount.filter(cat => cat.post_count > 0)
}
