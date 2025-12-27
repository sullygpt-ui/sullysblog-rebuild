import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for cron jobs (no user context)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET(request: NextRequest) {
  // Optional: Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date().toISOString()

    // Find all scheduled posts that should be published
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, slug')
      .eq('status', 'scheduled')
      .lte('published_at', now)

    if (fetchError) {
      console.error('Error fetching scheduled posts:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch scheduled posts' }, { status: 500 })
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return NextResponse.json({ message: 'No posts to publish', published: 0 })
    }

    // Update all due posts to published status
    const postIds = scheduledPosts.map(p => p.id)
    const { error: updateError } = await supabase
      .from('posts')
      .update({ status: 'published' })
      .in('id', postIds)

    if (updateError) {
      console.error('Error publishing posts:', updateError)
      return NextResponse.json({ error: 'Failed to publish posts' }, { status: 500 })
    }

    console.log(`Published ${scheduledPosts.length} scheduled posts:`, scheduledPosts.map(p => p.title))

    return NextResponse.json({
      message: `Published ${scheduledPosts.length} post(s)`,
      published: scheduledPosts.length,
      posts: scheduledPosts.map(p => ({ id: p.id, title: p.title, slug: p.slug }))
    })

  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request)
}
