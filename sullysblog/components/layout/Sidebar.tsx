import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { NewsletterForm } from '@/components/newsletter/NewsletterForm'
import { AdZone } from '@/components/ads/AdZone'

export async function Sidebar() {
  const supabase = await createClient()

  // Fetch all categories except Domain Crossword
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .neq('name', 'Domain Crossword')
    .order('name')

  // Get post count for each category and filter to only those with 1+ posts
  const categoriesWithCounts = (await Promise.all(
    (categories || []).map(async (category) => {
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
  )).filter(category => category.post_count > 0)

  return (
    <aside className="space-y-8">
      {/* Newsletter Signup */}
      <NewsletterForm />

      {/* Ad Zone - Top */}
      <AdZone zone="sidebar_top" />

      {/* Ad Zone - Middle */}
      <AdZone zone="sidebar_middle" />

      {/* Categories */}
      {categoriesWithCounts && categoriesWithCounts.length > 0 && (
        <div className="bg-gray-800 dark:bg-gray-900 rounded-lg shadow p-4">
          <h3 className="text-lg font-bold text-white mb-3">Categories</h3>
          <div className="space-y-1">
            {categoriesWithCounts.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="block py-1.5 px-2 rounded hover:bg-gray-700 transition-colors text-gray-300 hover:text-blue-400 text-sm"
              >
                {category.name}
              </Link>
            ))}
          </div>
          <Link
            href="/blog"
            className="block mt-3 text-center text-blue-400 hover:underline text-sm font-medium"
          >
            Browse All Posts →
          </Link>
        </div>
      )}

      {/* Domaining Banner */}
      <div className="text-center">
        <a href="https://domaining.com" target="_blank" rel="noopener noreferrer">
          {/* Light mode logo */}
          <img
            src="/images/domaining-160x44-banner.gif"
            alt="Domaining.com"
            className="mx-auto dark:hidden"
          />
          {/* Dark mode logo - 50% smaller */}
          <img
            src="/images/domaining-dark.png"
            alt="Domaining.com"
            className="mx-auto hidden dark:block w-1/2"
          />
        </a>
      </div>
    </aside>
  )
}
