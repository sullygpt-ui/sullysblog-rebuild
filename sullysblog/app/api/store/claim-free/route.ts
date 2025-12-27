import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `SB-${timestamp}-${random}`.toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Please log in to continue' }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('status', 'active')
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.price !== 0) {
      return NextResponse.json({ error: 'This product is not free' }, { status: 400 })
    }

    // Check if user already has access to this product
    const { data: existingAccess } = await supabase
      .from('download_access')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single()

    if (existingAccess) {
      return NextResponse.json({ error: 'You already have access to this product' }, { status: 400 })
    }

    // Create order
    const orderNumber = generateOrderNumber()
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: 'completed',
        subtotal: 0,
        total: 0,
        customer_email: user.email!,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Create order item
    await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        price_at_purchase: 0,
      })

    // Grant download access
    await supabase
      .from('download_access')
      .insert({
        user_id: user.id,
        product_id: product.id,
        order_id: order.id,
        download_count: 0,
      })

    // If it's a bundle, grant access to all included products
    if (product.product_type === 'bundle') {
      const { data: bundleItems } = await supabase
        .from('bundle_items')
        .select('included_product_id')
        .eq('bundle_product_id', product.id)

      if (bundleItems && bundleItems.length > 0) {
        for (const item of bundleItems) {
          // Check if already has access
          const { data: existing } = await supabase
            .from('download_access')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', item.included_product_id)
            .single()

          if (!existing) {
            await supabase
              .from('download_access')
              .insert({
                user_id: user.id,
                product_id: item.included_product_id,
                order_id: order.id,
                download_count: 0,
              })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    })
  } catch (error) {
    console.error('Claim free error:', error)
    return NextResponse.json({ error: 'Failed to claim product' }, { status: 500 })
  }
}
