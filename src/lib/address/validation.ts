import { z } from 'zod'

export const AddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required.').max(50, 'First name is too long.'),
  lastName: z.string().min(1, 'Last name is required.').max(50, 'Last name is too long.'),
  phone: z.string().min(1, 'Phone number is required.').optional().nullable(),
  country: z.string().min(1, 'Country is required.'),
  state: z.string().min(1, 'State / Province is required.'),
  city: z.string().min(1, 'City is required.'),
  addressLine1: z.string().min(1, 'Address line 1 is required.'),
  addressLine2: z.string().optional().nullable(),
  postalCode: z.string().min(1, 'Postal code is required.'),
  isDefault: z.boolean().default(false),
})

export type AddressInput = z.infer<typeof AddressSchema>
