import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function POST(request: NextRequest) {
  console.log('🛒 [CHECKOUT] Starting checkout process')

  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    console.log('🛒 [CHECKOUT] User authenticated:', !!user)

    if (!user) {
      console.log('🛒 [CHECKOUT] ERROR: User not authenticated')
      return NextResponse.json({ error: 'Please log in to continue' }, { status: 401 })
    }

    const { productId } = await request.json()
    console.log('🛒 [CHECKOUT] Product ID:', productId)

    if (!productId) {
      console.log('🛒 [CHECKOUT] ERROR: Missing product ID')
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('status', 'active')
      .single()

    console.log('🛒 [CHECKOUT] Product found:', !!product)
    console.log('🛒 [CHECKOUT] Product error:', productError)

    if (productError || !product) {
      console.log('🛒 [CHECKOUT] ERROR: Product not found')
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    console.log('🛒 [CHECKOUT] Product name:', product.name)
    console.log('🛒 [CHECKOUT] Product price:', product.price)
    console.log('🛒 [CHECKOUT] Price in cents:', Math.round(product.price * 100))

    if (product.price === 0) {
      console.log('🛒 [CHECKOUT] ERROR: Product is free')
      return NextResponse.json({ error: 'This product is free. Use the claim-free endpoint.' }, { status: 400 })
    }

    // Check minimum Stripe amount ($0.50 = 50 cents)
    const amountInCents = Math.round(product.price * 100)
    if (amountInCents < 50) {
      console.log('🛒 [CHECKOUT] ERROR: Price below Stripe minimum ($0.50)')
      return NextResponse.json({ error: 'Price must be at least $0.50 for Stripe payments' }, { status: 400 })
    }

    console.log('🛒 [CHECKOUT] STRIPE_SECRET_KEY configured:', !!process.env.STRIPE_SECRET_KEY)
    console.log('🛒 [CHECKOUT] STRIPE_SECRET_KEY prefix:', process.env.STRIPE_SECRET_KEY?.substring(0, 8))

    // Create Stripe Checkout Session
    console.log('🛒 [CHECKOUT] Creating Stripe checkout session...')

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
      },
    })

    console.log('🛒 [CHECKOUT] ✅ Session created:', session.id)
    console.log('🛒 [CHECKOUT] Session URL:', session.url)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('🛒 [CHECKOUT] ERROR:', error.message)
    console.error('🛒 [CHECKOUT] Error type:', error.type)
    console.error('🛒 [CHECKOUT] Error code:', error.code)
    console.error('🛒 [CHECKOUT] Full error:', JSON.stringify(error, null, 2))
    return NextResponse.json({ error: `Failed to create checkout session: ${error.message}` }, { status: 500 })
  }
}
