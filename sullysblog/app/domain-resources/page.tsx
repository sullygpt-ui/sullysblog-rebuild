import Link from 'next/link'
import { AdZone } from '@/components/ads/AdZone'
import { ResourceCard } from '@/components/resources/ResourceCard'
import { getResourcesByCategory } from '@/lib/queries/resources'

export const metadata = {
  title: 'Ultimate Domain Name Resource Guide | SullysBlog',
  description: 'Comprehensive list of domain tools, registrars, hosting, marketplaces, and resources for domain investors.',
}

const allCategories = [
  { id: 'registration', name: 'Registration & Hosting', icon: '🌐' },
  { id: 'aftermarket', name: 'Buy / Sell Domains', icon: '💰' },
  { id: 'portfolio', name: 'Portfolio Management', icon: '📊' },
  { id: 'tools', name: 'Domain Tools', icon: '🔧' },
  { id: 'blogs', name: 'Blogs & News', icon: '📰' },
  { id: 'books', name: 'Books', icon: '📚' },
  { id: 'podcasts', name: 'Podcasts', icon: '🎙️' },
  { id: 'newsletters', name: 'Newsletters', icon: '📧' },
  { id: 'forums', name: 'Forums & Communities', icon: '💬' },
  { id: 'conferences', name: 'Conferences & Events', icon: '📅' },
  { id: 'legal', name: 'Legal Resources', icon: '⚖️' },
  { id: 'business', name: 'Business Tools', icon: '💼' },
]

export default async function DomainResourcesPage() {
  const resourcesByCategory = await getResourcesByCategory()
  const hasResources = Object.keys(resourcesByCategory).length > 0
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <div className="bg-gray-800 dark:bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Ultimate Domain Name Resource Guide
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            A comprehensive collection of tools, services, and resources I've used and trusted
            throughout my domain investing journey. Everything listed here has contributed to my
            success or comes highly recommended by colleagues in the industry.
          </p>
          <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <p className="text-sm text-gray-300">
              <strong>Note:</strong> Some links below are affiliate links, meaning I may earn a small
              commission at no cost to you. I only recommend services I trust and use myself.
            </p>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Browse by Category
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {allCategories.map((category) => {
            const hasListings = resourcesByCategory[category.id]?.listings?.length > 0
            return (
              <a
                key={category.id}
                href={`#${category.id}`}
                className={`flex items-center gap-3 p-4 bg-gray-800 dark:bg-gray-900 rounded-lg shadow hover:bg-gray-700 dark:hover:bg-gray-800 hover:shadow-md transition-all ${
                  !hasListings ? 'opacity-50' : ''
                }`}
              >
                <span className="text-3xl">{category.icon}</span>
                <span className="font-semibold text-white">
                  {category.name}
                  {hasListings && (
                    <span className="ml-2 text-sm text-gray-400">
                      ({resourcesByCategory[category.id].listings.length})
                    </span>
                  )}
                </span>
              </a>
            )
          })}
        </div>

        {/* Ad Zone */}
        <div className="mb-12">
          <AdZone zone="resources_top" />
        </div>

        {/* Resources Sections */}
        <div className="space-y-16">
          {!hasResources ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-yellow-900 dark:text-yellow-200 mb-4">
                🚧 Resources Being Added
              </h3>
              <p className="text-yellow-800 dark:text-yellow-300 max-w-2xl mx-auto">
                This page is currently being rebuilt with a new resource management system. Resources
                will be added progressively. Check back soon or{' '}
                <Link href="/blog" className="underline font-semibold hover:text-yellow-600">
                  visit the blog
                </Link>{' '}
                for the latest domain investing tips and strategies.
              </p>
            </div>
          ) : (
            <>
              {/* Render each category with resources */}
              {allCategories.map((category) => {
                const categoryData = resourcesByCategory[category.id]
                if (!categoryData || categoryData.listings.length === 0) {
                  return null
                }

                // Separate by listing type
                const featured = categoryData.listings.filter(r => r.listing_type === 'featured')
                const sponsored = categoryData.listings.filter(r => r.listing_type === 'sponsored')
                const free = categoryData.listings.filter(r => r.listing_type === 'free')

                return (
                  <div key={category.id} id={category.id} className="scroll-mt-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b-4 border-blue-600">
                      {category.icon} {category.name}
                    </h2>

                    <div className="space-y-6">
                      {/* Featured listings */}
                      {featured.map(resource => (
                        <ResourceCard key={resource.id} resource={resource} />
                      ))}

                      {/* Sponsored listings in a grid */}
                      {sponsored.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {sponsored.map(resource => (
                            <ResourceCard key={resource.id} resource={resource} />
                          ))}
                        </div>
                      )}

                      {/* Free listings */}
                      {free.length > 0 && (
                        <div className="bg-gray-800 dark:bg-gray-900 rounded-lg shadow p-6">
                          <h4 className="text-lg font-semibold text-white mb-4">
                            More {category.name}
                          </h4>
                          <div className="space-y-1">
                            {free.map(resource => (
                              <ResourceCard key={resource.id} resource={resource} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
