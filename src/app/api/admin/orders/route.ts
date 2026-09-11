import { NextResponse } from 'next/server'
import type { OrderStatus, PaymentStatus } from '@/generated/prisma/client'
import { verifyAdminAuth } from '@/lib/auth/authorization'
import { orderService } from '@/services/order.service'

export async function GET(request: Request) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse

  const url = new URL(request.url)
  const search = url.searchParams.get('search') ?? undefined
  const status = url.searchParams.get('status') ?? undefined
  const paymentStatus = url.searchParams.get('paymentStatus') ?? undefined
  const startDate = url.searchParams.get('startDate') ?? undefined
  const endDate = url.searchParams.get('endDate') ?? undefined
  const page = Number(url.searchParams.get('page') ?? '1')
  const pageSize = Number(url.searchParams.get('pageSize') ?? '20')

  try {
    const result = await orderService.getAdminOrders({
      search,
      status: status as OrderStatus | undefined,
      paymentStatus: paymentStatus as PaymentStatus | undefined,
      startDate,
      endDate,
      page: Number.isNaN(page) ? 1 : page,
      pageSize: Number.isNaN(pageSize) ? 20 : pageSize,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to load orders.' },
      { status: 500 },
    )
  }
}
