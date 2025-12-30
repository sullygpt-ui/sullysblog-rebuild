import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateCoupon } from '@/lib/queries/coupons'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to use coupon codes' }, { status: 401 })
    }

    const body = await request.json()
    const { code, productId, subtotal } = body

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
    }

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    if (typeof subtotal !== 'number' || subtotal < 0) {
      return NextResponse.json({ error: 'Invalid subtotal' }, { status: 400 })
    }

    const result = await validateCoupon(code, user.id, productId, subtotal)

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: result.coupon!.id,
        code: result.coupon!.code,
        discount_type: result.coupon!.discount_type,
        discount_value: result.coupon!.discount_value,
      },
      discountAmount: result.discountAmount,
      newTotal: Math.max(0, subtotal - result.discountAmount!)
    })
  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
