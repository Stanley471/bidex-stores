import { NextResponse } from 'next/server'
import { shippingServerService } from '@/services/shipping.server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const subtotal = Number(url.searchParams.get('subtotal') ?? '0')

  try {
    const calculation = await shippingServerService.calculateShipping(Number.isNaN(subtotal) ? 0 : subtotal)
    return NextResponse.json({ success: true, calculation })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to calculate shipping.' },
      { status: 500 },
    )
  }
}
