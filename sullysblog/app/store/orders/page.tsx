import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DownloadButton } from '@/components/store/DownloadButton'

export const metadata: Metadata = {
  title: 'Your Downloads - SullysBlog.com',
}

export default async function OrdersPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?redirectTo=/store/orders')
  }

  // Get user's download access with product details
  const { data: downloads } = await supabase
    .from('download_access')
    .select(`
      *,
      products (
        id,
        name,
        slug,
        cover_image_url,
        product_type
      ),
      orders (
        order_number,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('granted_at', { ascending: false })

  // Get files for each product
  const productIds = [...new Set(downloads?.map(d => d.product_id) || [])]
  const { data: productFiles } = await supabase
    .from('product_files')
    .select('*')
    .in('product_id', productIds.length > 0 ? productIds : ['none'])
    .order('display_order', { ascending: true })

  // Group files by product
  const filesByProduct: Record<string, any[]> = {}
  productFiles?.forEach(file => {
    if (!filesByProduct[file.product_id]) {
      filesByProduct[file.product_id] = []
    }
    filesByProduct[file.product_id].push(file)
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ebook': return 'eBook'
      case 'template': return 'Template'
      case 'bundle': return 'Bundle'
      case 'course': return 'Course'
      default: return type
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Downloads
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Access your purchased products and download files
        </p>
      </div>

      {!downloads || downloads.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No purchases yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Browse our store to find playbooks, templates, and training resources
          </p>
          <Link
            href="/store"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {downloads.map((download: any) => (
            <div
              key={download.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  {download.products?.cover_image_url && (
                    <img
                      src={download.products.cover_image_url}
                      alt={download.products.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {getTypeLabel(download.products?.product_type)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {download.products?.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Purchased on {formatDate(download.granted_at)}
                      {download.orders?.order_number && (
                        <> • Order #{download.orders.order_number}</>
                      )}
                    </p>
                    {download.download_count > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        Downloaded {download.download_count} time{download.download_count !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* View Product Link */}
                  <Link
                    href={`/store/${download.products?.slug}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    View Product
                  </Link>
                </div>

                {/* Download Files */}
                {filesByProduct[download.product_id] && filesByProduct[download.product_id].length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Files ({filesByProduct[download.product_id].length})
                    </h4>
                    <div className="space-y-2">
                      {filesByProduct[download.product_id].map((file: any) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {file.file_name}
                              </p>
                              {file.file_size && (
                                <p className="text-xs text-gray-500">
                                  {(file.file_size / (1024 * 1024)).toFixed(1)} MB
                                </p>
                              )}
                            </div>
                          </div>
                          <DownloadButton fileId={file.id} fileName={file.file_name} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No files message */}
                {(!filesByProduct[download.product_id] || filesByProduct[download.product_id].length === 0) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No downloadable files available for this product.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
