import { NextResponse } from 'next/server'
import type { OrderStatus } from '@/generated/prisma/client'
import { verifyAdminAuth } from '@/lib/auth/authorization'
import { orderService } from '@/services/order.service'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

const VALID_ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]

export async function PATCH(request: Request, { params }: RouteContext) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse

  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || typeof status !== 'string') {
      return NextResponse.json({ success: false, message: 'Valid status string is required.' }, { status: 400 })
    }

    const normalized = status.trim().toUpperCase() as OrderStatus
    if (!VALID_ORDER_STATUSES.includes(normalized)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid order status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}`,
        },
        { status: 400 },
      )
    }

    const updatedOrder = await orderService.updateOrderStatus(id, normalized)
    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully.',
      order: updatedOrder,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to update order status.' },
      { status: 400 },
    )
  }
}
