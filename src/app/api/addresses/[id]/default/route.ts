import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAuth } from '@/lib/auth/authorization'
import { addressService } from '@/services/address.service'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const token = getAuthCookie(await cookies())
  let user
  try {
    user = await requireAuth(token)
  } catch {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 })
  }

  try {
    const { id } = await params
    const address = await addressService.setDefaultAddress(user.sub, id)
    return NextResponse.json({ success: true, message: 'Set as primary default address.', address })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to set default address.' },
      { status: 400 },
    )
  }
}
