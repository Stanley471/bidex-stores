import { z } from 'zod'

export const ShippingConfigSchema = z.object({
  type: z.enum(['FREE', 'FLAT_RATE', 'NEGOTIABLE']),
  fee: z.number().min(0, 'Shipping fee must be 0 or greater.').default(0),
})

export type ShippingConfigInput = z.infer<typeof ShippingConfigSchema>
