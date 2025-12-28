import { Metadata } from 'next'
import Image from 'next/image'
import { getActiveDomains } from '@/lib/queries/domains'
import { DomainBuyButton } from '@/components/domains/DomainBuyButton'

export const metadata: Metadata = {
  title: 'Domains for Sale - SullysBlog.com',
  description: 'Premium domain names for sale. Buy high-quality domain names for your business or investment.',
  openGraph: {
    title: 'Domains for Sale - SullysBlog.com',
    description: 'Premium domain names for sale. Buy high-quality domain names for your business or investment.',
    url: 'https://sullysblog.com/domains-for-sale',
    type: 'website'
  },
  alternates: {
    canonical: 'https://sullysblog.com/domains-for-sale'
  }
}

export default async function DomainsForSalePage() {
  const domains = await getActiveDomains()

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Domains for Sale
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Premium domain names available for immediate purchase.
          Secure checkout powered by Stripe.
        </p>
      </div>

      {/* Domains List */}
      {domains.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No domains available
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Check back soon for new listings!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <div
              key={domain.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  {domain.image_url && (
                    <Image
                      src={domain.image_url}
                      alt={domain.domain_name}
                      width={50}
                      height={50}
                      className="rounded flex-shrink-0"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {domain.domain_name}
                      </h2>
                      {domain.is_highlighted && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full font-semibold">
                          Featured
                        </span>
                      )}
                    </div>
                    {domain.notes && (
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {domain.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      ${domain.price.toLocaleString()}
                    </p>
                  </div>
                  <DomainBuyButton domain={domain} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          How It Works
        </h3>
        <ul className="space-y-2 text-blue-800 dark:text-blue-200">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Click "Buy Now" to securely purchase through Stripe
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Domain transfer initiated within 24 hours of payment
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Full support throughout the transfer process
          </li>
        </ul>
      </div>

      {/* Contact */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Have questions about a domain?{' '}
          <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Contact me
          </a>
        </p>
      </div>
    </div>
  )
}
