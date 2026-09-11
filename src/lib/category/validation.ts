import { z } from 'zod'

export const CategorySchema = z.object({
  name: z.string().min(1, 'Category name is required.').max(100, 'Name cannot exceed 100 characters.'),
  slug: z.string().optional().or(z.literal('')),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters.').optional().nullable(),
  image: z.string().url('Image must be a valid URL.').optional().nullable().or(z.literal('')),
  parentId: z.string().optional().nullable().or(z.literal('')),
})

export type CategoryInput = z.infer<typeof CategorySchema>
