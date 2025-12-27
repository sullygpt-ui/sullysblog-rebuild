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
