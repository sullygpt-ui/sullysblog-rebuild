import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { adId, pageUrl } = await request.json()

    if (!adId || !pageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const userAgent = request.headers.get('user-agent') || undefined

    const { error } = await supabase.from('ad_impressions').insert({
      ad_id: adId,
      page_url: pageUrl,
      user_agent: userAgent
    })

    if (error) {
      console.error('Error tracking impression:', error)
      return NextResponse.json(
        { error: 'Failed to track impression' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in track-impression:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
