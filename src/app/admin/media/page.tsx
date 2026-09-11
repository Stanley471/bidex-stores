import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAdmin } from '@/lib/auth/authorization'
import { MediaLibraryView } from '@/components/admin/media/MediaLibraryView'

export default async function AdminMediaPage() {
  const token = getAuthCookie(await cookies())

  try {
    await requireAdmin(token)
  } catch {
    redirect('/login?redirectTo=/admin/media')
  }

  return <MediaLibraryView />
}
