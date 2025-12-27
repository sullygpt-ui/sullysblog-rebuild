import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database'

type Category = Database['public']['Tables']['categories']['Row']
type Post = Database['public']['Tables']['posts']['Row']

export type PostWithCategory = Post & {
  category: Category | null
}

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
): Promise<{ posts: PostWithCategory[], totalCount: number, totalPages: number }> {
  const supabase = await createClient()

  // Calculate offset
  const offset = (page - 1) * pageSize

  // Get total count for this category
  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId)
    .eq('status', 'published')

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  // Fetch posts
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .eq('category_id', categoryId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (postsError || !posts) {
    return { posts: [], totalCount: 0, totalPages: 0 }
  }

  // Fetch category for each post
  const postsWithCategories: PostWithCategory[] = await Promise.all(
    posts.map(async (post) => {
      let category = null
      if (post.category_id) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', post.category_id)
          .single()
        category = categoryData
      }
      return { ...post, category }
    })
  )

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

  // Get post count for each category
  const categoriesWithCount: CategoryWithCount[] = await Promise.all(
    categories.map(async (category) => {
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
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
