import { NextResponse } from 'next/server'
import { ProductSchema } from '@/lib/product/validation'
import { verifyAdminAuth } from '@/lib/auth/authorization'
import { productService } from '@/services/product.service'

export async function GET(request: Request) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse

  const url = new URL(request.url)
  const search = url.searchParams.get('search') ?? undefined
  const brandId = url.searchParams.get('brandId') ?? undefined
  const categoryId = url.searchParams.get('categoryId') ?? undefined
  const isPublishedParam = url.searchParams.get('isPublished')
  const isFeaturedParam = url.searchParams.get('isFeatured')
  const page = Number(url.searchParams.get('page') ?? '1')
  const pageSize = Number(url.searchParams.get('pageSize') ?? '10')

  const isPublished = isPublishedParam === 'true' ? true : isPublishedParam === 'false' ? false : undefined
  const isFeatured = isFeaturedParam === 'true' ? true : isFeaturedParam === 'false' ? false : undefined

  try {
    const result = await productService.getProducts({
      search,
      brandId,
      categoryId,
      isPublished,
      isFeatured,
      page: Number.isNaN(page) ? 1 : page,
      pageSize: Number.isNaN(pageSize) ? 10 : pageSize,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to load products.',
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
    const parsed = ProductSchema.safeParse(body)

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

    const product = await productService.createProduct(parsed.data)

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully.',
        product,
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
        message: error instanceof Error ? error.message : 'Unable to create product.',
      },
      { status: 400 },
    )
  }
}
