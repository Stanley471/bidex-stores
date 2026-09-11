import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/authorization'
import { couponService } from '@/services/coupon.service'

interface Context {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: Request, { params }: Context) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse

  const { id } = await params

  try {
    const coupon = await couponService.getCoupon(id)
    return NextResponse.json({ success: true, coupon })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Coupon not found.' },
      { status: 404 },
    )
  }
}

export async function PATCH(request: Request, { params }: Context) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse

  const { id } = await params

  try {
    const body = await request.json()
    const updated = await couponService.updateCoupon(id, body)
    return NextResponse.json({
      success: true,
      message: 'Coupon updated successfully.',
      coupon: updated,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to update coupon.' },
      { status: 400 },
    )
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse

  const { id } = await params

  try {
    await couponService.deleteCoupon(id)
    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully.',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to delete coupon.' },
      { status: 400 },
    )
  }
}
