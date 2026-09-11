import { NextResponse } from 'next/server'
import { CategorySchema } from '@/lib/category/validation'
import { verifyAdminAuth } from '@/lib/auth/authorization'
import { categoryService } from '@/services/category.service'

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
    const category = await categoryService.getCategory(id)

    return NextResponse.json({ success: true, category })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Category not found.',
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

    const category = await categoryService.updateCategory(id, parsed.data)

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully.',
      category,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('exists')) {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 })
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to update category.',
      },
      { status: 400 },
    )
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse

  try {
    const { id } = await params
    await categoryService.deleteCategory(id)

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully.',
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to delete category.',
      },
      { status: 400 },
    )
  }
}
