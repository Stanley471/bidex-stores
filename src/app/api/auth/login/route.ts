import { authService } from '@/services/auth.service'
import { LoginSchema } from '@/lib/auth/validation'
import { setAuthCookie } from '@/lib/auth/session'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = LoginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const result = await authService.login(parsed.data)
    const response = NextResponse.json({
      success: true,
      message: 'Login successful.',
      user: result.user,
    })

    setAuthCookie(response.cookies, result.token)

    return response
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof Error && error.message.includes('Invalid email or password')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password.',
        },
        { status: 401 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred while signing in.',
      },
      { status: 500 },
    )
  }
}
