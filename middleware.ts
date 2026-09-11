import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAuth, requireAdmin } from '@/lib/auth/authorization'
import { verifyToken } from '@/lib/auth/jwt'

const GUEST_ONLY_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']

// Middleware centralizes route protection so auth and admin authorization are enforced consistently before requests reach routes.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const token = getAuthCookie(request.cookies)

  // Redirect authenticated users away from guest-only auth pages
  const isGuestOnlyRoute = GUEST_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isGuestOnlyRoute) {
    if (token) {
      try {
        const payload = await verifyToken(token)
        if (payload?.sub) {
          const role = String(payload.role || 'CUSTOMER')
          let target = role === 'ADMIN' ? '/admin' : '/dashboard'

          const redirectTo = request.nextUrl.searchParams.get('redirectTo')
          if (redirectTo && redirectTo.startsWith('/')) {
            if (redirectTo.startsWith('/admin') && role !== 'ADMIN') {
              target = '/dashboard'
            } else {
              target = redirectTo
            }
          }

          return NextResponse.redirect(new URL(target, request.url))
        }
      } catch {
        // Invalid or expired token -> proceed to auth route
      }
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin/setup')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    try {
      await requireAdmin(token)
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/dashboard')
  ) {
    try {
      await requireAuth(token)
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/checkout/:path*',
    '/orders/:path*',
    '/account/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ],
}
