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

    // Update impression count on the sidebar_ads table directly
    const { error } = await supabase.rpc('increment_ad_impressions', {
      ad_uuid: adId
    })

    if (error) {
      // Silently fail - ad tracking is non-critical
      // The RPC function may not exist yet
      console.error('Error tracking impression:', error.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    // Silently return success - don't crash for non-critical tracking
    return NextResponse.json({ success: true })
  }
}
