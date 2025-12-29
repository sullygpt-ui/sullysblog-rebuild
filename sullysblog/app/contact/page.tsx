import { Metadata } from 'next'
import { ContactForm } from './ContactForm'
import { getPageBySlug } from '@/lib/queries/pages'
import { AdZone } from '@/components/ads/AdZone'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('contact')

  return {
    title: `${page?.title || 'Contact'} - SullysBlog.com`,
    description: page?.meta_description || 'Get in touch with Mike Sullivan. Questions about domain investing, partnership inquiries, or just want to say hello.',
    openGraph: {
      title: `${page?.title || 'Contact'} - SullysBlog.com`,
      description: page?.meta_description || 'Get in touch with Mike Sullivan',
      url: 'https://sullysblog.com/contact',
      type: 'website'
    },
    alternates: {
      canonical: 'https://sullysblog.com/contact'
    }
  }
}

export default async function ContactPage() {
  const page = await getPageBySlug('contact')

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
      <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {page?.title || 'Get In Touch'}
        </h1>
        {page?.content ? (
          <div
            className="prose prose-lg dark:prose-invert max-w-none prose-p:mb-4 text-gray-600 dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Have a question about domain investing? Want to collaborate? Just want to say hello? I'd love to hear from you.
          </p>
        )}
      </div>

      {/* Social Links */}
      <div className="flex justify-center gap-6 mb-10">
        <a
          href="https://x.com/Sullys_Blog"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity font-medium"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Follow on X
        </a>
        <a
          href="https://www.linkedin.com/in/mike-sullivan-7a1204396/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-[#0077B5] text-white rounded-lg hover:opacity-80 transition-opacity font-medium"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          Connect on LinkedIn
        </a>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-10">
        <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
        <span className="text-gray-500 dark:text-gray-400 text-sm">or send a message</span>
        <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
      </div>

      {/* Contact Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <ContactForm />
      </div>
    </div>
    </>
  )
}
