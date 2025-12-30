import crypto from 'crypto'

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID

// Extract datacenter from API key (e.g., "us21" from "xxx-us21")
const getDatacenter = () => {
  if (!MAILCHIMP_API_KEY) return null
  const parts = MAILCHIMP_API_KEY.split('-')
  return parts[parts.length - 1]
}

// Get MD5 hash of lowercase email for Mailchimp subscriber ID
const getSubscriberHash = (email: string) => {
  return crypto.createHash('md5').update(email.toLowerCase()).digest('hex')
}

type SubscribeOptions = {
  email: string
  firstName?: string
  lastName?: string
  tags?: string[]
}

type MailchimpError = {
  title: string
  detail: string
  status: number
}

/**
 * Add or update a subscriber in Mailchimp
 * Uses PUT to upsert - adds new subscribers or updates existing ones
 */
export async function addSubscriber(options: SubscribeOptions): Promise<{ success: boolean; error?: string }> {
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
    console.log('Mailchimp not configured - skipping subscriber add')
    return { success: false, error: 'Mailchimp not configured' }
  }

  const datacenter = getDatacenter()
  if (!datacenter) {
    return { success: false, error: 'Invalid Mailchimp API key format' }
  }

  const subscriberHash = getSubscriberHash(options.email)
  const url = `https://${datacenter}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members/${subscriberHash}`

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`
      },
      body: JSON.stringify({
        email_address: options.email,
        status_if_new: 'subscribed',
        merge_fields: {
          ...(options.firstName && { FNAME: options.firstName }),
          ...(options.lastName && { LNAME: options.lastName })
        }
      })
    })

    if (!response.ok) {
      const error: MailchimpError = await response.json()
      console.error('Mailchimp API error:', error)
      return { success: false, error: error.detail || error.title }
    }

    // Add tags if provided
    if (options.tags && options.tags.length > 0) {
      await addTagsToSubscriber(options.email, options.tags)
    }

    console.log(`Successfully added/updated subscriber: ${options.email}`)
    return { success: true }
  } catch (error) {
    console.error('Error adding subscriber to Mailchimp:', error)
    return { success: false, error: 'Failed to connect to Mailchimp' }
  }
}

/**
 * Add tags to a subscriber
 */
export async function addTagsToSubscriber(email: string, tags: string[]): Promise<{ success: boolean; error?: string }> {
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
    return { success: false, error: 'Mailchimp not configured' }
  }

  const datacenter = getDatacenter()
  if (!datacenter) {
    return { success: false, error: 'Invalid Mailchimp API key format' }
  }

  const subscriberHash = getSubscriberHash(email)
  const url = `https://${datacenter}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members/${subscriberHash}/tags`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`
      },
      body: JSON.stringify({
        tags: tags.map(tag => ({ name: tag, status: 'active' }))
      })
    })

    if (!response.ok) {
      const error: MailchimpError = await response.json()
      console.error('Mailchimp tags error:', error)
      return { success: false, error: error.detail || error.title }
    }

    console.log(`Successfully added tags to ${email}:`, tags)
    return { success: true }
  } catch (error) {
    console.error('Error adding tags in Mailchimp:', error)
    return { success: false, error: 'Failed to add tags' }
  }
}

/**
 * Check if a subscriber exists and their status
 */
export async function getSubscriberStatus(email: string): Promise<{ exists: boolean; status?: string; error?: string }> {
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
    return { exists: false, error: 'Mailchimp not configured' }
  }

  const datacenter = getDatacenter()
  if (!datacenter) {
    return { exists: false, error: 'Invalid Mailchimp API key format' }
  }

  const subscriberHash = getSubscriberHash(email)
  const url = `https://${datacenter}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members/${subscriberHash}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`
      }
    })

    if (response.status === 404) {
      return { exists: false }
    }

    if (!response.ok) {
      const error: MailchimpError = await response.json()
      return { exists: false, error: error.detail || error.title }
    }

    const data = await response.json()
    return { exists: true, status: data.status }
  } catch (error) {
    console.error('Error checking subscriber in Mailchimp:', error)
    return { exists: false, error: 'Failed to connect to Mailchimp' }
  }
}
