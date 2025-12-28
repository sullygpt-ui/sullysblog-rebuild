import { createClient } from '@supabase/supabase-js'
import { sendEmail } from './sender'
import {
  getExpirationWarning7Days,
  getExpirationWarning3Days,
  getGracePeriodStarted,
  getDowngradedToFree,
  getAdExpirationWarning14Days,
  getAdExpirationWarning7Days,
} from './templates'

// Server-side client with service key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

type NotificationResult = {
  sent: number
  errors: number
  details: Array<{
    resource: string
    type: string
    success: boolean
    error?: any
  }>
}

export async function sendExpirationNotifications(): Promise<NotificationResult> {
  const result: NotificationResult = {
    sent: 0,
    errors: 0,
    details: []
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sullysblog.com'
  const adminUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/admin/resources`
    : 'https://sullysblog.com/admin/resources'

  try {
    // Get all active paid resources
    const { data: resources, error } = await supabase
      .from('resources')
      .select('*')
      .in('listing_type', ['sponsored', 'featured'])
      .in('status', ['active', 'grace_period'])
      .not('end_date', 'is', null)

    if (error) {
      console.error('Error fetching resources:', error)
      return result
    }

    if (!resources || resources.length === 0) {
      console.log('No paid resources with expiration dates found')
      return result
    }

    const now = new Date()
    now.setHours(0, 0, 0, 0) // Start of today

    for (const resource of resources) {
      const endDate = new Date(resource.end_date)
      endDate.setHours(0, 0, 0, 0) // Start of end date

      const diffTime = endDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      const emailData = {
        resourceName: resource.name,
        expiryDate: endDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        daysRemaining: diffDays,
        monthlyFee: resource.monthly_fee || 0,
        adminUrl
      }

      let shouldSend = false
      let emailTemplate: any = null
      let notificationType = ''

      // Check if we should send a notification
      if (diffDays === 7 && resource.status === 'active') {
        // 7 days before expiration
        emailTemplate = getExpirationWarning7Days(emailData)
        shouldSend = true
        notificationType = '7-day warning'
      } else if (diffDays === 3 && resource.status === 'active') {
        // 3 days before expiration
        emailTemplate = getExpirationWarning3Days(emailData)
        shouldSend = true
        notificationType = '3-day warning'
      } else if (diffDays === 0 && resource.status === 'active') {
        // Expiration day - grace period starts
        emailTemplate = getGracePeriodStarted(emailData)
        shouldSend = true
        notificationType = 'grace period started'

        // Also update resource status to grace_period
        await supabase
          .from('resources')
          .update({ status: 'grace_period' })
          .eq('id', resource.id)
      } else if (diffDays === -7 && resource.status === 'grace_period') {
        // 7 days after expiration - downgrade to free
        emailTemplate = getDowngradedToFree(emailData)
        shouldSend = true
        notificationType = 'downgraded to free'

        // Update resource to free listing
        await supabase
          .from('resources')
          .update({
            listing_type: 'free',
            status: 'active',
            monthly_fee: 0
          })
          .eq('id', resource.id)
      }

      if (shouldSend && emailTemplate) {
        const emailResult = await sendEmail({
          to: adminEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html
        })

        if (emailResult.success) {
          result.sent++
          result.details.push({
            resource: resource.name,
            type: notificationType,
            success: true
          })
          console.log(`✅ Sent ${notificationType} for ${resource.name}`)
        } else {
          result.errors++
          result.details.push({
            resource: resource.name,
            type: notificationType,
            success: false,
            error: emailResult.error
          })
          console.error(`❌ Failed to send ${notificationType} for ${resource.name}:`, emailResult.error)
        }
      }
    }

    console.log(`\n📊 Notification Summary:`)
    console.log(`   ✅ Sent: ${result.sent}`)
    console.log(`   ❌ Errors: ${result.errors}`)

    return result
  } catch (error) {
    console.error('Error in sendExpirationNotifications:', error)
    return result
  }
}

/**
 * Send ad expiration notifications
 * Sends emails 14 days and 7 days before ads expire
 */
export async function sendAdExpirationNotifications(): Promise<NotificationResult> {
  const result: NotificationResult = {
    sent: 0,
    errors: 0,
    details: []
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sullysblog.com'
  const adminUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/admin/ads`
    : 'https://sullysblog.com/admin/ads'

  try {
    // Get all active ads with end dates
    const { data: ads, error } = await supabase
      .from('ads')
      .select('*')
      .eq('is_active', true)
      .not('end_date', 'is', null)

    if (error) {
      console.error('Error fetching ads:', error)
      return result
    }

    if (!ads || ads.length === 0) {
      console.log('No active ads with expiration dates found')
      return result
    }

    const now = new Date()
    now.setHours(0, 0, 0, 0) // Start of today

    for (const ad of ads) {
      const endDate = new Date(ad.end_date)
      endDate.setHours(0, 0, 0, 0) // Start of end date

      const diffTime = endDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      const emailData = {
        adName: ad.name,
        adZone: ad.ad_zone,
        expiryDate: endDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        daysRemaining: diffDays,
        adminUrl
      }

      let shouldSend = false
      let emailTemplate: any = null
      let notificationType = ''

      // Check if we should send a notification
      if (diffDays === 14) {
        // 14 days before expiration
        emailTemplate = getAdExpirationWarning14Days(emailData)
        shouldSend = true
        notificationType = '14-day warning'
      } else if (diffDays === 7) {
        // 7 days before expiration
        emailTemplate = getAdExpirationWarning7Days(emailData)
        shouldSend = true
        notificationType = '7-day warning'
      }

      if (shouldSend && emailTemplate) {
        const emailResult = await sendEmail({
          to: adminEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html
        })

        if (emailResult.success) {
          result.sent++
          result.details.push({
            resource: ad.name,
            type: notificationType,
            success: true
          })
          console.log(`✅ Sent ${notificationType} for ad: ${ad.name}`)
        } else {
          result.errors++
          result.details.push({
            resource: ad.name,
            type: notificationType,
            success: false,
            error: emailResult.error
          })
          console.error(`❌ Failed to send ${notificationType} for ad: ${ad.name}:`, emailResult.error)
        }
      }
    }

    console.log(`\n📊 Ad Notification Summary:`)
    console.log(`   ✅ Sent: ${result.sent}`)
    console.log(`   ❌ Errors: ${result.errors}`)

    return result
  } catch (error) {
    console.error('Error in sendAdExpirationNotifications:', error)
    return result
  }
}

/**
 * Send all expiration notifications (resources + ads)
 */
export async function sendAllExpirationNotifications(): Promise<{
  resources: NotificationResult
  ads: NotificationResult
}> {
  const [resources, ads] = await Promise.all([
    sendExpirationNotifications(),
    sendAdExpirationNotifications()
  ])

  return { resources, ads }
}
