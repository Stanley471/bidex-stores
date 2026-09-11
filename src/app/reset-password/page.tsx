import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthCookie } from '@/lib/auth/session'
import { verifyToken } from '@/lib/auth/jwt'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthFooter } from '@/components/auth/AuthFooter'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

interface ResetPasswordPageProps {
  searchParams: Promise<{
    token?: string
  }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const cookieStore = await cookies()
  const authToken = getAuthCookie(cookieStore)

  if (authToken) {
    try {
      const payload = await verifyToken(authToken)
      if (payload?.sub) {
        const role = String(payload.role || 'CUSTOMER')
        redirect(role === 'ADMIN' ? '/admin' : '/dashboard')
      }
    } catch {
      // Invalid/expired token -> proceed to form
    }
  }

  const params = await searchParams

  return (
    <AuthLayout>
      <AuthCard description="Create a strong password to secure your account.">
        <ResetPasswordForm token={params.token} />
        <AuthFooter text="Back to" linkHref="/login" linkText="Login" />
      </AuthCard>
    </AuthLayout>
  )
}
