import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAuth } from '@/lib/auth/authorization'
import { cartServerService } from '@/services/cart.server'

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
    const { quantity } = body

    if (quantity === undefined || typeof quantity !== 'number') {
      return NextResponse.json({ success: false, message: 'Valid quantity is required.' }, { status: 400 })
    }

    const cart = await cartServerService.updateDbCartItem(user.sub, id, quantity)
    return NextResponse.json({ success: true, message: 'Cart updated.', cart })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unable to update cart item.'
    const status = msg.includes('stock') ? 409 : msg.includes('not found') ? 404 : 400
    return NextResponse.json({ success: false, message: msg }, { status })
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
    const cart = await cartServerService.removeDbCartItem(user.sub, id)
    return NextResponse.json({ success: true, message: 'Item removed from cart.', cart })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to remove item.' },
      { status: 400 },
    )
  }
}
