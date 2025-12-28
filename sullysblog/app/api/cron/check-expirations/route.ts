import { sendAllExpirationNotifications } from '@/lib/email/notifications'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Cron endpoint to check for expiring resources and ads, then send notifications
 *
 * Set up a cron job to call this endpoint daily:
 * - Using Vercel Cron: Add to vercel.json
 * - Using external service: Call this URL daily
 *
 * Secure with CRON_SECRET environment variable
 *
 * Notifications sent:
 * - Resources: 7 days, 3 days before expiration
 * - Ads: 14 days, 7 days before expiration
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

    console.log('🔔 Starting expiration check for resources and ads...')

    const result = await sendAllExpirationNotifications()

    const totalSent = result.resources.sent + result.ads.sent
    const totalErrors = result.resources.errors + result.ads.errors

    return NextResponse.json({
      success: true,
      summary: {
        totalSent,
        totalErrors
      },
      resources: {
        sent: result.resources.sent,
        errors: result.resources.errors,
        details: result.resources.details
      },
      ads: {
        sent: result.ads.sent,
        errors: result.ads.errors,
        details: result.ads.details
      }
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
