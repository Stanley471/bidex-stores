import { NextResponse } from 'next/server'
import { homepageService } from '@/services/homepage.service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await homepageService.getHomepageData()

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Failed to fetch homepage data:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch homepage data.',
      },
      { status: 500 },
    )
  }
}
