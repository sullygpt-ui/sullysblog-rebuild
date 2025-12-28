import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { domainId } = await request.json()

    if (!domainId) {
      return NextResponse.json({ error: 'Domain ID is required' }, { status: 400 })
    }

    // Get the domain
    const { data: domain, error: domainError } = await supabase
      .from('domains_for_sale')
      .select('*')
      .eq('id', domainId)
      .eq('is_active', true)
      .single()

    if (domainError || !domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }

    // Get authenticated user (optional for domain purchases)
    const { data: { user } } = await supabase.auth.getUser()

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: domain.domain_name,
              description: `Domain Name Purchase: ${domain.domain_name}`,
            },
            unit_amount: Math.round(domain.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sullysblog.com'}/domains/purchase-success?session_id={CHECKOUT_SESSION_ID}&domain=${encodeURIComponent(domain.domain_name)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sullysblog.com'}/domains-for-sale`,
      customer_email: user?.email || undefined,
      metadata: {
        domain_id: domain.id,
        domain_name: domain.domain_name,
        user_id: user?.id || 'guest',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Domain checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
