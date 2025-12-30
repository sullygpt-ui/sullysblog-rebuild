import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS for debugging
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET() {
  try {
    // Count total clicks (bypasses RLS)
    const { count: totalClicks, error: countError } = await supabase
      .from('resource_clicks')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      return NextResponse.json({
        error: 'Error counting clicks',
        details: countError.message
      }, { status: 500 })
    }

    // Get last 10 clicks
    const { data: recentClicks, error: clicksError } = await supabase
      .from('resource_clicks')
      .select('id, resource_id, clicked_at, ip_address, page_url')
      .order('clicked_at', { ascending: false })
      .limit(10)

    if (clicksError) {
      return NextResponse.json({
        error: 'Error fetching clicks',
        details: clicksError.message
      }, { status: 500 })
    }

    // Count resources
    const { count: totalResources } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      totalClicks,
      totalResources,
      recentClicks,
      message: totalClicks === 0
        ? 'No clicks in database. The tracking might not be working.'
        : `Found ${totalClicks} clicks in database.`
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Server error',
      details: error.message
    }, { status: 500 })
  }
}
