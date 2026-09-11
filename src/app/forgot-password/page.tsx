import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthCookie } from '@/lib/auth/session'
import { verifyToken } from '@/lib/auth/jwt'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthFooter } from '@/components/auth/AuthFooter'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export default async function ForgotPasswordPage() {
  const cookieStore = await cookies()
  const token = getAuthCookie(cookieStore)

  if (token) {
    try {
      const payload = await verifyToken(token)
      if (payload?.sub) {
        const role = String(payload.role || 'CUSTOMER')
        redirect(role === 'ADMIN' ? '/admin' : '/dashboard')
      }
    } catch {
      // Invalid/expired token -> proceed to form
    }
  }

  return (
    <AuthLayout>
      <AuthCard description="Enter your email and we will help you reset your password.">
        <ForgotPasswordForm />
        <AuthFooter text="Remembered your password?" linkHref="/login" linkText="Sign in" />
      </AuthCard>
    </AuthLayout>
  )
}
