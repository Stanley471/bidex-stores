import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAdmin } from '@/lib/auth/authorization'
import { HomepageBuilderView } from '@/components/admin/homepage/HomepageBuilderView'

export default async function AdminHomepageBuilderPage() {
  const token = getAuthCookie(await cookies())

  try {
    await requireAdmin(token)
  } catch {
    redirect('/login?redirectTo=/admin/homepage')
  }

  return <HomepageBuilderView />
}
