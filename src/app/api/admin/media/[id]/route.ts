import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAdmin } from '@/lib/auth/authorization'
import { mediaService } from '@/services/media.service'

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
    const media = await mediaService.updateMediaMetadata(id, body.altText)
    return NextResponse.json({ success: true, media, message: 'Media metadata updated.' })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to update metadata.' },
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
    await mediaService.deleteMedia(id)
    return NextResponse.json({ success: true, message: 'Media asset deleted.' })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to delete media asset.' },
      { status: 400 },
    )
  }
}
