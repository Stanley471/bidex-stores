import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthCookie } from '@/lib/auth/session'
import { verifyToken } from '@/lib/auth/jwt'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthFooter } from '@/components/auth/AuthFooter'

interface VerifyEmailPageProps {
  searchParams: Promise<{
    token?: string
  }>
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
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
      // Invalid/expired token -> proceed to view
    }
  }

  const params = await searchParams
  const token = params.token ?? ''

  const message = token
    ? 'Email verification flow is ready for your backend integration.'
    : 'Missing verification token.'

  return (
    <AuthLayout>
      <AuthCard description="Confirm your address to unlock the full account experience.">
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{message}</p>
        <AuthFooter text="Back to" linkHref="/login" linkText="Login" />
      </AuthCard>
    </AuthLayout>
  )
}
