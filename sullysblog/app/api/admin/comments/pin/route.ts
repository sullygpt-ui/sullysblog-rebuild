import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Verify admin user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin
    const { data: profile } = await adminSupabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { commentId } = body

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID required' }, { status: 400 })
    }

    // Get current pin status
    const { data: comment } = await adminSupabase
      .from('comments')
      .select('is_pinned')
      .eq('id', commentId)
      .single()

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Toggle pin status
    const { error } = await adminSupabase
      .from('comments')
      .update({ is_pinned: !comment.is_pinned })
      .eq('id', commentId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, is_pinned: !comment.is_pinned })
  } catch (error) {
    console.error('Pin comment error:', error)
    return NextResponse.json({ error: 'Failed to pin comment' }, { status: 500 })
  }
}
