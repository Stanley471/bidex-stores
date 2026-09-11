import { NextResponse } from 'next/server'
import { BrandSchema } from '@/lib/brand/validation'
import { verifyAdminAuth } from '@/lib/auth/authorization'
import { brandService } from '@/services/brand.service'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: Request, { params }: RouteContext) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse

  try {
    const { id } = await params
    const brand = await brandService.getBrand(id)

    return NextResponse.json({ success: true, brand })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to load the brand.',
      },
      { status: 404 },
    )
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse

  try {
    const { id } = await params
    const body = await request.json()
    const parsed = BrandSchema.safeParse(body)

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

    const brand = await brandService.updateBrand(id, parsed.data)

    return NextResponse.json({ success: true, message: 'Brand updated successfully.', brand })
  } catch (error) {
    if (error instanceof Error && error.message.includes('exists')) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 409 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to update the brand.',
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse


  try {
    const { id } = await params
    await brandService.deleteBrand(id)

    return NextResponse.json({ success: true, message: 'Brand deleted successfully.' })
  } catch (error) {
    if (error instanceof Error && error.message.includes('associated products')) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to delete the brand.',
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 },
    )
  }
}
