import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { resourceId, pageUrl } = await request.json()

    if (!resourceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Insert impression record into resource_impressions table
    await supabase
      .from('resource_impressions')
      .insert({
        resource_id: resourceId,
        page_url: pageUrl || null,
        user_agent: request.headers.get('user-agent')?.substring(0, 255) || null,
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] ||
                    request.headers.get('x-real-ip') || null
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking resource impression:', error)
    return NextResponse.json({ success: true })
  }
}
