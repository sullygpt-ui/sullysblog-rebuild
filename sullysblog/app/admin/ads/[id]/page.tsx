import { createClient } from '@/lib/supabase/server'
import { AdForm, type AdFormData } from '@/components/admin/AdForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditAdPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: ad } = await supabase
    .from('ads')
    .select('*')
    .eq('id', id)
    .single()

  if (!ad) {
    notFound()
  }

  const formData: AdFormData = {
    id: ad.id,
    name: ad.name,
    ad_zone: ad.ad_zone,
    ad_type: ad.ad_type,
    content: ad.content,
    link_url: ad.link_url,
    priority: ad.priority,
    is_active: ad.is_active,
    start_date: ad.start_date,
    end_date: ad.end_date,
    monthly_fee: ad.monthly_fee || 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Ad</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Update advertisement details
          </p>
        </div>
        <Link
          href="/admin/ads"
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Back to Ads
        </Link>
      </div>

      <AdForm mode="edit" initialData={formData} />
    </div>
  )
}
