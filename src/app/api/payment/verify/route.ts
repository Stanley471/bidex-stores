import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
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
    const { reference } = body

    if (!reference || typeof reference !== 'string') {
      return NextResponse.json({ success: false, message: 'Payment reference is required.' }, { status: 400 })
    }

    const result = await paymentService.verifyOrderPayment(reference, user.sub)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Payment verification failed.' },
      { status: 400 },
    )
  }
}
