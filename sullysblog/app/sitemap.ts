import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'https://sullysblog.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/domain-name-dictionary`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/domain-resources`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/store`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Fetch all published blog posts
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const postPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Fetch all dictionary terms
  const { data: terms } = await supabase
    .from('dictionary_terms')
    .select('slug, updated_at, created_at')
    .order('term')

  const termPages: MetadataRoute.Sitemap = (terms || []).map((term) => ({
    url: `${baseUrl}/domain-name-dictionary/${term.slug}`,
    lastModified: new Date(term.updated_at || term.created_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  // Fetch all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at, created_at')

  const categoryPages: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(cat.updated_at || cat.created_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Fetch all active products
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at, created_at')
    .eq('status', 'active')

  const productPages: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${baseUrl}/store/${product.slug}`,
    lastModified: new Date(product.updated_at || product.created_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticPages, ...postPages, ...termPages, ...categoryPages, ...productPages]
}
