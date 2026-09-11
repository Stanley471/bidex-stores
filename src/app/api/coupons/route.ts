import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()

    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        description: true,
        discountType: true,
        discountValue: true,
        minimumOrderAmount: true,
        maximumDiscount: true,
        expiresAt: true,
      },
    })

    const formattedCoupons = coupons.map((c) => ({
      ...c,
      discountValue: Number(c.discountValue),
      minimumOrderAmount: c.minimumOrderAmount ? Number(c.minimumOrderAmount) : 0,
      maximumDiscount: c.maximumDiscount ? Number(c.maximumDiscount) : null,
      expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    }))

    return NextResponse.json({ success: true, coupons: formattedCoupons })
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Unable to fetch coupons.' },
      { status: 500 },
    )
  }
}
