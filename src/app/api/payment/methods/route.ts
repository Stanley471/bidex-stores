import { NextResponse } from 'next/server'
import { paymentService } from '@/services/payment.service'

export async function GET() {
  try {
    const methods = paymentService.getAvailablePaymentMethods()
    return NextResponse.json({ success: true, methods })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to load payment methods.' },
      { status: 500 },
    )
  }
}
