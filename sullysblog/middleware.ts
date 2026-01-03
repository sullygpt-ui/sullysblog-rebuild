import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Handle WordPress-style RSS feed URLs
  const feedParam = request.nextUrl.searchParams.get('feed')
  if (feedParam === 'rss2' || feedParam === 'rss') {
    const feedUrl = new URL('/api/feed', request.url)
    const cat = request.nextUrl.searchParams.get('cat')
    if (cat) {
      feedUrl.searchParams.set('cat', cat)
    }
    return NextResponse.rewrite(feedUrl)
  }

  // Handle /category/:slug/feed URLs (including /atom suffix)
  const pathname = request.nextUrl.pathname
  const categoryFeedMatch = pathname.match(/^\/category\/([^/]+)\/feed(\/atom)?\/?$/)
  if (categoryFeedMatch) {
    const slug = categoryFeedMatch[1]
    const feedUrl = new URL('/api/feed', request.url)
    // Handle typo "domians" -> "domains"
    feedUrl.searchParams.set('cat', slug === 'domians' ? 'domains' : slug)
    return NextResponse.rewrite(feedUrl)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login'
  const isProtectedStoreRoute = ['/store/orders', '/store/checkout'].some(route =>
    request.nextUrl.pathname.startsWith(route)
  )
  const isAuthRoute = request.nextUrl.pathname === '/auth/login' || request.nextUrl.pathname === '/auth/register'

  // Skip auth for public routes or if env vars missing
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isAdminRoute || isProtectedStoreRoute) {
      return new NextResponse('Configuration error', { status: 500 })
    }
    return NextResponse.next()
  }

  // Only check auth for protected routes
  if (!isAdminRoute && !isProtectedStoreRoute && !isAuthRoute && request.nextUrl.pathname !== '/admin/login') {
    return NextResponse.next()
  }

  // Dynamically import Supabase SSR
  const { createServerClient } = await import('@supabase/ssr')

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect admin routes
  if (isAdminRoute && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/admin/login'
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect logged-in users from admin login to dashboard
  if (request.nextUrl.pathname === '/admin/login' && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/admin'
    return NextResponse.redirect(redirectUrl)
  }

  // Protect store routes
  if (isProtectedStoreRoute && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect logged-in users from auth pages
  if (isAuthRoute && user) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/store'
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = redirectTo
    redirectUrl.searchParams.delete('redirectTo')
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
