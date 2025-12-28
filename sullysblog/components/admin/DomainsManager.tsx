'use client'

import { useState } from 'react'
import type { DomainForSale } from '@/lib/queries/domains'
import { DomainModal } from './DomainModal'

type DomainsManagerProps = {
  initialDomains: DomainForSale[]
}

export function DomainsManager({ initialDomains }: DomainsManagerProps) {
  const [domains, setDomains] = useState<DomainForSale[]>(initialDomains)
  const [editingDomain, setEditingDomain] = useState<DomainForSale | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const filteredDomains = domains.filter(d => {
    if (filter === 'all') return true
    if (filter === 'active') return d.is_active
    if (filter === 'inactive') return !d.is_active
    return true
  })

  const handleAdd = () => {
    setEditingDomain(null)
    setIsModalOpen(true)
  }

  const handleEdit = (domain: DomainForSale) => {
    setEditingDomain(domain)
    setIsModalOpen(true)
  }

  const handleSave = (savedDomain: DomainForSale) => {
    if (editingDomain) {
      setDomains(prev => prev.map(d => d.id === savedDomain.id ? savedDomain : d))
    } else {
      setDomains(prev => [savedDomain, ...prev])
    }
    setIsModalOpen(false)
    setEditingDomain(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this domain?')) return

    try {
      const response = await fetch(`/api/admin/domains/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setDomains(prev => prev.filter(d => d.id !== id))
      }
    } catch (error) {
      console.error('Error deleting domain:', error)
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Domains for Sale ({domains.length})
          </h2>
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 text-sm rounded-full capitalize ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Domain
        </button>
      </div>

      {/* Table */}
      {filteredDomains.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No domains found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDomains.map((domain) => (
                <tr key={domain.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {domain.domain_name}
                      </span>
                      {domain.is_highlighted && (
                        <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                          Highlighted
                        </span>
                      )}
                    </div>
                    {domain.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {domain.notes}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                    ${domain.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(domain.is_active)}`}>
                      {domain.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {domain.paypal_link ? 'External Link' : 'Stripe'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(domain)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(domain.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <DomainModal
          domain={editingDomain}
          onClose={() => {
            setIsModalOpen(false)
            setEditingDomain(null)
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
