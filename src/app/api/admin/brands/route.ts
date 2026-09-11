import { NextResponse } from 'next/server'
import { BrandSchema } from '@/lib/brand/validation'
import { verifyAdminAuth } from '@/lib/auth/authorization'
import { brandService } from '@/services/brand.service'

export async function GET(request: Request) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse


  const url = new URL(request.url)
  const search = url.searchParams.get('search') ?? undefined
  const page = Number(url.searchParams.get('page') ?? '1')
  const pageSize = Number(url.searchParams.get('pageSize') ?? '10')

  try {
    const brands = await brandService.getBrands({
      search: search?.trim() || undefined,
      page: Number.isNaN(page) ? 1 : page,
      pageSize: Number.isNaN(pageSize) ? 10 : pageSize,
    })

    return NextResponse.json({ success: true, data: brands })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to load brands.',
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse


  try {
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

    const brand = await brandService.createBrand(parsed.data)

    return NextResponse.json(
      {
        success: true,
        message: 'Brand created successfully.',
        brand,
      },
      { status: 201 },
    )
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
        message: error instanceof Error ? error.message : 'Unable to create the brand.',
      },
      { status: 500 },
    )
  }
}
