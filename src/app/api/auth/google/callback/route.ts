import { authService } from '@/services/auth.service'
import { setAuthCookie } from '@/lib/auth/session'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const errorParam = url.searchParams.get('error')

  const origin = url.origin

  // 1. Handle user cancellation or Google error
  if (errorParam || !code) {
    return NextResponse.redirect(`${origin}/login?error=google_cancelled`)
  }

  // 2. Validate Anti-CSRF State Token
  const cookiesHeader = request.headers.get('cookie') || ''
  const stateCookie = cookiesHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('oauth_state='))
    ?.split('=')[1]

  if (!state || !stateCookie || state !== stateCookie) {
    console.error('OAuth state mismatch - potential CSRF attack.')
    return NextResponse.redirect(`${origin}/login?error=invalid_state`)
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error('Google OAuth credentials missing.')
    return NextResponse.redirect(`${origin}/login?error=oauth_config_error`)
  }

  const redirectUri = `${origin}/api/auth/google/callback`

  try {
    // 3. Exchange authorization code for Google tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Failed to exchange Google OAuth code:', tokenData)
      return NextResponse.redirect(`${origin}/login?error=google_token_error`)
    }

    // 4. Retrieve user info from Google's OpenID Userinfo Endpoint
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    const userinfo = await userinfoResponse.json()

    if (!userinfoResponse.ok || !userinfo.sub || !userinfo.email) {
      console.error('Failed to fetch Google user info:', userinfo)
      return NextResponse.redirect(`${origin}/login?error=google_userinfo_error`)
    }

    // 5. Authenticate or Register User in CTools AuthService
    const result = await authService.handleGoogleCallbackUser({
      providerAccountId: userinfo.sub,
      email: userinfo.email,
      name: userinfo.name || userinfo.given_name || userinfo.email.split('@')[0],
      emailVerified: Boolean(userinfo.email_verified),
    })

    // 6. Determine post-login redirect destination
    const destination = result.user.role === 'ADMIN' ? '/admin' : '/dashboard'
    const response = NextResponse.redirect(`${origin}${destination}`)

    // 7. Clear temporary oauth_state cookie & set CTools JWT session cookie
    response.cookies.delete('oauth_state')
    setAuthCookie(response.cookies, result.token)

    return response
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(`${origin}/login?error=google_auth_failed`)
  }
}
