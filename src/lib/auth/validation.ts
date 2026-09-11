import { z } from 'zod'

const passwordSchema = z
  .string()
  .trim()
  .min(8, 'Password must be at least 8 characters long.')
  .max(128, 'Password must be at most 128 characters long.')

export const RegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters long.')
    .max(100, 'Name must be at most 100 characters long.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address.'),
  password: passwordSchema,
})

export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address.'),
  password: passwordSchema,
})

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address.'),
})

export const ResetPasswordSchema = z.object({
  token: z
    .string()
    .trim()
    .min(1, 'Reset token is required.'),
  password: passwordSchema,
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
