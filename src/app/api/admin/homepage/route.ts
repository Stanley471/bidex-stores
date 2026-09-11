import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAdmin } from '@/lib/auth/authorization'
import { homepageService } from '@/services/homepage.service'

export async function GET() {
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
    const sections = await homepageService.getHomepageSections()
    return NextResponse.json({ success: true, sections })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch homepage sections.' },
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
    const body = await request.json()
    const section = await homepageService.createHomepageSection(body)
    return NextResponse.json({ success: true, section, message: 'Homepage section created.' })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to create homepage section.' },
      { status: 400 },
    )
  }
}
