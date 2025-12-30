import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/sender'
import { getPurchaseConfirmation } from '@/lib/email/templates'

// Ensure raw body is available for signature verification
export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

// Use service role for webhook (no user context)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `SB-${timestamp}-${random}`.toUpperCase()
}

export async function POST(request: NextRequest) {
  console.log('🔔 [WEBHOOK] Stripe webhook received')

  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  console.log('🔔 [WEBHOOK] Signature present:', !!signature)
  console.log('🔔 [WEBHOOK] Webhook secret configured:', !!process.env.STRIPE_WEBHOOK_SECRET)

  if (!signature) {
    console.error('🔔 [WEBHOOK] ERROR: Missing signature')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log('🔔 [WEBHOOK] Signature verified successfully')
  } catch (err: any) {
    console.error('🔔 [WEBHOOK] ERROR: Signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('🔔 [WEBHOOK] Event type:', event.type)
  console.log('🔔 [WEBHOOK] Event ID:', event.id)

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    console.log('🔔 [WEBHOOK] Processing checkout.session.completed')
    console.log('🔔 [WEBHOOK] Session ID:', session.id)
    console.log('🔔 [WEBHOOK] Session metadata:', JSON.stringify(session.metadata))
    console.log('🔔 [WEBHOOK] Customer email:', session.customer_email)
    console.log('🔔 [WEBHOOK] Payment status:', session.payment_status)

    try {
      // Check if this is a domain purchase
      const domainId = session.metadata?.domain_id
      if (domainId) {
        console.log('🔔 [WEBHOOK] This is a domain purchase, domain_id:', domainId)
        // Handle domain purchase - mark as inactive
        const { error: domainError } = await supabase
          .from('domains_for_sale')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', domainId)

        if (domainError) {
          console.error('🔔 [WEBHOOK] ERROR: Error marking domain as sold:', domainError)
        } else {
          console.log('🔔 [WEBHOOK] Domain marked as sold:', session.metadata?.domain_name)
        }

        // Domain purchases don't need order/download access processing
        return NextResponse.json({ received: true })
      }

      // Handle product purchase
      const userId = session.metadata?.user_id
      const productId = session.metadata?.product_id
      const productName = session.metadata?.product_name

      console.log('🔔 [WEBHOOK] Product purchase - userId:', userId)
      console.log('🔔 [WEBHOOK] Product purchase - productId:', productId)
      console.log('🔔 [WEBHOOK] Product purchase - productName:', productName)

      if (!userId || !productId) {
        console.error('🔔 [WEBHOOK] ERROR: Missing metadata in session:', session.id)
        console.error('🔔 [WEBHOOK] Full session object:', JSON.stringify(session, null, 2))
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }

      // Create order
      const orderNumber = generateOrderNumber()
      console.log('🔔 [WEBHOOK] Creating order:', orderNumber)

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          order_number: orderNumber,
          status: 'completed',
          subtotal: (session.amount_subtotal || 0) / 100,
          total: (session.amount_total || 0) / 100,
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          stripe_customer_id: session.customer as string,
          customer_email: session.customer_email || '',
          completed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (orderError) {
        console.error('🔔 [WEBHOOK] ERROR: Error creating order:', orderError)
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
      }

      console.log('🔔 [WEBHOOK] Order created successfully, ID:', order.id)

      // Create order item
      const { error: orderItemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: productId,
          product_name: productName || 'Product',
          price_at_purchase: (session.amount_total || 0) / 100,
        })

      if (orderItemError) {
        console.error('🔔 [WEBHOOK] ERROR: Error creating order item:', orderItemError)
      } else {
        console.log('🔔 [WEBHOOK] Order item created successfully')
      }

      // Grant download access
      const { error: accessError } = await supabase
        .from('download_access')
        .insert({
          user_id: userId,
          product_id: productId,
          order_id: order.id,
          download_count: 0,
        })

      if (accessError) {
        console.error('🔔 [WEBHOOK] ERROR: Error granting download access:', accessError)
      } else {
        console.log('🔔 [WEBHOOK] Download access granted for product:', productId)
      }

      // Check if it's a bundle and grant access to included products
      const { data: product } = await supabase
        .from('products')
        .select('product_type')
        .eq('id', productId)
        .single()

      console.log('🔔 [WEBHOOK] Product type:', product?.product_type)

      if (product?.product_type === 'bundle') {
        console.log('🔔 [WEBHOOK] Processing bundle items')
        const { data: bundleItems } = await supabase
          .from('bundle_items')
          .select('included_product_id')
          .eq('bundle_product_id', productId)

        console.log('🔔 [WEBHOOK] Bundle items found:', bundleItems?.length || 0)

        if (bundleItems && bundleItems.length > 0) {
          for (const item of bundleItems) {
            // Check if already has access
            const { data: existing } = await supabase
              .from('download_access')
              .select('id')
              .eq('user_id', userId)
              .eq('product_id', item.included_product_id)
              .single()

            if (!existing) {
              const { error: bundleAccessError } = await supabase
                .from('download_access')
                .insert({
                  user_id: userId,
                  product_id: item.included_product_id,
                  order_id: order.id,
                  download_count: 0,
                })

              if (bundleAccessError) {
                console.error('🔔 [WEBHOOK] ERROR: Error granting bundle item access:', bundleAccessError)
              } else {
                console.log('🔔 [WEBHOOK] Bundle item access granted:', item.included_product_id)
              }
            }
          }
        }
      }

      // Send purchase confirmation email
      const customerEmail = session.customer_email
      console.log('🔔 [WEBHOOK] Preparing to send email to:', customerEmail)
      console.log('🔔 [WEBHOOK] RESEND_API_KEY configured:', !!process.env.RESEND_API_KEY)

      if (customerEmail) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sullysblog.com'
        console.log('🔔 [WEBHOOK] Site URL:', siteUrl)

        const emailTemplate = getPurchaseConfirmation({
          customerEmail,
          productName: productName || 'Your purchase',
          orderNumber,
          downloadUrl: `${siteUrl}/store/orders`,
          siteUrl,
        })

        console.log('🔔 [WEBHOOK] Sending email with subject:', emailTemplate.subject)

        const emailResult = await sendEmail({
          to: customerEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        })

        console.log('🔔 [WEBHOOK] Email send result:', JSON.stringify(emailResult))
      } else {
        console.warn('🔔 [WEBHOOK] WARNING: No customer email found, skipping email')
      }

      console.log('🔔 [WEBHOOK] ✅ Order processing complete:', orderNumber)
    } catch (error) {
      console.error('🔔 [WEBHOOK] ERROR: Error processing checkout completion:', error)
      return NextResponse.json({ error: 'Processing error' }, { status: 500 })
    }
  }

  // Handle payment_intent.succeeded as backup (in case checkout.session.completed is missed)
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    console.log('🔔 [WEBHOOK] Payment intent succeeded:', paymentIntent.id)

    // Check if order already exists (from checkout.session.completed)
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single()

    if (existingOrder) {
      console.log('🔔 [WEBHOOK] Order already processed via checkout.session.completed')
      return NextResponse.json({ received: true })
    }

    // If no order exists, log a warning (shouldn't happen normally)
    console.warn('🔔 [WEBHOOK] WARNING: Payment succeeded but no matching order found. Payment intent:', paymentIntent.id)
  }

  console.log('🔔 [WEBHOOK] Webhook processing complete, returning success')
  return NextResponse.json({ received: true })
}
