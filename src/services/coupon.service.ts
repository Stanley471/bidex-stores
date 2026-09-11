import type { CouponInput } from '@/lib/coupon/validation'
import { prisma } from '@/lib/prisma'

export interface CouponListOptions {
  search?: string
  isActive?: boolean
  page?: number
  pageSize?: number
}

class CouponService {
  async createCoupon(input: CouponInput) {
    const normalizedCode = input.code.trim().toUpperCase()

    const existing = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    })

    if (existing) {
      throw new Error(`Coupon code "${normalizedCode}" already exists.`)
    }

    return prisma.coupon.create({
      data: {
        code: normalizedCode,
        description: input.description?.trim() || null,
        discountType: input.discountType,
        discountValue: input.discountValue,
        minimumOrderAmount: input.minimumOrderAmount ?? 0,
        maximumDiscount: input.maximumDiscount ?? null,
        usageLimit: input.usageLimit ?? null,
        perUserLimit: input.perUserLimit ?? 1,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        isActive: input.isActive ?? true,
      },
    })
  }

  async getCoupons(options: CouponListOptions = {}) {
    const page = Math.max(1, options.page ?? 1)
    const pageSize = Math.max(1, options.pageSize ?? 10)

    const where: Record<string, unknown> = {}

    if (options.search?.trim()) {
      const q = options.search.trim().toUpperCase()
      where.OR = [
        { code: { contains: q, mode: 'insensitive' as const } },
        { description: { contains: q, mode: 'insensitive' as const } },
      ]
    }

    if (options.isActive !== undefined) {
      where.isActive = options.isActive
    }

    const [total, coupons] = await prisma.$transaction([
      prisma.coupon.count({ where }),
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return {
      coupons: coupons.map((c) => ({
        ...c,
        discountValue: Number(c.discountValue),
        minimumOrderAmount: Number(c.minimumOrderAmount ?? 0),
        maximumDiscount: c.maximumDiscount ? Number(c.maximumDiscount) : null,
      })),
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    }
  }

  async getCoupon(id: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    })

    if (!coupon) {
      throw new Error('Coupon not found.')
    }

    return {
      ...coupon,
      discountValue: Number(coupon.discountValue),
      minimumOrderAmount: Number(coupon.minimumOrderAmount ?? 0),
      maximumDiscount: coupon.maximumDiscount ? Number(coupon.maximumDiscount) : null,
    }
  }

  async updateCoupon(id: string, input: Partial<CouponInput>) {
    const existing = await prisma.coupon.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new Error('Coupon not found.')
    }

    const dataToUpdate: Record<string, unknown> = {}

    if (input.code) {
      const normalizedCode = input.code.trim().toUpperCase()
      if (normalizedCode !== existing.code) {
        const codeCheck = await prisma.coupon.findUnique({
          where: { code: normalizedCode },
        })
        if (codeCheck) {
          throw new Error(`Coupon code "${normalizedCode}" is already taken.`)
        }
        dataToUpdate.code = normalizedCode
      }
    }

    if (input.description !== undefined) dataToUpdate.description = input.description?.trim() || null
    if (input.discountType) dataToUpdate.discountType = input.discountType
    if (input.discountValue !== undefined) dataToUpdate.discountValue = input.discountValue
    if (input.minimumOrderAmount !== undefined) dataToUpdate.minimumOrderAmount = input.minimumOrderAmount ?? 0
    if (input.maximumDiscount !== undefined) dataToUpdate.maximumDiscount = input.maximumDiscount ?? null
    if (input.usageLimit !== undefined) dataToUpdate.usageLimit = input.usageLimit ?? null
    if (input.perUserLimit !== undefined) dataToUpdate.perUserLimit = input.perUserLimit ?? 1
    if (input.startsAt !== undefined) dataToUpdate.startsAt = input.startsAt ? new Date(input.startsAt) : null
    if (input.expiresAt !== undefined) dataToUpdate.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null
    if (input.isActive !== undefined) dataToUpdate.isActive = input.isActive

    const updated = await prisma.coupon.update({
      where: { id },
      data: dataToUpdate,
    })

    return {
      ...updated,
      discountValue: Number(updated.discountValue),
      minimumOrderAmount: Number(updated.minimumOrderAmount ?? 0),
      maximumDiscount: updated.maximumDiscount ? Number(updated.maximumDiscount) : null,
    }
  }

  async deleteCoupon(id: string) {
    const existing = await prisma.coupon.findUnique({ where: { id } })
    if (!existing) {
      throw new Error('Coupon not found.')
    }

    await prisma.coupon.delete({ where: { id } })
    return { success: true }
  }

  async validateCoupon(code: string, userId: string, subtotal: number) {
    const normalizedCode = code.trim().toUpperCase()
    const now = new Date()

    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    })

    // Rule 1: Coupon exists
    if (!coupon) {
      throw new Error('Coupon not found.')
    }

    // Rule 2: Coupon is active
    if (!coupon.isActive) {
      throw new Error('Coupon is not active.')
    }

    // Rule 3: Start Date
    if (coupon.startsAt && now < coupon.startsAt) {
      throw new Error('Coupon is not valid yet.')
    }

    // Rule 4: Expiry Date
    if (coupon.expiresAt && now > coupon.expiresAt) {
      throw new Error('Coupon has expired.')
    }

    // Rule 5: Global Usage Limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new Error('Coupon usage limit reached.')
    }

    // Rule 6: Per-User Limit
    const perUserLimit = coupon.perUserLimit ?? 1
    const userUsageCount = await prisma.couponUsage.count({
      where: {
        couponId: coupon.id,
        userId,
      },
    })

    if (userUsageCount >= perUserLimit) {
      throw new Error('You have already used this coupon the maximum allowed number of times.')
    }

    // Rule 7: Minimum Order Amount
    const minAmount = Number(coupon.minimumOrderAmount ?? 0)
    if (subtotal < minAmount) {
      throw new Error(`Minimum order amount of $${minAmount.toFixed(2)} is required to use this coupon.`)
    }

    // Rule 8: Calculate Discount & Cap
    const discountVal = Number(coupon.discountValue)
    let calculatedDiscount = 0

    if (coupon.discountType === 'PERCENTAGE') {
      calculatedDiscount = (subtotal * discountVal) / 100
      const maxDiscount = coupon.maximumDiscount ? Number(coupon.maximumDiscount) : null
      if (maxDiscount !== null && calculatedDiscount > maxDiscount) {
        calculatedDiscount = maxDiscount
      }
    } else {
      // FIXED
      calculatedDiscount = discountVal
    }

    // Cap rule: Discount can NEVER exceed subtotal
    const finalDiscount = Math.min(calculatedDiscount, subtotal)

    return {
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: discountVal,
      },
      discountAmount: finalDiscount,
      newTotal: subtotal - finalDiscount,
    }
  }
}

export const couponService = new CouponService()
