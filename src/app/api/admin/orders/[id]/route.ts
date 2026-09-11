import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/authorization'
import { orderService } from '@/services/order.service'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: Request, { params }: RouteContext) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse

  try {
    const { id } = await params
    const order = await orderService.getAdminOrder(id)
    return NextResponse.json({ success: true, order })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Order not found.' },
      { status: 404 },
    )
  }
}
