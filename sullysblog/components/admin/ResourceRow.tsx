'use client'

import type { Resource } from '@/lib/queries/resources'

type ResourceRowProps = {
  resource: Resource
  onEdit: () => void
  onDelete: () => void
}

// Category labels for display (alphabetical order)
const CATEGORY_LABELS: Record<string, string> = {
  'appraisal': 'Appraisal',
  'auctions': 'Auctions',
  'blogs': 'Blogs',
  'books': 'Books',
  'brokers': 'Brokers',
  'aftermarket': 'Buy/Sell',
  'business': 'Business',
  'conferences': 'Conferences',
  'tools': 'Domain Tools',
  'escrow': 'Escrow',
  'expired': 'Expired/Drops',
  'forums': 'Forums',
  'hosting': 'Hosting/Parking',
  'legal': 'Legal',
  'marketplaces': 'Marketplaces',
  'news': 'News',
  'newsletters': 'Newsletters',
  'podcasts': 'Podcasts',
  'portfolio': 'Portfolio',
  'registration': 'Registration',
}

export function ResourceRow({ resource, onEdit, onDelete }: ResourceRowProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'featured':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'sponsored':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'grace_period':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getDaysUntilExpiration = (endDate: string | null) => {
    if (!endDate) return null
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilExpiration = getDaysUntilExpiration(resource.end_date)

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {resource.logo_url && (
            <img
              src={resource.logo_url}
              alt={resource.name}
              className="w-10 h-10 object-contain rounded bg-gray-100 dark:bg-gray-800 p-1"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {resource.name}
            </div>
            {resource.short_description && (
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {resource.short_description}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
        {CATEGORY_LABELS[resource.category] || resource.category}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(resource.listing_type)}`}>
          {resource.listing_type}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(resource.status)}`}>
          {resource.status.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
        {resource.monthly_fee > 0 ? `$${resource.monthly_fee.toFixed(2)}` : '—'}
      </td>
      <td className="px-6 py-4 text-sm">
        {resource.end_date ? (
          <div>
            <div className="text-gray-900 dark:text-white">{formatDate(resource.end_date)}</div>
            {daysUntilExpiration !== null && (
              <div className={`text-xs ${
                daysUntilExpiration < 0
                  ? 'text-red-600 dark:text-red-400'
                  : daysUntilExpiration < 7
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {daysUntilExpiration < 0
                  ? `Expired ${Math.abs(daysUntilExpiration)}d ago`
                  : daysUntilExpiration === 0
                  ? 'Expires today'
                  : `${daysUntilExpiration}d remaining`}
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">—</span>
        )}
      </td>
      <td className="px-6 py-4 text-right text-sm">
        <div className="flex items-center justify-end gap-2">
          <a
            href={`/go/${resource.redirect_slug}`}
            target="_blank"
            rel="noopener"
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            title="Test redirect"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            onClick={onEdit}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}
