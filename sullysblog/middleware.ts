import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Handle WordPress-style RSS feed URLs
  const feedParam = request.nextUrl.searchParams.get('feed')
  if (feedParam === 'rss2' || feedParam === 'rss') {
    const feedUrl = new URL('/api/feed', request.url)
    // Pass through any category filter
    const cat = request.nextUrl.searchParams.get('cat')
    if (cat) {
      feedUrl.searchParams.set('cat', cat)
    }
    return NextResponse.rewrite(feedUrl)
  }

  // Check if Supabase env vars are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Skip auth check for non-protected routes or if env vars missing
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login'
  const isProtectedStoreRoute = ['/store/orders', '/store/checkout'].some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (!supabaseUrl || !supabaseAnonKey) {
    // Allow public routes, block protected routes
    if (isAdminRoute || isProtectedStoreRoute) {
      return new NextResponse('Configuration error', { status: 500 })
    }
    return NextResponse.next()
  }

  // Only import Supabase when we need auth checking
  if (!isAdminRoute && !isProtectedStoreRoute &&
      request.nextUrl.pathname !== '/admin/login' &&
      request.nextUrl.pathname !== '/auth/login' &&
      request.nextUrl.pathname !== '/auth/register') {
    return NextResponse.next()
  }

  // Dynamically import Supabase SSR
  const { createServerClient } = await import('@supabase/ssr')

  let supabaseResponse = NextResponse.next({
    request,
  })

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
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser()

  // Protect admin routes (except login page)
  if (isAdminRoute && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/admin/login'
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in and trying to access admin login page, redirect to admin dashboard
  if (request.nextUrl.pathname === '/admin/login' && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/admin'
    return NextResponse.redirect(redirectUrl)
  }

  // Protect store routes that require authentication
  if (isProtectedStoreRoute && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in and trying to access auth pages, redirect to store
  if ((request.nextUrl.pathname === '/auth/login' || request.nextUrl.pathname === '/auth/register') && user) {
    const params = request.nextUrl.searchParams
    const redirectTo = params.get('redirectTo') || '/store'
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = redirectTo
    redirectUrl.searchParams.delete('redirectTo')
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
