import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database'

export type Coupon = Database['public']['Tables']['coupons']['Row']
export type CouponProduct = Database['public']['Tables']['coupon_products']['Row']
export type CouponUsage = Database['public']['Tables']['coupon_usages']['Row']

export type CouponWithProducts = Coupon & {
  coupon_products?: (CouponProduct & {
    products?: { id: string; name: string }
  })[]
}

// Get all coupons (for admin) - excludes archived
export async function getAllCoupons(): Promise<Coupon[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .neq('status', 'archived')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching coupons:', error)
    return []
  }

  return data || []
}

// Get coupon by ID with products
export async function getCouponById(id: string): Promise<CouponWithProducts | null> {
  const supabase = await createClient()

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !coupon) {
    console.error('Error fetching coupon:', error)
    return null
  }

  // Get associated products if specific
  if (coupon.applies_to === 'specific_products') {
    const { data: couponProducts } = await supabase
      .from('coupon_products')
      .select(`
        *,
        products (id, name)
      `)
      .eq('coupon_id', id)

    return {
      ...coupon,
      coupon_products: couponProducts || []
    }
  }

  return coupon
}

// Get coupon by code (case-insensitive)
export async function getCouponByCode(code: string): Promise<CouponWithProducts | null> {
  const supabase = await createClient()
  const upperCode = code.toUpperCase()

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', upperCode)
    .single()

  if (error || !coupon) {
    return null
  }

  // Get associated products if specific
  if (coupon.applies_to === 'specific_products') {
    const { data: couponProducts } = await supabase
      .from('coupon_products')
      .select(`
        *,
        products (id, name)
      `)
      .eq('coupon_id', coupon.id)

    return {
      ...coupon,
      coupon_products: couponProducts || []
    }
  }

  return coupon
}

// Validate coupon for checkout
export async function validateCoupon(
  code: string,
  userId: string,
  productId: string,
  subtotal: number
): Promise<{
  valid: boolean
  coupon?: CouponWithProducts
  error?: string
  discountAmount?: number
}> {
  const coupon = await getCouponByCode(code)

  if (!coupon) {
    return { valid: false, error: 'Invalid coupon code' }
  }

  // Check if active
  if (coupon.status !== 'active') {
    return { valid: false, error: 'This coupon is no longer active' }
  }

  // Check validity dates
  const now = new Date()
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { valid: false, error: 'This coupon is not yet active' }
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, error: 'This coupon has expired' }
  }

  // Check max uses
  if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
    return { valid: false, error: 'This coupon has reached its usage limit' }
  }

  // Check max uses per user
  if (coupon.max_uses_per_user !== null) {
    const supabase = await createClient()
    const { count } = await supabase
      .from('coupon_usages')
      .select('*', { count: 'exact', head: true })
      .eq('coupon_id', coupon.id)
      .eq('user_id', userId)

    if (count !== null && count >= coupon.max_uses_per_user) {
      return { valid: false, error: 'You have already used this coupon' }
    }
  }

  // Check minimum purchase
  if (coupon.minimum_purchase !== null && subtotal < coupon.minimum_purchase) {
    return {
      valid: false,
      error: `Minimum purchase of $${coupon.minimum_purchase.toFixed(2)} required`
    }
  }

  // Check product restrictions
  if (coupon.applies_to === 'specific_products') {
    const productIds = coupon.coupon_products?.map(cp => cp.product_id) || []
    if (!productIds.includes(productId)) {
      return { valid: false, error: 'This coupon does not apply to this product' }
    }
  }

  // Calculate discount
  let discountAmount: number
  if (coupon.discount_type === 'percentage') {
    discountAmount = subtotal * (coupon.discount_value / 100)
  } else {
    // Fixed amount - don't exceed subtotal
    discountAmount = Math.min(coupon.discount_value, subtotal)
  }

  // Round to 2 decimal places
  discountAmount = Math.round(discountAmount * 100) / 100

  return {
    valid: true,
    coupon,
    discountAmount
  }
}

// Get coupon stats
export async function getCouponStats(): Promise<{
  total: number
  active: number
  inactive: number
  totalDiscountGiven: number
}> {
  const supabase = await createClient()

  const { data: coupons } = await supabase
    .from('coupons')
    .select('status')
    .neq('status', 'archived')

  const { data: usages } = await supabase
    .from('coupon_usages')
    .select('discount_amount')

  const totalDiscountGiven = usages?.reduce((sum, u) => sum + (u.discount_amount || 0), 0) || 0

  return {
    total: coupons?.length || 0,
    active: coupons?.filter(c => c.status === 'active').length || 0,
    inactive: coupons?.filter(c => c.status === 'inactive').length || 0,
    totalDiscountGiven
  }
}

// Coupon report types
export type CouponReportItem = {
  coupon_id: string
  coupon_code: string
  description: string | null
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  total_uses: number
  total_discount: number
  usages: {
    order_id: string
    order_number: string
    customer_email: string
    discount_amount: number
    used_at: string
  }[]
}

export type CouponReportSummary = {
  total_uses: number
  total_discount: number
  coupons: CouponReportItem[]
}

// Get coupon report by date range
export async function getCouponReport(
  startDate: string,
  endDate: string,
  couponId?: string
): Promise<CouponReportSummary> {
  const supabase = await createClient()

  // Get usages in date range
  let query = supabase
    .from('coupon_usages')
    .select(`
      *,
      coupons (
        id,
        code,
        description,
        discount_type,
        discount_value
      ),
      orders (
        id,
        order_number,
        customer_email
      )
    `)
    .gte('used_at', startDate)
    .lte('used_at', endDate)
    .order('used_at', { ascending: false })

  if (couponId) {
    query = query.eq('coupon_id', couponId)
  }

  const { data: usages, error } = await query

  if (error || !usages) {
    console.error('Error fetching coupon report:', error)
    return { total_uses: 0, total_discount: 0, coupons: [] }
  }

  // Group by coupon
  const couponMap = new Map<string, CouponReportItem>()

  for (const usage of usages) {
    const coupon = (usage as any).coupons
    const order = (usage as any).orders

    if (!coupon) continue

    if (!couponMap.has(coupon.id)) {
      couponMap.set(coupon.id, {
        coupon_id: coupon.id,
        coupon_code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        total_uses: 0,
        total_discount: 0,
        usages: []
      })
    }

    const reportItem = couponMap.get(coupon.id)!
    reportItem.total_uses += 1
    reportItem.total_discount += usage.discount_amount || 0
    reportItem.usages.push({
      order_id: usage.order_id,
      order_number: order?.order_number || 'Unknown',
      customer_email: order?.customer_email || 'Unknown',
      discount_amount: usage.discount_amount,
      used_at: usage.used_at
    })
  }

  const coupons = Array.from(couponMap.values())
    .sort((a, b) => b.total_discount - a.total_discount)

  return {
    total_uses: coupons.reduce((sum, c) => sum + c.total_uses, 0),
    total_discount: coupons.reduce((sum, c) => sum + c.total_discount, 0),
    coupons
  }
}

// Generate random coupon code
export function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude confusing chars
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `SAVE-${code}`
}
