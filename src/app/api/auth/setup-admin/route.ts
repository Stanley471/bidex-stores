import { NextResponse } from 'next/server'
import { RegisterSchema } from '@/lib/auth/validation'
import { setAuthCookie } from '@/lib/auth/session'
import { authService } from '@/services/auth.service'

export async function GET() {
  try {
    const hasAdmin = await authService.hasAdmin()
    return NextResponse.json({
      success: true,
      setupRequired: !hasAdmin,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Error checking admin status.'
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const hasAdmin = await authService.hasAdmin()
    if (hasAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: 'First administrator setup has already been completed.',
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = RegisterSchema.parse(body)

    const { token, user } = await authService.setupFirstAdmin(validated)

    const response = NextResponse.json({
      success: true,
      message: 'First administrator account created successfully.',
      user,
    })

    setAuthCookie(response.cookies, token)
    return response
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to setup first administrator.'
    return NextResponse.json({ success: false, message: errorMsg }, { status: 400 })
  }
}
