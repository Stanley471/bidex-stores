import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAuth } from '@/lib/auth/authorization'
import { orderService } from '@/services/order.service'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: Request, { params }: RouteContext) {
  const token = getAuthCookie(await cookies())
  let user
  try {
    user = await requireAuth(token)
  } catch {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 })
  }

  try {
    const { id } = await params
    const order = await orderService.getUserOrder(user.sub, id)
    return NextResponse.json({ success: true, order })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Order not found.' },
      { status: 404 },
    )
  }
}
