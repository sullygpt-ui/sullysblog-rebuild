import { sendExpirationNotifications } from '@/lib/email/notifications'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Cron endpoint to check for expiring resources and send notifications
 *
 * Set up a cron job to call this endpoint daily:
 * - Using Vercel Cron: Add to vercel.json
 * - Using external service: Call this URL daily
 *
 * Secure with CRON_SECRET environment variable
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔔 Starting expiration check...')

    const result = await sendExpirationNotifications()

    return NextResponse.json({
      success: true,
      sent: result.sent,
      errors: result.errors,
      details: result.details
    })
  } catch (error) {
    console.error('Error in cron job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also allow POST for manual triggering from admin panel
export async function POST(request: NextRequest) {
  return GET(request)
}
