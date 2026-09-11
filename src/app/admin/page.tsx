import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAdmin } from '@/lib/auth/authorization'
import { DashboardView } from '@/components/admin/dashboard/DashboardView'

export default async function AdminDashboardPage() {
  const token = getAuthCookie(await cookies())

  try {
    await requireAdmin(token)
  } catch {
    redirect('/login?redirectTo=/admin')
  }

  return <DashboardView />
}
