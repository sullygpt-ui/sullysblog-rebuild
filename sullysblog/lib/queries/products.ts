import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database'

export type Product = Database['public']['Tables']['products']['Row']
export type ProductFile = Database['public']['Tables']['product_files']['Row']
export type BundleItem = Database['public']['Tables']['bundle_items']['Row']

export type ProductWithFiles = Product & {
  files: ProductFile[]
}

export type ProductWithDetails = Product & {
  files: ProductFile[]
  bundle_items?: (BundleItem & { included_product: Product })[]
}

// Get all products (for admin)
export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data || []
}

// Get active products (for public store)
export async function getActiveProducts(): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching active products:', error)
    return []
  }

  return data || []
}

// Get featured products
export async function getFeaturedProducts(limit: number = 4): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .eq('featured', true)
    .order('display_order', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured products:', error)
    return []
  }

  return data || []
}

// Get product by slug (for product detail page)
export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !product) {
    console.error('Error fetching product:', error)
    return null
  }

  // Get files
  const { data: files } = await supabase
    .from('product_files')
    .select('*')
    .eq('product_id', product.id)
    .order('display_order', { ascending: true })

  // If bundle, get included products
  let bundleItems: (BundleItem & { included_product: Product })[] = []
  if (product.product_type === 'bundle') {
    const { data: items } = await supabase
      .from('bundle_items')
      .select('*')
      .eq('bundle_product_id', product.id)
      .order('display_order', { ascending: true })

    if (items && items.length > 0) {
      const includedIds = items.map(i => i.included_product_id)
      const { data: includedProducts } = await supabase
        .from('products')
        .select('*')
        .in('id', includedIds)

      bundleItems = items.map(item => ({
        ...item,
        included_product: includedProducts?.find(p => p.id === item.included_product_id) as Product
      })).filter(item => item.included_product)
    }
  }

  return {
    ...product,
    files: files || [],
    bundle_items: bundleItems.length > 0 ? bundleItems : undefined
  }
}

// Get product by ID (for admin editing)
export async function getProductById(id: string): Promise<ProductWithDetails | null> {
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    console.error('Error fetching product:', error)
    return null
  }

  // Get files
  const { data: files } = await supabase
    .from('product_files')
    .select('*')
    .eq('product_id', product.id)
    .order('display_order', { ascending: true })

  // If bundle, get included products
  let bundleItems: (BundleItem & { included_product: Product })[] = []
  if (product.product_type === 'bundle') {
    const { data: items } = await supabase
      .from('bundle_items')
      .select('*')
      .eq('bundle_product_id', product.id)
      .order('display_order', { ascending: true })

    if (items && items.length > 0) {
      const includedIds = items.map(i => i.included_product_id)
      const { data: includedProducts } = await supabase
        .from('products')
        .select('*')
        .in('id', includedIds)

      bundleItems = items.map(item => ({
        ...item,
        included_product: includedProducts?.find(p => p.id === item.included_product_id) as Product
      })).filter(item => item.included_product)
    }
  }

  return {
    ...product,
    files: files || [],
    bundle_items: bundleItems.length > 0 ? bundleItems : undefined
  }
}

// Get products by type
export async function getProductsByType(type: Product['product_type']): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .eq('product_type', type)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching products by type:', error)
    return []
  }

  return data || []
}

// Get product files
export async function getProductFiles(productId: string): Promise<ProductFile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('product_files')
    .select('*')
    .eq('product_id', productId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching product files:', error)
    return []
  }

  return data || []
}

// Get non-bundle products (for bundle item selection)
export async function getNonBundleProducts(): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .neq('product_type', 'bundle')
    .eq('status', 'active')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching non-bundle products:', error)
    return []
  }

  return data || []
}

// Get product stats
export async function getProductStats(): Promise<{
  total: number
  active: number
  draft: number
  ebooks: number
  templates: number
  bundles: number
  courses: number
}> {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('status, product_type')

  if (!products) {
    return { total: 0, active: 0, draft: 0, ebooks: 0, templates: 0, bundles: 0, courses: 0 }
  }

  return {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    draft: products.filter(p => p.status === 'draft').length,
    ebooks: products.filter(p => p.product_type === 'ebook').length,
    templates: products.filter(p => p.product_type === 'template').length,
    bundles: products.filter(p => p.product_type === 'bundle').length,
    courses: products.filter(p => p.product_type === 'course').length,
  }
}
