import { NextResponse } from 'next/server'
import { storeSettingsService } from '@/services/store-settings.service'

export async function GET() {
  try {
    const settings = await storeSettingsService.getPublicStoreSettings()
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to fetch public settings.' },
      { status: 500 },
    )
  }
}
