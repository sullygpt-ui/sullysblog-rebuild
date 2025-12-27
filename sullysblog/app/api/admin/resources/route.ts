import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST - Create new resource
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from('resources')
      .insert({
        name: body.name,
        slug: body.slug,
        category: body.category,
        short_description: body.short_description || null,
        full_description: body.full_description || null,
        destination_url: body.destination_url,
        redirect_slug: body.redirect_slug,
        logo_url: body.logo_url || null,
        listing_type: body.listing_type,
        monthly_fee: body.monthly_fee,
        start_date: body.start_date,
        end_date: body.end_date,
        status: body.status,
        display_order: body.display_order
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating resource:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in POST /api/admin/resources:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
