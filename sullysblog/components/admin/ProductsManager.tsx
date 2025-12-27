'use client'

import { useState, useEffect } from 'react'
import type { Product } from '@/lib/queries/products'
import { ProductRow } from './ProductRow'
import { ProductModal } from './ProductModal'

type ProductsManagerProps = {
  initialProducts: Product[]
}

export function ProductsManager({ initialProducts }: ProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    applyFilters(searchTerm, typeFilter, statusFilter)
  }, [products, searchTerm, typeFilter, statusFilter])

  const applyFilters = (search: string, type: string, status: string) => {
    let filtered = products

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.slug.toLowerCase().includes(searchLower) ||
        p.short_description?.toLowerCase().includes(searchLower)
      )
    }

    if (type !== 'all') {
      filtered = filtered.filter(p => p.product_type === type)
    }

    if (status !== 'all') {
      filtered = filtered.filter(p => p.status === status)
    }

    setFilteredProducts(filtered)
  }

  const handleEdit = async (product: Product) => {
    // Fetch full product details including files and bundle items
    try {
      const response = await fetch(`/api/admin/products/${product.id}`)
      if (response.ok) {
        const fullProduct = await response.json()
        setEditingProduct(fullProduct)
        setShowModal(true)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setEditingProduct(product)
      setShowModal(true)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok) {
        if (result.archived) {
          // Product was archived instead of deleted
          alert('This product has orders and was archived instead of deleted.')
          // Update the product status in the list
          setProducts(products.map(p =>
            p.id === id ? { ...p, status: 'archived' } : p
          ))
        } else {
          // Product was fully deleted
          setProducts(products.filter(p => p.id !== id))
        }
      } else {
        alert(result.error || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product')
    }
  }

  const handleSave = (product: Product) => {
    const existingIndex = products.findIndex(p => p.id === product.id)
    let updatedProducts: Product[]

    if (existingIndex >= 0) {
      updatedProducts = [...products]
      updatedProducts[existingIndex] = product
    } else {
      updatedProducts = [product, ...products]
    }

    setProducts(updatedProducts)
    setShowModal(false)
    setEditingProduct(null)
  }

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    draft: products.filter(p => p.status === 'draft').length,
    ebooks: products.filter(p => p.product_type === 'ebook').length,
    templates: products.filter(p => p.product_type === 'template').length,
    bundles: products.filter(p => p.product_type === 'bundle').length,
    courses: products.filter(p => p.product_type === 'course').length,
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Draft</p>
          <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">eBooks</p>
          <p className="text-2xl font-bold text-purple-600">{stats.ebooks}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Templates</p>
          <p className="text-2xl font-bold text-blue-600">{stats.templates}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Bundles</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.bundles}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Courses</p>
          <p className="text-2xl font-bold text-green-600">{stats.courses}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="ebook">eBooks</option>
            <option value="template">Templates</option>
            <option value="bundle">Bundles</option>
            <option value="course">Courses</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <button
            onClick={() => {
              setEditingProduct(null)
              setShowModal(true)
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Showing {filteredProducts.length} of {products.length} products
      </p>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {products.length === 0
                      ? 'No products yet. Click "Add Product" to create your first product.'
                      : 'No products match your filters.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onEdit={() => handleEdit(product)}
                    onDelete={() => handleDelete(product.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          allProducts={products}
          onClose={() => {
            setShowModal(false)
            setEditingProduct(null)
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
