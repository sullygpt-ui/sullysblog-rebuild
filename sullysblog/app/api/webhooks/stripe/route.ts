import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/sender'
import { getPurchaseConfirmation, getDomainPurchaseConfirmation } from '@/lib/email/templates'

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
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      // Check if this is a domain purchase
      const domainId = session.metadata?.domain_id
      if (domainId) {
        const domainName = session.metadata?.domain_name

        const { error: domainError } = await supabase
          .from('domains_for_sale')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', domainId)

        if (domainError) {
          console.error('Error marking domain as sold:', domainError)
        }

        // Send domain purchase confirmation email
        const customerEmail = session.customer_email
        if (customerEmail && domainName) {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sullysblog.com'
          const emailTemplate = getDomainPurchaseConfirmation({
            customerEmail,
            domainName,
            siteUrl,
          })

          await sendEmail({
            to: customerEmail,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          })
        }

        return NextResponse.json({ received: true })
      }

      // Handle product purchase
      const userId = session.metadata?.user_id
      const productId = session.metadata?.product_id
      const productName = session.metadata?.product_name

      if (!userId || !productId) {
        console.error('Missing metadata in session:', session.id)
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }

      // Create order
      const orderNumber = generateOrderNumber()
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
        console.error('Error creating order:', orderError)
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
      }

      // Create order item
      await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: productId,
          product_name: productName || 'Product',
          price_at_purchase: (session.amount_total || 0) / 100,
        })

      // Grant download access
      await supabase
        .from('download_access')
        .insert({
          user_id: userId,
          product_id: productId,
          order_id: order.id,
          download_count: 0,
        })

      // Check if it's a bundle and grant access to included products
      const { data: product } = await supabase
        .from('products')
        .select('product_type')
        .eq('id', productId)
        .single()

      if (product?.product_type === 'bundle') {
        const { data: bundleItems } = await supabase
          .from('bundle_items')
          .select('included_product_id')
          .eq('bundle_product_id', productId)

        if (bundleItems && bundleItems.length > 0) {
          for (const item of bundleItems) {
            const { data: existing } = await supabase
              .from('download_access')
              .select('id')
              .eq('user_id', userId)
              .eq('product_id', item.included_product_id)
              .single()

            if (!existing) {
              await supabase
                .from('download_access')
                .insert({
                  user_id: userId,
                  product_id: item.included_product_id,
                  order_id: order.id,
                  download_count: 0,
                })
            }
          }
        }
      }

      // Send purchase confirmation email
      const customerEmail = session.customer_email
      if (customerEmail) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sullysblog.com'
        const emailTemplate = getPurchaseConfirmation({
          customerEmail,
          productName: productName || 'Your purchase',
          orderNumber,
          downloadUrl: `${siteUrl}/store/orders`,
          siteUrl,
        })

        await sendEmail({
          to: customerEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        })
      }
    } catch (error) {
      console.error('Error processing checkout completion:', error)
      return NextResponse.json({ error: 'Processing error' }, { status: 500 })
    }
  }

  // Handle payment_intent.succeeded as backup
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent

    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single()

    if (!existingOrder) {
      console.warn('Payment succeeded but no matching order found:', paymentIntent.id)
    }
  }

  return NextResponse.json({ received: true })
}
