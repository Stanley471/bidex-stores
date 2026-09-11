import { clearAuthCookie } from '@/lib/auth/session'
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully.',
  })

  clearAuthCookie(response.cookies)

  return response
}
