import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/sender'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Send email to site owner
    const ownerEmail = process.env.CONTACT_EMAIL || 'mike@sullysblog.com'

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>

        <div style="margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>From:</strong> ${name}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>
        </div>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Message:</h3>
          <p style="color: #4b5563; white-space: pre-wrap;">${message}</p>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

        <p style="color: #9ca3af; font-size: 12px;">
          This message was sent from the contact form on SullysBlog.com
        </p>
      </div>
    `

    const result = await sendEmail({
      to: ownerEmail,
      subject: `[Contact Form] ${subject}`,
      html: htmlContent
    })

    if (!result.success) {
      console.error('Failed to send contact email:', result.error)
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in contact form:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
