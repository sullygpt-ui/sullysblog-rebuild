/**
 * Email Templates for Resource Expiration Notifications and Purchase Confirmations
 */

// Purchase Confirmation Email
type PurchaseEmailData = {
  customerEmail: string
  productName: string
  orderNumber: string
  downloadUrl: string
  siteUrl: string
}

// Domain Purchase Confirmation Email
type DomainPurchaseEmailData = {
  customerEmail: string
  domainName: string
  siteUrl: string
}

export function getDomainPurchaseConfirmation(data: DomainPurchaseEmailData) {
  return {
    subject: `Domain Purchase Confirmed: ${data.domainName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
            .domain-box { background: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; border: 2px solid #667eea; }
            .domain-name { font-size: 24px; font-weight: bold; color: #667eea; }
            .steps { background: #fff; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .steps ol { margin: 0; padding-left: 20px; }
            .steps li { margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Domain Purchase Confirmed!</h1>
            </div>
            <div class="content">
              <div class="success-box">
                Your domain purchase has been confirmed. We'll begin the transfer process shortly.
              </div>

              <div class="domain-box">
                <p style="margin: 0 0 10px 0; color: #666;">You now own:</p>
                <p class="domain-name">${data.domainName}</p>
              </div>

              <div class="steps">
                <p><strong>What happens next:</strong></p>
                <ol>
                  <li>We'll initiate the domain transfer within 24-48 hours</li>
                  <li>You'll receive an email with transfer instructions</li>
                  <li>Follow the instructions to accept the transfer to your registrar</li>
                  <li>The transfer typically completes within 5-7 days</li>
                </ol>
              </div>

              <p>If you have any questions about your domain purchase or the transfer process, just reply to this email.</p>

              <p>Thank you for your purchase!</p>

              <p>Best regards,<br>SullysBlog Team</p>
            </div>
            <div class="footer">
              <p>You're receiving this because you purchased a domain at SullysBlog.com</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

export function getPurchaseConfirmation(data: PurchaseEmailData) {
  return {
    subject: `Your purchase: ${data.productName}`,
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
            .order-details { background: #fff; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Your Purchase!</h1>
            </div>
            <div class="content">
              <div class="success-box">
                Your order has been confirmed and your download is ready.
              </div>

              <div class="order-details">
                <p><strong>Order Number:</strong> ${data.orderNumber}</p>
                <p><strong>Product:</strong> ${data.productName}</p>
              </div>

              <p>Click the button below to access your purchase:</p>

              <p style="text-align: center;">
                <a href="${data.downloadUrl}" class="button">Download Now</a>
              </p>

              <p>You can also access your purchases anytime by logging into your account at <a href="${data.siteUrl}/store/orders">${data.siteUrl}/store/orders</a>.</p>

              <p>If you have any questions, just reply to this email.</p>

              <p>Best regards,<br>SullysBlog Team</p>
            </div>
            <div class="footer">
              <p>You're receiving this because you made a purchase at SullysBlog.com</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

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

// Ad Expiration Templates
type AdEmailData = {
  adName: string
  adZone: string
  expiryDate: string
  daysRemaining: number
  adminUrl: string
}

export function getAdExpirationWarning14Days(data: AdEmailData) {
  return {
    subject: `⏰ Ad Expiring in 14 Days: ${data.adName}`,
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
              <h1>⏰ Ad Expiring in 14 Days</h1>
            </div>
            <div class="content">
              <p>Hello,</p>

              <div class="warning-box">
                The ad <strong>"${data.adName}"</strong> will expire in <strong>${data.daysRemaining} days</strong> on <strong>${data.expiryDate}</strong>.
              </div>

              <p><strong>Ad Details:</strong></p>
              <ul>
                <li>Name: ${data.adName}</li>
                <li>Zone: ${data.adZone}</li>
                <li>Expiry Date: ${data.expiryDate}</li>
              </ul>

              <p>After expiration, this ad will automatically stop displaying on your site. Please renew or update the ad if you want it to continue running.</p>

              <a href="${data.adminUrl}" class="button">Manage Ads</a>

              <p>Best regards,<br>SullysBlog</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from SullysBlog.com</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

export function getAdExpirationWarning7Days(data: AdEmailData) {
  return {
    subject: `🚨 URGENT: Ad Expiring in 7 Days: ${data.adName}`,
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
              <h1>🚨 Ad Expiring in 7 Days</h1>
            </div>
            <div class="content">
              <p>Hello,</p>

              <div class="urgent-box">
                <strong>FINAL REMINDER:</strong> The ad <strong>"${data.adName}"</strong> expires in <strong>${data.daysRemaining} days</strong> on <strong>${data.expiryDate}</strong>.
              </div>

              <p><strong>Ad Details:</strong></p>
              <ul>
                <li>Name: ${data.adName}</li>
                <li>Zone: ${data.adZone}</li>
                <li>Expiry Date: ${data.expiryDate}</li>
              </ul>

              <p><strong>What happens next:</strong></p>
              <ul>
                <li>After ${data.expiryDate}, this ad will stop displaying</li>
                <li>The ad will remain in your admin panel for reference</li>
                <li>You can extend the end date anytime to continue running the ad</li>
              </ul>

              <a href="${data.adminUrl}" class="button">Renew Ad Now</a>

              <p>Best regards,<br>SullysBlog</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from SullysBlog.com</p>
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
