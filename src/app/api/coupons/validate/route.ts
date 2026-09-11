import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAuth } from '@/lib/auth/authorization'
import { couponService } from '@/services/coupon.service'
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
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ success: false, message: 'Coupon code is required.' }, { status: 400 })
    }

    // Fetch user's cart to determine active subtotal
    const cart = await prisma.cart.findUnique({
      where: { userId: user.sub },
      include: {
        items: {
          include: {
            product: { include: { variants: true } },
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ success: false, message: 'Your cart is empty.' }, { status: 400 })
    }

    let subtotal = 0
    for (const item of cart.items) {
      let price = Number(item.product.basePrice)
      if (item.productVariantId && item.product.variants) {
        const variant = item.product.variants.find((v) => v.id === item.productVariantId)
        if (variant && variant.priceOverride) {
          price = Number(variant.priceOverride)
        }
      }
      subtotal += price * item.quantity
    }

    const validation = await couponService.validateCoupon(code, user.sub, subtotal)
    return NextResponse.json({ success: true, data: validation })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Coupon validation failed.' },
      { status: 400 },
    )
  }
}
