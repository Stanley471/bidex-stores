import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/authorization'
import { ShippingConfigSchema } from '@/lib/shipping/validation'
import { shippingServerService } from '@/services/shipping.server'

export async function GET() {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse

  try {
    const config = await shippingServerService.getShippingConfig()
    return NextResponse.json({ success: true, config })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to load shipping config.' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse

  try {
    const body = await request.json()
    const parsed = ShippingConfigSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const config = await shippingServerService.updateShippingConfig(parsed.data)
    return NextResponse.json({
      success: true,
      message: 'Shipping configuration updated successfully.',
      config,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to update shipping config.' },
      { status: 400 },
    )
  }
}
