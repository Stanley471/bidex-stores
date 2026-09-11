import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAdmin } from '@/lib/auth/authorization'
import { homepageService } from '@/services/homepage.service'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params
    const body = await request.json()
    const section = await homepageService.updateHomepageSection(id, body)
    return NextResponse.json({ success: true, section, message: 'Section updated successfully.' })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to update section.' },
      { status: 400 },
    )
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params
    await homepageService.deleteHomepageSection(id)
    return NextResponse.json({ success: true, message: 'Section deleted successfully.' })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to delete section.' },
      { status: 400 },
    )
  }
}
