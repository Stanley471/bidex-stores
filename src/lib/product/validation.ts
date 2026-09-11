import { z } from 'zod'

export const ProductImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url('Image must be a valid URL.').or(z.string().min(1, 'URL cannot be empty.')),
  altText: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isPrimary: z.boolean().default(false),
})

export const ProductVariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().optional().nullable(),
  priceOverride: z.number().nonnegative('Price override cannot be negative.').optional().nullable(),
  stock: z.number().int('Stock must be an integer.').nonnegative('Stock cannot be negative.').default(0),
  attributes: z.record(z.string(), z.string()).default({}),
  isActive: z.boolean().default(true),
})

export const ProductSpecificationSchema = z.object({
  key: z.string(),
  value: z.string(),
})

export const ProductSchema = z.object({
  name: z.string().min(1, 'Product name is required.').max(200, 'Name cannot exceed 200 characters.'),
  slug: z.string().optional().or(z.literal('')),
  description: z.string().optional().nullable(),
  basePrice: z.number().nonnegative('Base price cannot be negative.'),
  stock: z.number().int('Stock must be an integer.').nonnegative('Stock cannot be negative.').default(0),
  hasVariants: z.boolean().default(false),
  sku: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  brandId: z.string().min(1, 'Brand is required.'),
  categoryIds: z.array(z.string()).default([]),
  images: z.array(ProductImageSchema).default([]),
  variants: z.array(ProductVariantSchema).default([]),
  specifications: z.array(ProductSpecificationSchema).default([]),
})

export type ProductInput = z.infer<typeof ProductSchema>
export type ProductImageInput = z.infer<typeof ProductImageSchema>
export type ProductVariantInput = z.infer<typeof ProductVariantSchema>
export type ProductSpecificationInput = z.infer<typeof ProductSpecificationSchema>
