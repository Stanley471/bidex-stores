import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAuth } from '@/lib/auth/authorization'
import { couponService } from '@/services/coupon.service'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const token = getAuthCookie(await cookies())
  let userId: string | null = null

  if (token) {
    try {
      const user = await requireAuth(token)
      userId = user.sub
    } catch {
      // Guest user session fallback
    }
  }

  try {
    const body = await request.json()
    const { code, subtotal: passedSubtotal } = body

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ success: false, message: 'Coupon code is required.' }, { status: 400 })
    }

    let subtotal = typeof passedSubtotal === 'number' && !isNaN(passedSubtotal) ? passedSubtotal : 0

    // If logged in and subtotal was not explicitly provided by client, calculate from db cart
    if (userId && subtotal <= 0) {
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: { include: { variants: true } },
            },
          },
        },
      })

      if (cart && cart.items.length > 0) {
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
      }
    }

    if (subtotal <= 0) {
      return NextResponse.json({ success: false, message: 'Your cart is empty.' }, { status: 400 })
    }

    const validation = await couponService.validateCoupon(code, userId, subtotal)
    return NextResponse.json({ success: true, data: validation })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Coupon validation failed.' },
      { status: 400 },
    )
  }
}
