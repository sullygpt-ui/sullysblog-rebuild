'use client'

import { useState, useEffect } from 'react'
import type { Coupon } from '@/lib/queries/coupons'
import type { Product } from '@/lib/queries/products'
import { CouponModal } from './CouponModal'

type CouponsManagerProps = {
  initialCoupons: Coupon[]
  initialStats: {
    total: number
    active: number
    inactive: number
    totalDiscountGiven: number
  }
  products: Product[]
}

export function CouponsManager({ initialCoupons, initialStats, products }: CouponsManagerProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons)
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>(initialCoupons)
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [stats, setStats] = useState(initialStats)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    applyFilters(searchTerm, statusFilter, typeFilter)
  }, [coupons, searchTerm, statusFilter, typeFilter])

  const applyFilters = (search: string, status: string, type: string) => {
    let filtered = coupons

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(c =>
        c.code.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower)
      )
    }

    if (status !== 'all') {
      filtered = filtered.filter(c => c.status === status)
    }

    if (type !== 'all') {
      filtered = filtered.filter(c => c.discount_type === type)
    }

    setFilteredCoupons(filtered)
  }

  const handleEdit = async (coupon: Coupon) => {
    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`)
      if (response.ok) {
        const fullCoupon = await response.json()
        setEditingCoupon(fullCoupon)
        setShowModal(true)
      }
    } catch (error) {
      console.error('Error fetching coupon:', error)
      setEditingCoupon(coupon)
      setShowModal(true)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to archive this coupon?')) return

    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCoupons(coupons.filter(c => c.id !== id))
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          active: prev.active - (coupons.find(c => c.id === id)?.status === 'active' ? 1 : 0),
          inactive: prev.inactive - (coupons.find(c => c.id === id)?.status === 'inactive' ? 1 : 0),
        }))
      } else {
        const result = await response.json()
        alert(result.error || 'Failed to archive coupon')
      }
    } catch (error) {
      console.error('Error archiving coupon:', error)
      alert('Error archiving coupon')
    }
  }

  const handleSave = (coupon: Coupon) => {
    const existingIndex = coupons.findIndex(c => c.id === coupon.id)
    let updatedCoupons: Coupon[]

    if (existingIndex >= 0) {
      updatedCoupons = [...coupons]
      const oldCoupon = updatedCoupons[existingIndex]
      updatedCoupons[existingIndex] = coupon

      // Update stats if status changed
      if (oldCoupon.status !== coupon.status) {
        setStats(prev => ({
          ...prev,
          active: prev.active + (coupon.status === 'active' ? 1 : 0) - (oldCoupon.status === 'active' ? 1 : 0),
          inactive: prev.inactive + (coupon.status === 'inactive' ? 1 : 0) - (oldCoupon.status === 'inactive' ? 1 : 0),
        }))
      }
    } else {
      updatedCoupons = [coupon, ...coupons]
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        active: prev.active + (coupon.status === 'active' ? 1 : 0),
        inactive: prev.inactive + (coupon.status === 'inactive' ? 1 : 0),
      }))
    }

    setCoupons(updatedCoupons)
    setShowModal(false)
    setEditingCoupon(null)
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString()
  }

  const isExpired = (coupon: Coupon) => {
    if (!coupon.expires_at) return false
    return new Date(coupon.expires_at) < new Date()
  }

  const getStatusBadge = (coupon: Coupon) => {
    if (coupon.status === 'inactive') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">Inactive</span>
    }
    if (isExpired(coupon)) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">Expired</span>
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">Active</span>
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Coupons</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Inactive</p>
          <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Discounts</p>
          <p className="text-2xl font-bold text-purple-600">${stats.totalDiscountGiven.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="percentage">Percentage</option>
            <option value="fixed_amount">Fixed Amount</option>
          </select>
          <button
            onClick={() => {
              setEditingCoupon(null)
              setShowModal(true)
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            Add Coupon
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Showing {filteredCoupons.length} of {coupons.length} coupons
      </p>

      {/* Coupons Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {coupons.length === 0
                      ? 'No coupons yet. Click "Add Coupon" to create your first coupon.'
                      : 'No coupons match your filters.'}
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                          {coupon.code}
                        </p>
                        {coupon.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{coupon.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}%`
                          : `$${coupon.discount_value.toFixed(2)}`}
                      </span>
                      {coupon.applies_to === 'specific_products' && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Specific products</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {coupon.current_uses}
                        {coupon.max_uses !== null && ` / ${coupon.max_uses}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(coupon)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(coupon.expires_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Archive
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <CouponModal
          coupon={editingCoupon}
          products={products}
          onClose={() => {
            setShowModal(false)
            setEditingCoupon(null)
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
