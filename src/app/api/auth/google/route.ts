import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID

  if (!clientId) {
    console.error('GOOGLE_CLIENT_ID environment variable is missing.')
    return NextResponse.json(
      { success: false, message: 'Google OAuth is not configured.' },
      { status: 500 },
    )
  }

  // Construct absolute redirect URI dynamically based on current origin
  const url = new URL(request.url)
  const redirectUri = `${url.origin}/api/auth/google/callback`

  // Generate cryptographically random anti-CSRF state token
  const state = Math.random().toString(36).substring(2) + Date.now().toString(36)

  // Build Google OAuth authorization URL
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.searchParams.set('client_id', clientId)
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri)
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set('scope', 'openid email profile')
  googleAuthUrl.searchParams.set('state', state)
  googleAuthUrl.searchParams.set('prompt', 'select_account')

  const response = NextResponse.redirect(googleAuthUrl.toString())

  // Store state in HTTP-only temporary cookie for CSRF validation in callback
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  })

  return response
}
