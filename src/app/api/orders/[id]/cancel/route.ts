import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAuth } from '@/lib/auth/authorization'
import { orderService } from '@/services/order.service'

interface Context {
  params: Promise<{
    id: string
  }>
}

export async function POST(_request: Request, { params }: Context) {
  const token = getAuthCookie(await cookies())
  let user
  try {
    user = await requireAuth(token)
  } catch {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 })
  }

  const { id } = await params

  try {
    const updatedOrder = await orderService.cancelOrder(user.sub, id)
    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully.',
      order: updatedOrder,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to cancel order.' },
      { status: 400 },
    )
  }
}
