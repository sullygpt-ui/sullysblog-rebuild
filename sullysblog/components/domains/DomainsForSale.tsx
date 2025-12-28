import Link from 'next/link'
import Image from 'next/image'
import { getFeaturedDomains } from '@/lib/queries/domains'
import { DomainBuyButton } from './DomainBuyButton'

export async function DomainsForSale() {
  const domains = await getFeaturedDomains(5)

  if (!domains || domains.length === 0) {
    return null
  }

  return (
    <div className="bg-gray-800 dark:bg-gray-900 rounded-lg shadow p-4">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
        Domains at Wholesale
      </h3>
      <div className="space-y-3">
        {domains.map((domain) => (
          <div
            key={domain.id}
            className="bg-gray-700 dark:bg-gray-800 rounded-lg p-3 border border-gray-600 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              {domain.image_url && (
                <Image
                  src={domain.image_url}
                  alt={domain.domain_name}
                  width={50}
                  height={50}
                  className="rounded flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white truncate text-sm">
                  {domain.domain_name}
                </p>
                <p className="text-green-400 font-bold text-lg">
                  ${domain.price.toLocaleString()}
                </p>
              </div>
              <DomainBuyButton domain={domain} />
            </div>
            {domain.notes && (
              <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                {domain.notes}
              </p>
            )}
          </div>
        ))}
      </div>
      <Link
        href="/domains-for-sale"
        className="block mt-4 text-center text-blue-400 hover:underline text-sm font-medium"
      >
        View All Domains →
      </Link>
    </div>
  )
}
