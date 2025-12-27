'use client'

import { useState } from 'react'
import Link from 'next/link'

type Sponsor = {
  id: string
  name: string
  category: string
  listing_type: 'sponsored' | 'featured'
  monthly_fee: number
  start_date: string | null
  end_date: string | null
  status: string
  total_revenue: number
  totalClicks: number
  recentClicks: number
  daysUntilExpiration: number | null
}

type SponsorsManagerProps = {
  sponsors: Sponsor[]
}

export function SponsorsManager({ sponsors }: SponsorsManagerProps) {
  const [filter, setFilter] = useState<'all' | 'featured' | 'sponsored' | 'expiring'>('all')

  const filteredSponsors = sponsors.filter(sponsor => {
    if (filter === 'all') return true
    if (filter === 'expiring') {
      return sponsor.daysUntilExpiration !== null && sponsor.daysUntilExpiration <= 30
    }
    return sponsor.listing_type === filter
  })

  const totalMonthlyRevenue = sponsors
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.monthly_fee, 0)

  const totalAnnualRevenue = totalMonthlyRevenue * 12

  const expiringCount = sponsors.filter(
    s => s.daysUntilExpiration !== null && s.daysUntilExpiration <= 30
  ).length

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Sponsors</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{sponsors.length}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Revenue</div>
          <div className="text-3xl font-bold text-green-600">${totalMonthlyRevenue.toFixed(2)}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Annual Revenue</div>
          <div className="text-3xl font-bold text-blue-600">${totalAnnualRevenue.toFixed(2)}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expiring Soon</div>
          <div className="text-3xl font-bold text-orange-600">{expiringCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All ({sponsors.length})
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'featured'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Featured ({sponsors.filter(s => s.listing_type === 'featured').length})
          </button>
          <button
            onClick={() => setFilter('sponsored')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'sponsored'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Sponsored ({sponsors.filter(s => s.listing_type === 'sponsored').length})
          </button>
          <button
            onClick={() => setFilter('expiring')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'expiring'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Expiring Soon ({expiringCount})
          </button>
        </div>
      </div>

      {/* Sponsors List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSponsors.map(sponsor => (
          <SponsorCard key={sponsor.id} sponsor={sponsor} />
        ))}
      </div>

      {filteredSponsors.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-500 dark:text-gray-400">
          No sponsors found in this category
        </div>
      )}
    </div>
  )
}

function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const getStatusColor = (daysUntilExpiration: number | null) => {
    if (daysUntilExpiration === null) return 'text-gray-600'
    if (daysUntilExpiration < 0) return 'text-red-600'
    if (daysUntilExpiration <= 7) return 'text-orange-600'
    if (daysUntilExpiration <= 30) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getStatusText = (daysUntilExpiration: number | null) => {
    if (daysUntilExpiration === null) return 'No expiration'
    if (daysUntilExpiration < 0) return `Expired ${Math.abs(daysUntilExpiration)}d ago`
    if (daysUntilExpiration === 0) return 'Expires today'
    return `${daysUntilExpiration}d remaining`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {sponsor.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              sponsor.listing_type === 'featured'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }`}>
              {sponsor.listing_type}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {sponsor.category}
            </span>
          </div>
        </div>
        <Link
          href={`/admin/resources`}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{sponsor.totalClicks}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Last 30 Days</div>
          <div className="text-2xl font-bold text-blue-600">{sponsor.recentClicks}</div>
        </div>
      </div>

      {/* Revenue & Expiration */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Fee</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            ${sponsor.monthly_fee.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
          <span className="text-sm font-semibold text-green-600">
            ${sponsor.total_revenue.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Start Date</span>
          <span className="text-sm text-gray-900 dark:text-white">
            {formatDate(sponsor.start_date)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">End Date</span>
          <span className="text-sm text-gray-900 dark:text-white">
            {formatDate(sponsor.end_date)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
          <span className={`text-sm font-bold ${getStatusColor(sponsor.daysUntilExpiration)}`}>
            {getStatusText(sponsor.daysUntilExpiration)}
          </span>
        </div>
      </div>
    </div>
  )
}
