'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdReportTable } from './AdReportTable'
import { ResourceReportTable } from './ResourceReportTable'
import { exportToCSV, exportToPDF } from '@/lib/utils/export'
import type { AdReportData, ResourceReportData } from '@/lib/queries/reports'

type ReportsDashboardProps = {
  adData: AdReportData[]
  resourceData: ResourceReportData[]
  startDate: string
  endDate: string
}

export function ReportsDashboard({ adData, resourceData, startDate, endDate }: ReportsDashboardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'ads' | 'resources'>(
    (searchParams.get('tab') as 'ads' | 'resources') || 'ads'
  )
  const [localStartDate, setLocalStartDate] = useState(startDate)
  const [localEndDate, setLocalEndDate] = useState(endDate)

  const handleDateChange = () => {
    const params = new URLSearchParams()
    params.set('start', localStartDate)
    params.set('end', localEndDate)
    params.set('tab', activeTab)
    router.push(`/admin/reports?${params.toString()}`)
  }

  const handleTabChange = (tab: 'ads' | 'resources') => {
    setActiveTab(tab)
    const params = new URLSearchParams()
    params.set('start', localStartDate)
    params.set('end', localEndDate)
    params.set('tab', tab)
    router.push(`/admin/reports?${params.toString()}`)
  }

  const handleExportCSV = () => {
    if (activeTab === 'ads') {
      exportToCSV(adData, `ad-report-${startDate}-to-${endDate}`, [
        { key: 'name', label: 'Ad Name' },
        { key: 'ad_zone', label: 'Zone' },
        { key: 'impressions', label: 'Impressions' },
        { key: 'clicks', label: 'Clicks' },
        { key: 'ctr', label: 'CTR (%)' },
      ])
    } else {
      exportToCSV(resourceData, `resource-report-${startDate}-to-${endDate}`, [
        { key: 'name', label: 'Resource Name' },
        { key: 'category', label: 'Category' },
        { key: 'listing_type', label: 'Type' },
        { key: 'impressions', label: 'Impressions' },
        { key: 'clicks', label: 'Clicks' },
        { key: 'ctr', label: 'CTR (%)' },
      ])
    }
  }

  const handleExportPDF = () => {
    const title = activeTab === 'ads' ? 'Ad Performance Report' : 'Resource Performance Report'
    const tableId = activeTab === 'ads' ? 'ad-report-table' : 'resource-report-table'
    exportToPDF(title, tableId, { start: startDate, end: endDate })
  }

  return (
    <div className="space-y-6">
      {/* Date Range Picker */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleDateChange}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('ads')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'ads'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Ad Reports
          </button>
          <button
            onClick={() => handleTabChange('resources')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'resources'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Resource Reports
          </button>
        </nav>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Export PDF
        </button>
      </div>

      {/* Report Tables */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        {activeTab === 'ads' ? (
          <AdReportTable data={adData} />
        ) : (
          <ResourceReportTable data={resourceData} />
        )}
      </div>
    </div>
  )
}
