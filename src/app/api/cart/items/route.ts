import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAuth } from '@/lib/auth/authorization'
import { cartServerService } from '@/services/cart.server'

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
    const { productId, productVariantId, quantity = 1 } = body

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ success: false, message: 'Product ID is required.' }, { status: 400 })
    }

    const cart = await cartServerService.addDbCartItem(user.sub, {
      productId,
      productVariantId: productVariantId || null,
      quantity: Number(quantity),
    })

    return NextResponse.json({ success: true, message: 'Item added to cart.', cart })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unable to add item to cart.'
    const status = msg.includes('inventory') || msg.includes('stock') ? 409 : 400
    return NextResponse.json({ success: false, message: msg }, { status })
  }
}
