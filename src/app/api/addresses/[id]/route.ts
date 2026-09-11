import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AddressSchema } from '@/lib/address/validation'
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
    const body = await request.json()
    const parsed = AddressSchema.safeParse(body)

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

    const address = await addressService.updateAddress(user.sub, id, parsed.data)
    return NextResponse.json({ success: true, message: 'Address updated.', address })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to update address.' },
      { status: 400 },
    )
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const token = getAuthCookie(await cookies())
  let user
  try {
    user = await requireAuth(token)
  } catch {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 })
  }

  try {
    const { id } = await params
    await addressService.deleteAddress(user.sub, id)
    return NextResponse.json({ success: true, message: 'Address deleted.' })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to delete address.' },
      { status: 400 },
    )
  }
}
