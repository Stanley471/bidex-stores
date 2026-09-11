import { cookies } from 'next/headers'
import { getAuthCookie } from '@/lib/auth/session'
import { verifyToken } from '@/lib/auth/jwt'
import { NextResponse } from 'next/server'

export class UnauthenticatedError extends Error {
  constructor(message = 'Authentication required.') {
    super(message)
    this.name = 'UnauthenticatedError'
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Admin access required.') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

type AuthPayload = {
  sub: string
  email: string
  role: string
}

export async function requireAuth(token?: string): Promise<AuthPayload> {
  const jwtToken = token?.trim()

  if (!jwtToken) {
    throw new UnauthenticatedError('Authentication required.')
  }

  let payload: AuthPayload | null = null
  try {
    payload = (await verifyToken(jwtToken)) as AuthPayload
  } catch {
    throw new UnauthenticatedError('Invalid authentication token.')
  }

  if (!payload?.sub || !payload?.email || !payload?.role) {
    throw new UnauthenticatedError('Invalid authentication token.')
  }

  return payload
}

export async function requireAdmin(token?: string): Promise<AuthPayload> {
  const payload = await requireAuth(token)

  if (payload.role !== 'ADMIN') {
    throw new ForbiddenError('Admin access required.')
  }

  return payload
}

export async function requireRole(roles: string[], token?: string): Promise<AuthPayload> {
  const payload = await requireAuth(token)

  if (!roles.includes(payload.role as string)) {
    throw new ForbiddenError('Insufficient permissions.')
  }

  return payload
}

export async function verifyAdminAuth() {
  const token = getAuthCookie(await cookies())
  try {
    const payload = await requireAdmin(token)
    return { payload, errorResponse: null }
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return {
        payload: null,
        errorResponse: NextResponse.json({ success: false, message: error.message }, { status: 403 }),
      }
    }
    return {
      payload: null,
      errorResponse: NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Unauthorized.' }, { status: 401 }),
    }
  }
}


