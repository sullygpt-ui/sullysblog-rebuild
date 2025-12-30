'use client'

import { useState } from 'react'
import type { Coupon } from '@/lib/queries/coupons'
import type { Product } from '@/lib/queries/products'

type CouponWithProducts = Coupon & {
  coupon_products?: { product_id: string }[]
}

type CouponModalProps = {
  coupon: CouponWithProducts | null
  products: Product[]
  onClose: () => void
  onSave: (coupon: Coupon) => void
}

export function CouponModal({ coupon, products, onClose, onSave }: CouponModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    description: coupon?.description || '',
    discount_type: coupon?.discount_type || 'percentage',
    discount_value: coupon?.discount_value?.toString() || '10',
    max_uses: coupon?.max_uses?.toString() || '',
    max_uses_per_user: coupon?.max_uses_per_user?.toString() || '1',
    starts_at: coupon?.starts_at ? coupon.starts_at.slice(0, 16) : '',
    expires_at: coupon?.expires_at ? coupon.expires_at.slice(0, 16) : '',
    minimum_purchase: coupon?.minimum_purchase?.toString() || '',
    applies_to: coupon?.applies_to || 'all',
    status: coupon?.status || 'active',
  })

  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    coupon?.coupon_products?.map(cp => cp.product_id) || []
  )

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, code: `SAVE-${code}` }))
  }

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value) || 0,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        max_uses_per_user: formData.max_uses_per_user ? parseInt(formData.max_uses_per_user) : null,
        starts_at: formData.starts_at || null,
        expires_at: formData.expires_at || null,
        minimum_purchase: formData.minimum_purchase ? parseFloat(formData.minimum_purchase) : null,
        applies_to: formData.applies_to,
        status: formData.status,
        product_ids: formData.applies_to === 'specific_products' ? selectedProducts : [],
      }

      const url = coupon
        ? `/api/admin/coupons/${coupon.id}`
        : '/api/admin/coupons'

      const method = coupon ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save coupon')
      }

      const savedCoupon = await response.json()
      onSave(savedCoupon)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {coupon ? 'Edit Coupon' : 'Create Coupon'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Code */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Coupon Code</h3>

            <div className="flex gap-2">
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="e.g., SAVE20"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono uppercase"
              />
              <button
                type="button"
                onClick={generateCode}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
              >
                Generate
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="e.g., Holiday sale discount"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Discount */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Discount</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Discount Type
                </label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => handleChange('discount_type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed_amount">Fixed Amount ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Discount Value
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {formData.discount_type === 'percentage' ? '%' : '$'}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.discount_value}
                    onChange={(e) => handleChange('discount_value', e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {formData.discount_type === 'percentage' && parseFloat(formData.discount_value) === 100 && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    100% discount will create a free order (no Stripe payment)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Usage Limits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Usage Limits</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Total Uses
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={(e) => handleChange('max_uses', e.target.value)}
                  placeholder="Unlimited"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Leave empty for unlimited
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Uses Per User
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_uses_per_user}
                  onChange={(e) => handleChange('max_uses_per_user', e.target.value)}
                  placeholder="Unlimited"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Default: 1 use per user
                </p>
              </div>
            </div>
          </div>

          {/* Validity Period */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Validity Period</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.starts_at}
                  onChange={(e) => handleChange('starts_at', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Leave empty to start immediately
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expiration Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => handleChange('expires_at', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Leave empty for no expiration
                </p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Requirements</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Purchase ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.minimum_purchase}
                onChange={(e) => handleChange('minimum_purchase', e.target.value)}
                placeholder="No minimum"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Applies To
              </label>
              <select
                value={formData.applies_to}
                onChange={(e) => handleChange('applies_to', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Products</option>
                <option value="specific_products">Specific Products</option>
              </select>
            </div>

            {formData.applies_to === 'specific_products' && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select products this coupon applies to:
                </p>
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  {products.filter(p => p.status === 'active').map((product) => (
                    <label
                      key={product.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProduct(product.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                        <p className="text-xs text-gray-500">${product.price.toFixed(2)}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {selectedProducts.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Please select at least one product
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Status</h3>

            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (formData.applies_to === 'specific_products' && selectedProducts.length === 0)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
