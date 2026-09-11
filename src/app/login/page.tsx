import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthCookie } from '@/lib/auth/session'
import { verifyToken } from '@/lib/auth/jwt'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { LoginForm } from '@/components/auth/LoginForm'
import { storeSettingsService } from '@/services/store-settings.service'

interface LoginPageProps {
  searchParams: Promise<{
    redirectTo?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const cookieStore = await cookies()
  const token = getAuthCookie(cookieStore)

  if (token) {
    try {
      const payload = await verifyToken(token)
      if (payload?.sub) {
        const role = String(payload.role || 'CUSTOMER')
        let target = role === 'ADMIN' ? '/admin' : '/dashboard'

        if (params.redirectTo && params.redirectTo.startsWith('/')) {
          if (params.redirectTo.startsWith('/admin') && role !== 'ADMIN') {
            target = '/dashboard'
          } else {
            target = params.redirectTo
          }
        }

        redirect(target)
      }
    } catch {
      // Invalid/expired token -> proceed to render login form
    }
  }

  let publicSettings = {
    storeName: 'CTools Store',
    logo: null as string | null,
  }

  try {
    const s = await storeSettingsService.getPublicStoreSettings()
    publicSettings = {
      storeName: s.storeName || 'CTools Store',
      logo: s.logo || null,
    }
  } catch {
    // Fallback
  }

  return (
    <AuthLayout>
      <AuthCard description="Use your email and password to continue.">
        <LoginForm redirectTo={params.redirectTo} />

        <div className="pt-2">
          <AuthHeader title="Need an account?" subtitle="Create one in seconds" linkHref="/register" linkText="Register" />
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
