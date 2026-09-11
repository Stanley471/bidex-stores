import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAuth } from '@/lib/auth/authorization'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const token = getAuthCookie(await cookies())
  let user
  try {
    user = await requireAuth(token)
  } catch {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 })
  }

  try {
    const { currentPassword, newPassword, confirmPassword } = await request.json()

    if (!currentPassword || typeof currentPassword !== 'string') {
      return NextResponse.json({ success: false, message: 'Current password is required.' }, { status: 400 })
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters long.' },
        { status: 400 },
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ success: false, message: 'New passwords do not match.' }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.sub },
      select: { id: true, password: true },
    })

    if (!dbUser || !dbUser.password) {
      return NextResponse.json(
        { success: false, message: 'Password change not available for OAuth accounts.' },
        { status: 400 },
      )
    }

    const isValid = await verifyPassword(currentPassword, dbUser.password)
    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Incorrect current password.' }, { status: 400 })
    }

    const hashed = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: user.sub },
      data: { password: hashed },
    })

    return NextResponse.json({ success: true, message: 'Password updated successfully.' })
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Unable to change password.' },
      { status: 400 },
    )
  }
}
