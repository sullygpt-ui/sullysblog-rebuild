'use client'

import { useState } from 'react'
import type { Resource } from '@/lib/queries/resources'
import { ResourceRow } from './ResourceRow'
import { ResourceModal } from './ResourceModal'

type ResourcesManagerProps = {
  initialResources: Resource[]
}

// Categories sorted alphabetically by label
const CATEGORIES = [
  { value: 'appraisal', label: 'Appraisal & Valuation' },
  { value: 'auctions', label: 'Auctions' },
  { value: 'blogs', label: 'Blogs' },
  { value: 'books', label: 'Books' },
  { value: 'brokers', label: 'Brokers' },
  { value: 'aftermarket', label: 'Buy / Sell Domains' },
  { value: 'business', label: 'Business Tools' },
  { value: 'conferences', label: 'Conferences & Events' },
  { value: 'tools', label: 'Domain Tools' },
  { value: 'escrow', label: 'Escrow Services' },
  { value: 'expired', label: 'Expired / Drops' },
  { value: 'forums', label: 'Forums & Communities' },
  { value: 'hosting', label: 'Hosting & Parking' },
  { value: 'legal', label: 'Legal Resources' },
  { value: 'marketplaces', label: 'Marketplaces' },
  { value: 'news', label: 'News' },
  { value: 'newsletters', label: 'Newsletters' },
  { value: 'podcasts', label: 'Podcasts' },
  { value: 'portfolio', label: 'Portfolio Management' },
  { value: 'registration', label: 'Registration' },
]

export function ResourcesManager({ initialResources }: ResourcesManagerProps) {
  const [resources, setResources] = useState(initialResources)
  const [filteredResources, setFilteredResources] = useState(initialResources)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)

  // Apply filters
  const applyFilters = (search: string, category: string, type: string, status: string) => {
    let filtered = resources

    if (search) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.short_description?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (category !== 'all') {
      filtered = filtered.filter(r => r.category === category)
    }

    if (type !== 'all') {
      filtered = filtered.filter(r => r.listing_type === type)
    }

    if (status !== 'all') {
      filtered = filtered.filter(r => r.status === status)
    }

    setFilteredResources(filtered)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    applyFilters(value, categoryFilter, typeFilter, statusFilter)
  }

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value)
    applyFilters(searchTerm, value, typeFilter, statusFilter)
  }

  const handleTypeChange = (value: string) => {
    setTypeFilter(value)
    applyFilters(searchTerm, categoryFilter, value, statusFilter)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    applyFilters(searchTerm, categoryFilter, typeFilter, value)
  }

  const handleAddNew = () => {
    setEditingResource(null)
    setShowModal(true)
  }

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/resources/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete resource')
      }

      // Refresh the list
      const updatedResources = resources.filter(r => r.id !== id)
      setResources(updatedResources)
      applyFilters(searchTerm, categoryFilter, typeFilter, statusFilter)
    } catch (error) {
      console.error('Error deleting resource:', error)
      alert('Failed to delete resource')
    }
  }

  const handleSave = (resource: Resource) => {
    // Update or add the resource in the list
    const existingIndex = resources.findIndex(r => r.id === resource.id)

    let updatedResources
    if (existingIndex >= 0) {
      updatedResources = [...resources]
      updatedResources[existingIndex] = resource
    } else {
      updatedResources = [resource, ...resources]
    }

    setResources(updatedResources)
    applyFilters(searchTerm, categoryFilter, typeFilter, statusFilter)
    setShowModal(false)
  }

  return (
    <div>
      {/* Filters and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="featured">Featured</option>
            <option value="sponsored">Sponsored</option>
            <option value="free">Free</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="grace_period">Grace Period</option>
            <option value="expired">Expired</option>
            <option value="draft">Draft</option>
          </select>

          {/* Add Button */}
          <button
            onClick={handleAddNew}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            + Add Resource
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{resources.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Featured</div>
            <div className="text-2xl font-bold text-yellow-600">{resources.filter(r => r.listing_type === 'featured').length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sponsored</div>
            <div className="text-2xl font-bold text-blue-600">{resources.filter(r => r.listing_type === 'sponsored').length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Free</div>
            <div className="text-2xl font-bold text-gray-600">{resources.filter(r => r.listing_type === 'free').length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Showing</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{filteredResources.length}</div>
          </div>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fee/Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Expiration
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No resources found
                  </td>
                </tr>
              ) : (
                filteredResources.map(resource => (
                  <ResourceRow
                    key={resource.id}
                    resource={resource}
                    onEdit={() => handleEdit(resource)}
                    onDelete={() => handleDelete(resource.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ResourceModal
          resource={editingResource}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
