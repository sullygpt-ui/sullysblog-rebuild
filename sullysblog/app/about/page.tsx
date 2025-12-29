import { Metadata } from 'next'
import { Sidebar } from '@/components/layout/Sidebar'
import { StickySidebar } from '@/components/layout/StickySidebar'
import { getPageBySlug } from '@/lib/queries/pages'
import { AdZone } from '@/components/ads/AdZone'
import { createClient } from '@/lib/supabase/server'

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

  // Check if there are any active sponsor ads
  const supabase = await createClient()
  const { count: sponsorAdsCount } = await supabase
    .from('ads')
    .select('*', { count: 'exact', head: true })
    .in('ad_zone', ['home_sponsor_1', 'home_sponsor_2', 'home_sponsor_3', 'home_sponsor_4'])
    .eq('is_active', true)

  const hasSponsorAds = (sponsorAdsCount ?? 0) > 0

  return (
    <>
      {/* Sponsor Ads Section */}
      {hasSponsorAds && (
        <div className="bg-gray-100 dark:bg-gray-900 py-8 -mx-4 px-4 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AdZone zone="home_sponsor_1" />
              <AdZone zone="home_sponsor_2" />
              <AdZone zone="home_sponsor_3" />
              <AdZone zone="home_sponsor_4" />
            </div>
          </div>
        </div>
      )}
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
