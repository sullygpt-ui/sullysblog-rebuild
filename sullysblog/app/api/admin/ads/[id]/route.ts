import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// DELETE - Delete or archive an ad
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client for database operations (bypasses RLS)
    const adminClient = createAdminClient()

    // Check if ad has impressions or clicks (analytics data)
    const [impressionsResult, clicksResult] = await Promise.all([
      adminClient.from('ad_impressions').select('*', { count: 'exact', head: true }).eq('ad_id', id),
      adminClient.from('ad_clicks').select('*', { count: 'exact', head: true }).eq('ad_id', id),
    ])

    const hasAnalytics = (impressionsResult.count || 0) > 0 || (clicksResult.count || 0) > 0

    if (hasAnalytics) {
      // Ad has analytics - archive instead of delete to preserve data
      const { error: archiveError } = await adminClient
        .from('ads')
        .update({ is_active: false })
        .eq('id', id)

      if (archiveError) {
        console.error('Error archiving ad:', archiveError)
        return NextResponse.json({ error: archiveError.message }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        archived: true,
        message: 'Ad has analytics data and was deactivated instead of deleted'
      })
    }

    // No analytics - safe to delete
    const { error } = await adminClient
      .from('ads')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting ad:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/ads/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update an ad
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, ad_zone, ad_type, content, link_url, priority, is_active, start_date, end_date, monthly_fee } = body

    // Use admin client for database operations (bypasses RLS)
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('ads')
      .update({
        name,
        ad_zone,
        ad_type,
        content,
        link_url,
        priority: priority || 0,
        is_active,
        start_date: start_date || null,
        end_date: end_date || null,
        monthly_fee: monthly_fee || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating ad:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PUT /api/admin/ads/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Archive/deactivate an ad
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Use admin client for database operations (bypasses RLS)
    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('ads')
      .update({ is_active: body.is_active })
      .eq('id', id)

    if (error) {
      console.error('Error updating ad:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PATCH /api/admin/ads/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
