import { z } from 'zod'

export const CouponSchema = z
  .object({
    code: z
      .string()
      .min(1, 'Coupon code is required.')
      .transform((val) => val.trim().toUpperCase()),
    description: z.string().optional().nullable(),
    discountType: z.enum(['PERCENTAGE', 'FIXED']),
    discountValue: z.number().positive('Discount value must be greater than 0.'),
    minimumOrderAmount: z.number().min(0, 'Minimum order amount cannot be negative.').optional().nullable(),
    maximumDiscount: z.number().min(0, 'Maximum discount cannot be negative.').optional().nullable(),
    usageLimit: z.number().int().min(1, 'Usage limit must be at least 1.').optional().nullable(),
    perUserLimit: z.number().int().min(1, 'Per-user limit must be at least 1.').default(1),
    startsAt: z.string().optional().nullable(),
    expiresAt: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
        return false
      }
      return true
    },
    {
      message: 'Percentage discount cannot exceed 100%.',
      path: ['discountValue'],
    },
  )
  .refine(
    (data) => {
      if (data.startsAt && data.expiresAt) {
        const start = new Date(data.startsAt).getTime()
        const end = new Date(data.expiresAt).getTime()
        return end >= start
      }
      return true
    },
    {
      message: 'Expiration date must be after or equal to start date.',
      path: ['expiresAt'],
    },
  )

export type CouponInput = z.infer<typeof CouponSchema>
