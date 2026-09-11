import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAuth } from '@/lib/auth/authorization'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const token = getAuthCookie(await cookies())
  let user
  try {
    user = await requireAuth(token)
  } catch {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 })
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        addresses: {
          where: { isDefault: true },
          take: 1,
          select: { phone: true },
        },
      },
    })

    if (!dbUser) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 })
    }

    const defaultPhone = dbUser.addresses[0]?.phone || ''

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        phone: defaultPhone,
        role: dbUser.role,
        createdAt: dbUser.createdAt,
      },
    })
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Unable to load profile.' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  const token = getAuthCookie(await cookies())
  let user
  try {
    user = await requireAuth(token)
  } catch {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, email, phone } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Name is required.' }, { status: 400 })
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'Valid email address is required.' }, { status: 400 })
    }

    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()

    // Check if email taken by another user
    const existing = await prisma.user.findFirst({
      where: {
        email: trimmedEmail,
        id: { not: user.sub },
      },
    })

    if (existing) {
      return NextResponse.json({ success: false, message: 'Email address is already in use.' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.sub },
      data: {
        name: trimmedName,
        email: trimmedEmail,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    // If phone provided, update default address or first address phone
    if (phone && typeof phone === 'string') {
      const defaultAddr = await prisma.address.findFirst({
        where: { userId: user.sub, isDefault: true },
      })
      if (defaultAddr) {
        await prisma.address.update({
          where: { id: defaultAddr.id },
          data: { phone: phone.trim() },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        ...updatedUser,
        phone: phone || '',
      },
    })
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Unable to update profile.' },
      { status: 400 },
    )
  }
}
