import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/authorization'
import { CouponSchema } from '@/lib/coupon/validation'
import { couponService } from '@/services/coupon.service'

export async function GET(request: Request) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse

  const url = new URL(request.url)
  const search = url.searchParams.get('search') ?? undefined
  const isActiveParam = url.searchParams.get('isActive')
  const isActive = isActiveParam !== null ? isActiveParam === 'true' : undefined
  const page = Number(url.searchParams.get('page') ?? '1')
  const pageSize = Number(url.searchParams.get('pageSize') ?? '10')

  try {
    const result = await couponService.getCoupons({
      search,
      isActive,
      page: Number.isNaN(page) ? 1 : page,
      pageSize: Number.isNaN(pageSize) ? 10 : pageSize,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to fetch coupons.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse

  try {
    const body = await request.json()
    const parsed = CouponSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const coupon = await couponService.createCoupon(parsed.data)
    return NextResponse.json({
      success: true,
      message: 'Coupon created successfully.',
      coupon,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to create coupon.' },
      { status: 400 },
    )
  }
}
