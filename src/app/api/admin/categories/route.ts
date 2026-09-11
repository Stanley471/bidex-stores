import { NextResponse } from 'next/server'
import { CategorySchema } from '@/lib/category/validation'
import { verifyAdminAuth } from '@/lib/auth/authorization'
import { categoryService } from '@/services/category.service'

export async function GET(request: Request) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse

  const url = new URL(request.url)
  const search = url.searchParams.get('search') ?? undefined
  const parentId = url.searchParams.get('parentId')

  try {
    const categories = await categoryService.getCategories({
      search,
      parentId: parentId === 'null' ? null : parentId || undefined,
    })

    return NextResponse.json({ success: true, categories })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to load categories.',
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
    const parsed = CategorySchema.safeParse(body)

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

    const category = await categoryService.createCategory(parsed.data)

    return NextResponse.json(
      {
        success: true,
        message: 'Category created successfully.',
        category,
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
        message: error instanceof Error ? error.message : 'Unable to create category.',
      },
      { status: 400 },
    )
  }
}
