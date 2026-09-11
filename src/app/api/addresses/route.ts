import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AddressSchema } from '@/lib/address/validation'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAuth } from '@/lib/auth/authorization'
import { addressService } from '@/services/address.service'

export async function GET() {
  const token = getAuthCookie(await cookies())
  let user
  try {
    user = await requireAuth(token)
  } catch {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 })
  }

  try {
    const addresses = await addressService.getUserAddresses(user.sub)
    return NextResponse.json({ success: true, addresses })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to load addresses.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const token = getAuthCookie(await cookies())
  let user
  try {
    user = await requireAuth(token)
  } catch {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 })
  }

  try {
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

    const address = await addressService.createAddress(user.sub, parsed.data)
    return NextResponse.json({ success: true, message: 'Address added successfully.', address }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to create address.' },
      { status: 400 },
    )
  }
}
