import { createClient } from '@/lib/supabase/server'
import { CategoryForm, type CategoryFormData } from '@/components/admin/CategoryForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (!category) {
    notFound()
  }

  const formData: CategoryFormData = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Category</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Update category details
          </p>
        </div>
        <Link
          href="/admin/categories"
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Back to Categories
        </Link>
      </div>

      <CategoryForm mode="edit" initialData={formData} />
    </div>
  )
}
