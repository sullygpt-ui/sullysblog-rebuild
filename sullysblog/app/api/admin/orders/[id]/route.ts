import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client for database operations
    const adminClient = createAdminClient()

    // Get the order first to find associated data
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Get order items to know which products to revoke access for
    const { data: orderItems } = await adminClient
      .from('order_items')
      .select('product_id')
      .eq('order_id', id)

    // Delete download access for products in this order
    if (orderItems && orderItems.length > 0 && order.user_id) {
      const productIds = orderItems.map(item => item.product_id)
      await adminClient
        .from('download_access')
        .delete()
        .eq('user_id', order.user_id)
        .eq('order_id', id)
    }

    // Delete order items (should cascade, but explicit is safer)
    await adminClient
      .from('order_items')
      .delete()
      .eq('order_id', id)

    // Delete the order
    const { error: deleteError } = await adminClient
      .from('orders')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting order:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/orders/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
