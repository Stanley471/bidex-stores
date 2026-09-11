import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { PaymentMethod } from '@/generated/prisma/client'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAuth } from '@/lib/auth/authorization'
import { paymentService } from '@/services/payment.service'

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
    const { orderId, paymentMethod, callbackUrl } = body

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ success: false, message: 'Order ID is required.' }, { status: 400 })
    }

    if (!paymentMethod || typeof paymentMethod !== 'string') {
      return NextResponse.json({ success: false, message: 'Payment method is required.' }, { status: 400 })
    }

    const url = new URL(request.url)
    const defaultCallback = `${url.origin}/payment/callback`
    const finalCallbackUrl = callbackUrl || defaultCallback

    const result = await paymentService.initializeOrderPayment(
      user.sub,
      orderId,
      paymentMethod as PaymentMethod,
      finalCallbackUrl,
    )

    return NextResponse.json({ success: true, result })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Payment initialization failed.' },
      { status: 400 },
    )
  }
}
