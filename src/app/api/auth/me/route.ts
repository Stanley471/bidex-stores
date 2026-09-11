import { authService } from '@/services/auth.service'
import { getAuthCookie } from '@/lib/auth/session'
import { verifyToken } from '@/lib/auth/jwt'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// The current-user route should read the cookie from the request context and only expose a safe user payload.
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = getAuthCookie(cookieStore)

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required.',
        },
        { status: 401 },
      )
    }

    const payload = await verifyToken(token)
    const user = await authService.getCurrentUser(String(payload.sub))

    return NextResponse.json({
      success: true,
      user,
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'Authentication failed.',
      },
      { status: 401 },
    )
  }
}
