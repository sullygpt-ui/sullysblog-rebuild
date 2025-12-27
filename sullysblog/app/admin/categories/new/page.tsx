import { CategoryForm } from '@/components/admin/CategoryForm'
import Link from 'next/link'

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Category</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add a new category to organize your posts
          </p>
        </div>
        <Link
          href="/admin/categories"
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Back to Categories
        </Link>
      </div>

      <CategoryForm mode="create" />
    </div>
  )
}
