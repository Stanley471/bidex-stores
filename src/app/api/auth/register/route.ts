import { authService } from '@/services/auth.service'
import { RegisterSchema } from '@/lib/auth/validation'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = RegisterSchema.safeParse(body)

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

    const user = await authService.register(parsed.data)

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully.',
        user,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 409 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred while registering the user.',
      },
      { status: 500 },
    )
  }
}
