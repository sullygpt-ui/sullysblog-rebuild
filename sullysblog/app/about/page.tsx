import { Metadata } from 'next'
import { Sidebar } from '@/components/layout/Sidebar'
import { StickySidebar } from '@/components/layout/StickySidebar'
import { getPageBySlug } from '@/lib/queries/pages'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('about')

  return {
    title: `${page?.title || 'About'} - SullysBlog.com`,
    description: page?.meta_description || 'Learn about Sully (Mike Sullivan), a seasoned technology-focused entrepreneur, program management consultant, and writer.',
    openGraph: {
      title: `${page?.title || 'About'} - SullysBlog.com`,
      description: page?.meta_description || 'Learn about Sully (Mike Sullivan), a seasoned technology-focused entrepreneur, program management consultant, and writer.',
      url: 'https://sullysblog.com/about',
      type: 'website'
    },
    alternates: {
      canonical: 'https://sullysblog.com/about'
    }
  }
}

export default async function AboutPage() {
  const page = await getPageBySlug('about')

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            {page?.title || 'About'}
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none prose-p:mb-4 prose-headings:mt-8 prose-headings:mb-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-1">
            {page?.content ? (
              <div dangerouslySetInnerHTML={{ __html: page.content }} />
            ) : (
              <p className="text-gray-700 dark:text-gray-300">Content coming soon...</p>
            )}
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
  )
}
