import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAdmin } from '@/lib/auth/authorization'
import { mediaService } from '@/services/media.service'

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '24', 10)
  const search = searchParams.get('search') || undefined

  try {
    const result = await mediaService.listMedia({ page, limit, search })
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch media assets.' },
      { status: 500 },
    )
  }
}

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
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const altText = (formData.get('altText') as string) || undefined

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    const media = await mediaService.uploadMedia({
      fileBuffer,
      originalName: file.name,
      mimeType: file.type,
      altText,
    })

    return NextResponse.json({ success: true, media, message: 'Media uploaded successfully.' })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Upload failed.' },
      { status: 400 },
    )
  }
}
