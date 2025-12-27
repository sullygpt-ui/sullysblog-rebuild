import { getResourceByRedirectSlug } from '@/lib/queries/resources'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  if (!slug) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Get the resource
  const resource = await getResourceByRedirectSlug(slug)

  if (!resource) {
    console.error(`Resource not found for redirect slug: ${slug}`)
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Track the click
  try {
    const supabase = await createClient()

    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''

    await supabase
      .from('resource_clicks')
      .insert({
        resource_id: resource.id,
        ip_address: ipAddress.substring(0, 255),
        user_agent: userAgent.substring(0, 255),
        referer: referer.substring(0, 255),
        page_url: `/go/${slug}`
      })
  } catch (error) {
    console.error('Error tracking click in redirect:', error)
    // Continue with redirect even if tracking fails
  }

  // Redirect to destination URL
  return NextResponse.redirect(resource.destination_url, 302)
}
