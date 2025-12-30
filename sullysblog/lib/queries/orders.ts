import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database'

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']

export type OrderWithItems = Order & {
  order_items: (OrderItem & {
    products?: {
      name: string
      slug: string
      product_type: string
    }
  })[]
}

// Get all orders (for admin)
export async function getAllOrders(): Promise<OrderWithItems[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (
          name,
          slug,
          product_type
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return (data as OrderWithItems[]) || []
}

// Get order by ID
export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (
          name,
          slug,
          product_type
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  return data as OrderWithItems
}

// Get orders by user
export async function getOrdersByUser(userId: string): Promise<OrderWithItems[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (
          name,
          slug,
          product_type
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user orders:', error)
    return []
  }

  return (data as OrderWithItems[]) || []
}

// Get order stats
export async function getOrderStats(): Promise<{
  totalOrders: number
  completedOrders: number
  totalRevenue: number
  freeOrders: number
}> {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('status, total')

  if (!orders) {
    return { totalOrders: 0, completedOrders: 0, totalRevenue: 0, freeOrders: 0 }
  }

  const completedOrders = orders.filter(o => o.status === 'completed')
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const freeOrders = completedOrders.filter(o => o.total === 0).length

  return {
    totalOrders: orders.length,
    completedOrders: completedOrders.length,
    totalRevenue,
    freeOrders
  }
}

// Sales report types
export type SalesReportItem = {
  product_id: string
  product_name: string
  product_type: string
  units_sold: number
  total_revenue: number
  orders: {
    order_id: string
    order_number: string
    customer_email: string
    price: number
    date: string
  }[]
}

export type SalesReportSummary = {
  total_revenue: number
  total_orders: number
  total_units: number
  products: SalesReportItem[]
}

// Get sales report by date range
export async function getSalesReport(
  startDate: string,
  endDate: string,
  productId?: string
): Promise<SalesReportSummary> {
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('orders')
    .select(`
      id,
      order_number,
      customer_email,
      total,
      created_at,
      order_items (
        id,
        product_id,
        product_name,
        price_at_purchase,
        products (
          id,
          name,
          product_type
        )
      )
    `)
    .eq('status', 'completed')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false })

  const { data: orders, error } = await query

  if (error || !orders) {
    console.error('Error fetching sales report:', error)
    return { total_revenue: 0, total_orders: 0, total_units: 0, products: [] }
  }

  // Process data into sales report format
  const productMap = new Map<string, SalesReportItem>()

  for (const order of orders) {
    for (const item of (order as any).order_items || []) {
      const pid = item.product_id
      const product = item.products

      // Skip if filtering by product and doesn't match
      if (productId && pid !== productId) continue

      if (!productMap.has(pid)) {
        productMap.set(pid, {
          product_id: pid,
          product_name: item.product_name || product?.name || 'Unknown',
          product_type: product?.product_type || 'unknown',
          units_sold: 0,
          total_revenue: 0,
          orders: []
        })
      }

      const reportItem = productMap.get(pid)!
      reportItem.units_sold += 1
      reportItem.total_revenue += item.price_at_purchase || 0
      reportItem.orders.push({
        order_id: order.id,
        order_number: order.order_number,
        customer_email: order.customer_email,
        price: item.price_at_purchase || 0,
        date: order.created_at
      })
    }
  }

  const products = Array.from(productMap.values())
    .sort((a, b) => b.total_revenue - a.total_revenue)

  // Calculate totals
  const filteredOrders = productId
    ? new Set(products.flatMap(p => p.orders.map(o => o.order_id))).size
    : orders.length

  return {
    total_revenue: products.reduce((sum, p) => sum + p.total_revenue, 0),
    total_orders: filteredOrders,
    total_units: products.reduce((sum, p) => sum + p.units_sold, 0),
    products
  }
}
