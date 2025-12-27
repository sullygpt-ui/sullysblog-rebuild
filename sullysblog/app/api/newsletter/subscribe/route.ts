import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Use service role for server-side inserts (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // Save to Supabase
    const { error: dbError } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        { email: email.toLowerCase(), subscribed_at: new Date().toISOString() },
        { onConflict: 'email' }
      )

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save subscription' },
        { status: 500 }
      )
    }

    // Sync to Mailchimp if configured
    const mailchimpApiKey = process.env.MAILCHIMP_API_KEY
    const mailchimpListId = process.env.MAILCHIMP_LIST_ID
    const mailchimpServer = process.env.MAILCHIMP_SERVER_PREFIX // e.g., 'us21'

    if (mailchimpApiKey && mailchimpListId && mailchimpServer) {
      try {
        const response = await fetch(
          `https://${mailchimpServer}.api.mailchimp.com/3.0/lists/${mailchimpListId}/members`,
          {
            method: 'POST',
            headers: {
              'Authorization': `apikey ${mailchimpApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email_address: email.toLowerCase(),
              status: 'subscribed',
            }),
          }
        )

        if (!response.ok) {
          const data = await response.json()
          // Member already exists is not an error
          if (data.title !== 'Member Exists') {
            console.error('Mailchimp error:', data)
          }
        }
      } catch (mailchimpError) {
        console.error('Mailchimp sync failed:', mailchimpError)
        // Don't fail the request if Mailchimp fails - email is already saved to DB
      }
    }

    return NextResponse.json({ success: true, message: 'Successfully subscribed!' })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
