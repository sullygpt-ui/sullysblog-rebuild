import { createClient } from '@supabase/supabase-js'

// Use service role for admin queries
const getServiceClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export type Customer = {
  email: string
  total_orders: number
  total_spent: number
  first_order_date: string
  last_order_date: string
  orders: {
    id: string
    order_number: string
    total: number
    status: string
    created_at: string
    items: {
      product_name: string
      price: number
    }[]
  }[]
}

export type CustomerSummary = {
  total_customers: number
  total_revenue: number
  avg_order_value: number
  repeat_customers: number
}

// Get all customers with their order history
export async function getAllCustomers(): Promise<Customer[]> {
  const supabase = getServiceClient()

  // Get all completed orders with items
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      customer_email,
      total,
      status,
      created_at,
      order_items (
        product_name,
        price_at_purchase
      )
    `)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  if (error || !orders) {
    console.error('Error fetching orders:', error)
    return []
  }

  // Group by customer email
  const customerMap = new Map<string, Customer>()

  for (const order of orders) {
    const email = order.customer_email
    if (!email) continue

    if (!customerMap.has(email)) {
      customerMap.set(email, {
        email,
        total_orders: 0,
        total_spent: 0,
        first_order_date: order.created_at,
        last_order_date: order.created_at,
        orders: []
      })
    }

    const customer = customerMap.get(email)!
    customer.total_orders++
    customer.total_spent += order.total || 0
    customer.last_order_date = order.created_at // Already sorted desc, so first is latest
    if (order.created_at < customer.first_order_date) {
      customer.first_order_date = order.created_at
    }

    customer.orders.push({
      id: order.id,
      order_number: order.order_number,
      total: order.total || 0,
      status: order.status,
      created_at: order.created_at,
      items: (order.order_items as any[])?.map(item => ({
        product_name: item.product_name,
        price: item.price_at_purchase
      })) || []
    })
  }

  // Sort by total spent descending
  return Array.from(customerMap.values())
    .sort((a, b) => b.total_spent - a.total_spent)
}

// Get customer summary stats
export async function getCustomerSummary(): Promise<CustomerSummary> {
  const customers = await getAllCustomers()

  const total_customers = customers.length
  const total_revenue = customers.reduce((sum, c) => sum + c.total_spent, 0)
  const total_orders = customers.reduce((sum, c) => sum + c.total_orders, 0)
  const avg_order_value = total_orders > 0 ? total_revenue / total_orders : 0
  const repeat_customers = customers.filter(c => c.total_orders > 1).length

  return {
    total_customers,
    total_revenue,
    avg_order_value,
    repeat_customers
  }
}

// Get customer by email
export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const customers = await getAllCustomers()
  return customers.find(c => c.email === email) || null
}

// Export customers to CSV format
export function customersToCSV(customers: Customer[]): string {
  const headers = ['Email', 'Total Orders', 'Total Spent', 'First Order', 'Last Order']
  const rows = customers.map(c => [
    c.email,
    c.total_orders.toString(),
    c.total_spent.toFixed(2),
    new Date(c.first_order_date).toLocaleDateString(),
    new Date(c.last_order_date).toLocaleDateString()
  ])

  return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
}
