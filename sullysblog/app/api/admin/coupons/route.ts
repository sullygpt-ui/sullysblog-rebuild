import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .neq('status', 'archived')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Ensure code is uppercase
    const code = body.code?.toUpperCase()

    // Check if code already exists
    const { data: existing } = await supabase
      .from('coupons')
      .select('id')
      .eq('code', code)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
    }

    // Create coupon
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .insert({
        code,
        description: body.description || null,
        discount_type: body.discount_type,
        discount_value: body.discount_value,
        max_uses: body.max_uses || null,
        max_uses_per_user: body.max_uses_per_user ?? 1,
        starts_at: body.starts_at || null,
        expires_at: body.expires_at || null,
        minimum_purchase: body.minimum_purchase || null,
        applies_to: body.applies_to || 'all',
        status: body.status || 'active'
      })
      .select()
      .single()

    if (couponError) {
      return NextResponse.json({ error: couponError.message }, { status: 400 })
    }

    // Add product associations if specific
    if (body.applies_to === 'specific_products' && body.product_ids?.length > 0) {
      const productLinks = body.product_ids.map((productId: string) => ({
        coupon_id: coupon.id,
        product_id: productId
      }))

      await supabase
        .from('coupon_products')
        .insert(productLinks)
    }

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
}
