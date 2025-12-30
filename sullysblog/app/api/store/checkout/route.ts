import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { validateCoupon } from '@/lib/queries/coupons'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

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

    const { productId, couponCode } = await request.json()

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

    // Calculate price with coupon
    let finalPrice = product.price
    let discountAmount = 0
    let couponId: string | null = null

    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, user.id, productId, product.price)

      if (!couponResult.valid) {
        return NextResponse.json({ error: couponResult.error }, { status: 400 })
      }

      discountAmount = couponResult.discountAmount || 0
      finalPrice = Math.max(0, product.price - discountAmount)
      couponId = couponResult.coupon!.id
    }

    // Handle free orders (100% discount or $0 product)
    if (finalPrice === 0) {
      // Use service role client for creating order
      const serviceSupabase = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
      )

      // Create order directly
      const orderNumber = generateOrderNumber()
      const { data: order, error: orderError } = await serviceSupabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: 'completed',
          subtotal: product.price,
          total: 0,
          discount_amount: discountAmount,
          coupon_id: couponId,
          customer_email: user.email || '',
          completed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (orderError) {
        console.error('Error creating free order:', orderError)
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
      }

      // Create order item
      await serviceSupabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: productId,
          product_name: product.name,
          price_at_purchase: 0,
        })

      // Grant download access
      await serviceSupabase
        .from('download_access')
        .insert({
          user_id: user.id,
          product_id: productId,
          order_id: order.id,
          download_count: 0,
        })

      // Handle bundle items
      if (product.product_type === 'bundle') {
        const { data: bundleItems } = await serviceSupabase
          .from('bundle_items')
          .select('included_product_id')
          .eq('bundle_product_id', productId)

        if (bundleItems && bundleItems.length > 0) {
          for (const item of bundleItems) {
            const { data: existing } = await serviceSupabase
              .from('download_access')
              .select('id')
              .eq('user_id', user.id)
              .eq('product_id', item.included_product_id)
              .single()

            if (!existing) {
              await serviceSupabase
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

      // Record coupon usage if applicable
      if (couponId) {
        await serviceSupabase
          .from('coupon_usages')
          .insert({
            coupon_id: couponId,
            order_id: order.id,
            user_id: user.id,
            discount_amount: discountAmount,
          })

        // Increment coupon usage count
        await serviceSupabase.rpc('increment_coupon_usage', { p_coupon_id: couponId })
      }

      return NextResponse.json({
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/store/checkout/success?order=${order.id}`,
        free: true
      })
    }

    // Check minimum Stripe amount ($0.50 = 50 cents)
    const amountInCents = Math.round(finalPrice * 100)
    if (amountInCents < 50) {
      return NextResponse.json({ error: 'Price must be at least $0.50 for Stripe payments' }, { status: 400 })
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.short_description || undefined,
              images: product.cover_image_url ? [product.cover_image_url] : undefined,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/store/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/store/${product.slug}`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
        coupon_id: couponId || '',
        coupon_code: couponCode || '',
        discount_amount: discountAmount.toString(),
        original_price: product.price.toString(),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error.message)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
