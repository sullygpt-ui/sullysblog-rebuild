import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type EmailOptions = {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    // Use Resend's default sender until custom domain is verified
    // To use your own domain, verify it at https://resend.com/domains
    // then set EMAIL_FROM=SullysBlog <noreply@sullysblog.com>
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'SullysBlog <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }

    console.log('Email sent successfully:', data?.id)
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}
