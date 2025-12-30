import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// Service role client for admin operations
const getServiceClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// GET single coupon with products
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authClient = await createServerClient()

    const { data: { user } } = await authClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getServiceClient()
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    // Get associated products if specific
    if (coupon.applies_to === 'specific_products') {
      const { data: couponProducts } = await supabase
        .from('coupon_products')
        .select('product_id')
        .eq('coupon_id', id)

      return NextResponse.json({
        ...coupon,
        coupon_products: couponProducts || []
      })
    }

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Error fetching coupon:', error)
    return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 })
  }
}

// PUT update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authClient = await createServerClient()

    const { data: { user } } = await authClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getServiceClient()
    const body = await request.json()
    const code = body.code?.toUpperCase()

    // Check if code already exists (excluding current coupon)
    const { data: existing } = await supabase
      .from('coupons')
      .select('id')
      .eq('code', code)
      .neq('id', id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
    }

    // Update coupon
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .update({
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
      .eq('id', id)
      .select()
      .single()

    if (couponError) {
      return NextResponse.json({ error: couponError.message }, { status: 400 })
    }

    // Update product associations
    // First delete existing
    await supabase
      .from('coupon_products')
      .delete()
      .eq('coupon_id', id)

    // Add new ones if specific products
    if (body.applies_to === 'specific_products' && body.product_ids?.length > 0) {
      const productLinks = body.product_ids.map((productId: string) => ({
        coupon_id: id,
        product_id: productId
      }))

      await supabase
        .from('coupon_products')
        .insert(productLinks)
    }

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Error updating coupon:', error)
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
  }
}

// DELETE (archive) coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authClient = await createServerClient()

    const { data: { user } } = await authClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getServiceClient()
    // Archive the coupon instead of deleting
    const { error } = await supabase
      .from('coupons')
      .update({ status: 'archived' })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error archiving coupon:', error)
    return NextResponse.json({ error: 'Failed to archive coupon' }, { status: 500 })
  }
}
