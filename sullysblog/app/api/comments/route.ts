import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, parentId, authorName, authorEmail, authorUrl, content } = body

    // Validation
    if (!postId || !authorName || !authorEmail || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(authorEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Basic content validation
    if (content.trim().length < 2) {
      return NextResponse.json(
        { error: 'Comment is too short' },
        { status: 400 }
      )
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { error: 'Comment is too long (max 10,000 characters)' },
        { status: 400 }
      )
    }

    // Get IP and user agent for spam detection
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] ||
                      headersList.get('x-real-ip') ||
                      'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    // Check if this email has approved comments before
    const { data: existingComments } = await supabase
      .from('comments')
      .select('id')
      .eq('author_email', authorEmail)
      .eq('status', 'approved')
      .limit(1)

    const isFirstTime = !existingComments || existingComments.length === 0

    // Sanitize content - basic HTML escaping
    const sanitizedContent = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>')

    // Insert comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        parent_id: parentId || null,
        author_name: authorName.trim(),
        author_email: authorEmail.toLowerCase().trim(),
        author_url: authorUrl?.trim() || null,
        content: sanitizedContent,
        status: 'pending', // All comments require moderation
        is_first_time: isFirstTime,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting comment:', error)
      return NextResponse.json(
        { error: 'Failed to save comment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Comment submitted successfully and is awaiting moderation',
      commentId: comment.id,
    })

  } catch (error) {
    console.error('Comment submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
