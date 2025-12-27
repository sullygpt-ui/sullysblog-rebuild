/**
 * Email Templates for Resource Expiration Notifications
 */

type EmailData = {
  resourceName: string
  expiryDate: string
  daysRemaining: number
  monthlyFee: number
  adminUrl: string
}

export function getExpirationWarning7Days(data: EmailData) {
  return {
    subject: `⏰ Resource Expiring in 7 Days: ${data.resourceName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Sponsorship Expiring Soon</h1>
            </div>
            <div class="content">
              <p>Hello,</p>

              <div class="warning-box">
                <strong>${data.resourceName}</strong> sponsorship will expire in <strong>${data.daysRemaining} days</strong> on <strong>${data.expiryDate}</strong>.
              </div>

              <p>To continue enjoying premium placement in our directory, please renew your sponsorship.</p>

              <p><strong>Current Plan:</strong></p>
              <ul>
                <li>Monthly Fee: $${data.monthlyFee.toFixed(2)}</li>
                <li>Expiry Date: ${data.expiryDate}</li>
              </ul>

              <p>After expiration, your listing will enter a 7-day grace period where it will continue to show as sponsored. After the grace period, it will be automatically downgraded to a free listing.</p>

              <a href="${data.adminUrl}" class="button">Manage Resource</a>

              <p>Questions? Reply to this email and we'll be happy to help!</p>

              <p>Best regards,<br>SullysBlog Team</p>
            </div>
            <div class="footer">
              <p>You're receiving this because you have an active sponsorship on SullysBlog.com</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

export function getExpirationWarning3Days(data: EmailData) {
  return {
    subject: `🚨 URGENT: Resource Expiring in 3 Days: ${data.resourceName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .urgent-box { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 URGENT: Expiring in 3 Days</h1>
            </div>
            <div class="content">
              <p>Hello,</p>

              <div class="urgent-box">
                <strong>FINAL REMINDER:</strong> <strong>${data.resourceName}</strong> sponsorship expires in <strong>${data.daysRemaining} days</strong> on <strong>${data.expiryDate}</strong>.
              </div>

              <p>This is your final reminder before your sponsorship expires. After ${data.expiryDate}, your listing will enter a 7-day grace period.</p>

              <p><strong>What happens next:</strong></p>
              <ul>
                <li>${data.expiryDate}: Sponsorship expires, grace period begins</li>
                <li>During grace period: Listing continues to show as sponsored</li>
                <li>After grace period: Automatically downgraded to free listing</li>
              </ul>

              <p><strong>Renew now to maintain your premium placement!</strong></p>

              <a href="${data.adminUrl}" class="button">Renew Now</a>

              <p>Need help? Reply to this email or contact us immediately.</p>

              <p>Best regards,<br>SullysBlog Team</p>
            </div>
            <div class="footer">
              <p>You're receiving this because your sponsorship is expiring soon</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

export function getGracePeriodStarted(data: EmailData) {
  return {
    subject: `⚠️ Grace Period Started: ${data.resourceName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 52%, #2BFF88 90%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Grace Period Started</h1>
            </div>
            <div class="content">
              <p>Hello,</p>

              <div class="info-box">
                Your sponsorship for <strong>${data.resourceName}</strong> has expired and entered the <strong>7-day grace period</strong>.
              </div>

              <p><strong>What this means:</strong></p>
              <ul>
                <li>Your listing is still showing as sponsored</li>
                <li>You have 7 days to renew</li>
                <li>If you renew during grace period, those days will be included in your new subscription</li>
                <li>After 7 days, listing will be downgraded to free</li>
              </ul>

              <p><strong>Renew now to keep your premium placement!</strong></p>

              <a href="${data.adminUrl}" class="button">Renew Sponsorship</a>

              <p>Questions? We're here to help - just reply to this email.</p>

              <p>Best regards,<br>SullysBlog Team</p>
            </div>
            <div class="footer">
              <p>You're receiving this because your sponsorship expired today</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

export function getDowngradedToFree(data: EmailData) {
  return {
    subject: `Sponsorship Ended: ${data.resourceName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: #e7e7e7; border-left: 4px solid #6c757d; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Sponsorship Ended</h1>
            </div>
            <div class="content">
              <p>Hello,</p>

              <div class="info-box">
                The grace period for <strong>${data.resourceName}</strong> has ended. Your listing has been downgraded to a free listing.
              </div>

              <p><strong>What changed:</strong></p>
              <ul>
                <li>Listing is now in the "Free" section</li>
                <li>No longer has sponsored/featured badge</li>
                <li>Reduced visibility compared to sponsored listings</li>
              </ul>

              <p><strong>Good news:</strong> Your listing is still active and visible in our directory! Upgrade anytime to regain premium placement.</p>

              <a href="${data.adminUrl}" class="button">Upgrade to Sponsored</a>

              <p>Thank you for being part of the SullysBlog community!</p>

              <p>Best regards,<br>SullysBlog Team</p>
            </div>
            <div class="footer">
              <p>Want to upgrade again? Just let us know!</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

export function getRenewalConfirmation(data: EmailData) {
  return {
    subject: `✅ Sponsorship Renewed: ${data.resourceName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Sponsorship Renewed!</h1>
            </div>
            <div class="content">
              <p>Hello,</p>

              <div class="success-box">
                Great news! Your sponsorship for <strong>${data.resourceName}</strong> has been renewed successfully.
              </div>

              <p><strong>Renewal Details:</strong></p>
              <ul>
                <li>Monthly Fee: $${data.monthlyFee.toFixed(2)}</li>
                <li>New Expiry Date: ${data.expiryDate}</li>
                <li>Status: Active</li>
              </ul>

              <p>Your listing will continue to enjoy premium placement in our directory.</p>

              <a href="${data.adminUrl}" class="button">View Resource</a>

              <p>Thank you for your continued partnership!</p>

              <p>Best regards,<br>SullysBlog Team</p>
            </div>
            <div class="footer">
              <p>Questions? Just reply to this email!</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}
