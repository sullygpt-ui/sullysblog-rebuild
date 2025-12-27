import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Order Confirmed - SullysBlog.com',
}

type Props = {
  searchParams: Promise<{ session_id?: string; order?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?redirectTo=/store/orders')
  }

  let order = null
  let orderItems: any[] = []

  // Get order by ID (for free products) or by session_id (for paid)
  if (params.order) {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, cover_image_url, slug))')
      .eq('id', params.order)
      .eq('user_id', user.id)
      .single()
    order = data
    orderItems = data?.order_items || []
  } else if (params.session_id) {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, cover_image_url, slug))')
      .eq('stripe_session_id', params.session_id)
      .eq('user_id', user.id)
      .single()
    order = data
    orderItems = data?.order_items || []
  }

  // Get user's download access for these products
  const productIds = orderItems.map(item => item.product_id)
  const { data: downloadAccess } = await supabase
    .from('download_access')
    .select('product_id')
    .eq('user_id', user.id)
    .in('product_id', productIds.length > 0 ? productIds : ['none'])

  const accessibleProductIds = new Set(downloadAccess?.map(d => d.product_id) || [])

  return (
    <div className="max-w-3xl mx-auto text-center">
      {/* Success Icon */}
      <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Thank You for Your Purchase!
      </h1>

      {order ? (
        <>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Order #{order.order_number} has been confirmed.
          </p>

          {/* Order Items */}
          {orderItems.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white text-left">
                  Your Products
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {orderItems.map((item: any) => (
                  <div key={item.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {item.products?.cover_image_url && (
                        <img
                          src={item.products.cover_image_url}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.product_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.price_at_purchase === 0 ? 'Free' : `$${item.price_at_purchase.toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                    {accessibleProductIds.has(item.product_id) && (
                      <Link
                        href={`/store/orders`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Download
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-8 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Email</span>
              <span className="text-gray-900 dark:text-white">{order.customer_email}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Order Total</span>
              <span className="text-gray-900 dark:text-white font-semibold">
                {order.total === 0 ? 'Free' : `$${order.total.toFixed(2)}`}
              </span>
            </div>
          </div>
        </>
      ) : (
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Your order has been confirmed. Check your email for details.
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/store/orders"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          View Your Downloads
        </Link>
        <Link
          href="/store"
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
