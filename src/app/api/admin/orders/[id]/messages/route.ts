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
    const messages = await orderService.getOrderMessages(id)
    return NextResponse.json({ success: true, messages })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to fetch order messages.',
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { payload, errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse

  try {
    const { id } = await params
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, message: 'Message text cannot be empty.' },
        { status: 400 },
      )
    }

    const created = await orderService.addOrderMessage(id, payload.sub, message)
    return NextResponse.json(
      {
        success: true,
        message: 'Order message posted successfully.',
        data: created,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to post order message.',
      },
      { status: 400 },
    )
  }
}
