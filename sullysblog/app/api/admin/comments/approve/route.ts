import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Get the comment
    const { data: comment } = await adminSupabase
      .from('comments')
      .select('*, posts(title, slug)')
      .eq('id', commentId)
      .single()

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Approve the comment
    const { error } = await adminSupabase
      .from('comments')
      .update({ status: 'approved' })
      .eq('id', commentId)

    if (error) {
      throw error
    }

    // Send queued notifications
    const { data: notifications } = await adminSupabase
      .from('comment_notifications')
      .select('*')
      .eq('comment_id', commentId)
      .is('sent_at', null)

    if (notifications && notifications.length > 0) {
      const post = comment.posts as { title: string; slug: string }
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sullysblog.com'

      for (const notification of notifications) {
        try {
          // Get the parent comment for context
          const { data: parentComment } = await adminSupabase
            .from('comments')
            .select('author_name')
            .eq('id', comment.parent_id)
            .single()

          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'SullysBlog <noreply@contact.sullysblog.com>',
            to: [notification.recipient_email],
            subject: `New reply to your comment on "${post?.title || 'SullysBlog'}"`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1a1a1a; margin-bottom: 20px;">Someone replied to your comment!</h2>

                <p style="color: #666; line-height: 1.6;">
                  <strong>${comment.author_name}</strong> replied to your comment on the post
                  "<a href="${siteUrl}/${post?.slug || ''}" style="color: #2563eb; text-decoration: none;">${post?.title || 'SullysBlog'}</a>":
                </p>

                <div style="background: #f5f5f5; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  ${comment.content}
                </div>

                <p style="margin-top: 20px;">
                  <a href="${siteUrl}/${post?.slug || ''}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                    View the conversation
                  </a>
                </p>

                <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                  You received this email because you opted to receive notifications for replies to your comments on SullysBlog.
                </p>
              </div>
            `,
          })

          // Mark notification as sent
          await adminSupabase
            .from('comment_notifications')
            .update({ sent_at: new Date().toISOString() })
            .eq('id', notification.id)

        } catch (emailError) {
          console.error('Failed to send notification email:', emailError)
          // Don't fail the whole request if email fails
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Approve comment error:', error)
    return NextResponse.json({ error: 'Failed to approve comment' }, { status: 500 })
  }
}
