import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAuth } from '@/lib/auth/authorization'
import { cartServerService } from '@/services/cart.server'

export async function GET() {
  const token = getAuthCookie(await cookies())
  let user
  try {
    user = await requireAuth(token)
  } catch {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 })
  }

  try {
    const cart = await cartServerService.getDbCart(user.sub)
    return NextResponse.json({ success: true, cart })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to load cart.' },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  const token = getAuthCookie(await cookies())
  let user
  try {
    user = await requireAuth(token)
  } catch {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 })
  }

  try {
    const cart = await cartServerService.clearDbCart(user.sub)
    return NextResponse.json({ success: true, message: 'Cart cleared successfully.', cart })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to clear cart.' },
      { status: 500 },
    )
  }
}
