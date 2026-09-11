import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAuth } from '@/lib/auth/authorization'
import { orderService } from '@/services/order.service'

export async function GET(request: Request) {
  const token = getAuthCookie(await cookies())
  let user
  try {
    user = await requireAuth(token)
  } catch {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 })
  }

  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') ?? '1')
  const pageSize = Number(url.searchParams.get('pageSize') ?? '10')

  try {
    const result = await orderService.getUserOrders(
      user.sub,
      Number.isNaN(page) ? 1 : page,
      Number.isNaN(pageSize) ? 10 : pageSize,
    )
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to load orders.' },
      { status: 500 },
    )
  }
}

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
    const { addressId, paymentMethod, notes } = body

    if (!addressId || typeof addressId !== 'string') {
      return NextResponse.json({ success: false, message: 'Shipping address is required.' }, { status: 400 })
    }

    const order = await orderService.createOrder(user.sub, {
      addressId,
      paymentMethod: paymentMethod || 'CASH_ON_DELIVERY',
      notes,
    })

    return NextResponse.json({ success: true, message: 'Order created successfully.', order }, { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unable to place order.'
    const status = msg.includes('stock') || msg.includes('inventory') ? 409 : 400
    return NextResponse.json({ success: false, message: msg }, { status })
  }
}
