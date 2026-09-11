import { NextResponse } from 'next/server'
import type { PaymentStatus } from '@/generated/prisma/client'
import { verifyAdminAuth } from '@/lib/auth/authorization'
import { orderService } from '@/services/order.service'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

const VALID_PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'PAID', 'FAILED', 'REFUNDED']

export async function PATCH(request: Request, { params }: RouteContext) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse

  try {
    const { id } = await params
    const body = await request.json()
    const { paymentStatus } = body

    if (!paymentStatus || typeof paymentStatus !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Valid payment status string is required.' },
        { status: 400 },
      )
    }

    const normalized = paymentStatus.trim().toUpperCase() as PaymentStatus
    if (!VALID_PAYMENT_STATUSES.includes(normalized)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid payment status. Must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}`,
        },
        { status: 400 },
      )
    }

    const updatedOrder = await orderService.updatePaymentStatus(id, normalized)
    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully.',
      order: updatedOrder,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to update payment status.',
      },
      { status: 400 },
    )
  }
}
