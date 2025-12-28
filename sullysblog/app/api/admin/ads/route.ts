import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching ads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, ad_zone, ad_type, content, link_url, priority, is_active, start_date, end_date, monthly_fee } = body

    if (!name || !ad_zone || !ad_type) {
      return NextResponse.json({ error: 'Name, ad zone, and ad type are required' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('ads')
      .insert({
        name,
        ad_zone,
        ad_type,
        content,
        link_url,
        priority: priority || 0,
        is_active: is_active ?? true,
        start_date: start_date || null,
        end_date: end_date || null,
        monthly_fee: monthly_fee || 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating ad:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating ad:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
