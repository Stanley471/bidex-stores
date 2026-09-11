import { z } from 'zod'

const urlSchema = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || /^https?:\/\/.+/.test(value), {
    message: 'Must be a valid URL.',
  })

export const BrandSchema = z.object({
  name: z.string().trim().min(2, 'Brand name must contain at least 2 characters.'),
  slug: z.string().trim().optional(),
  logo: urlSchema,
  website: urlSchema,
  description: z.string().trim().optional(),
})

export type BrandInput = z.infer<typeof BrandSchema>
export type CreateBrandInput = BrandInput
export type UpdateBrandInput = BrandInput
