import { NextResponse } from 'next/server'
import { ProductSchema } from '@/lib/product/validation'
import { verifyAdminAuth } from '@/lib/auth/authorization'
import { productService } from '@/services/product.service'

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
    const product = await productService.getProduct(id)

    return NextResponse.json({ success: true, product })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Product not found.',
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

    const product = await productService.updateProduct(id, parsed.data)

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully.',
      product,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('exists')) {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 })
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to update product.',
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
    await productService.deleteProduct(id)

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully.',
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to delete product.',
      },
      { status: 400 },
    )
  }
}
