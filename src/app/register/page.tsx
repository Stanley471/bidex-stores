import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthCookie } from '@/lib/auth/session'
import { verifyToken } from '@/lib/auth/jwt'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { AuthFooter } from '@/components/auth/AuthFooter'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { storeSettingsService } from '@/services/store-settings.service'

export default async function RegisterPage() {
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
      // Invalid/expired token -> proceed to render registration form
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
      <AuthCard description="Create your account to start shopping.">
        <RegisterForm />

        <div className="space-y-3 pt-2">
          <AuthHeader title="Already have an account?" subtitle="Sign in to continue" linkHref="/login" linkText="Login" />
          <AuthFooter text="Need a password reset?" linkHref="/forgot-password" linkText="Reset it" />
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
