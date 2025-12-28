import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { adId } = await request.json()

    if (!adId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Fetch current count and increment
    const { data: ad } = await supabase
      .from('ads')
      .select('impression_count')
      .eq('id', adId)
      .single()

    if (ad) {
      await supabase
        .from('ads')
        .update({ impression_count: (ad.impression_count || 0) + 1 })
        .eq('id', adId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    // Silently return success - don't crash for non-critical tracking
    console.error('Error tracking impression:', error)
    return NextResponse.json({ success: true })
  }
}
