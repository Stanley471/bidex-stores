import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/authorization'
import { productService } from '@/services/product.service'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse

  try {
    const { id } = await params
    const body = await request.json()

    if (typeof body.isPublished !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'isPublished must be a boolean.' },
        { status: 400 },
      )
    }

    const product = await productService.publishProduct(id, body.isPublished)

    return NextResponse.json({
      success: true,
      message: `Product ${product.isPublished ? 'published' : 'unpublished'} successfully.`,
      product,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to update publication status.',
      },
      { status: 400 },
    )
  }
}
