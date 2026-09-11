import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAdmin } from '@/lib/auth/authorization'
import { StoreSettingsView } from '@/components/admin/settings/StoreSettingsView'

export default async function AdminSettingsPage() {
  const token = getAuthCookie(await cookies())

  try {
    await requireAdmin(token)
  } catch {
    redirect('/login?redirectTo=/admin/settings')
  }

  return <StoreSettingsView />
}
