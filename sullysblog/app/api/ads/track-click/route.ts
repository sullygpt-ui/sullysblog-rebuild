import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { adId, pageUrl } = await request.json()

    if (!adId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Insert click record into ad_clicks table
    const { error } = await supabase
      .from('ad_clicks')
      .insert({
        ad_id: adId,
        page_url: pageUrl || null,
        user_agent: request.headers.get('user-agent')?.substring(0, 255) || null,
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] ||
                    request.headers.get('x-real-ip') || null
      })

    if (error) {
      console.error('Error inserting ad click:', error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    // Silently return success - don't crash for non-critical tracking
    console.error('Error tracking click:', error)
    return NextResponse.json({ success: true })
  }
}
