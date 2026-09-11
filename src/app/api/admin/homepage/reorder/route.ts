import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAdmin } from '@/lib/auth/authorization'
import { homepageService } from '@/services/homepage.service'

export async function POST(request: Request) {
  const token = getAuthCookie(await cookies())

  try {
    await requireAdmin(token)
  } catch (error) {
    const status = error instanceof Error && error.message.includes('Authentication') ? 401 : 403
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unauthorized.' },
      { status },
    )
  }

  try {
    const body = await request.json()
    const { orderedIds } = body

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json(
        { success: false, message: 'orderedIds must be an array of section IDs.' },
        { status: 400 },
      )
    }

    await homepageService.reorderHomepageSections(orderedIds)
    return NextResponse.json({ success: true, message: 'Homepage sections reordered successfully.' })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to reorder sections.' },
      { status: 400 },
    )
  }
}
