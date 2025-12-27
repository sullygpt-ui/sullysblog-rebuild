import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { resourceId, pageUrl } = await request.json()

    if (!resourceId) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''

    // Insert click record
    const { error } = await supabase
      .from('resource_clicks')
      .insert({
        resource_id: resourceId,
        ip_address: ipAddress.substring(0, 255),
        user_agent: userAgent.substring(0, 255),
        referer: referer.substring(0, 255),
        page_url: pageUrl || ''
      })

    if (error) {
      console.error('Error tracking resource click:', error)
      return NextResponse.json(
        { error: 'Failed to track click' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in track-click route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
