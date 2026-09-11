import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAuth } from '@/lib/auth/authorization'
import { prisma } from '@/lib/prisma'
import { storefrontService } from '@/services/storefront.service'

export async function GET() {
  const token = getAuthCookie(await cookies())
  let user
  try {
    user = await requireAuth(token)
  } catch {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 })
  }

  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: user.sub },
      include: {
        product: {
          include: {
            brand: true,
            categories: { include: { category: { include: { parent: true } } } },
            images: { orderBy: { sortOrder: 'asc' } },
            variants: { orderBy: { createdAt: 'asc' } },
            _count: { select: { reviews: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    let currencyCode = 'NGN'
    try {
      const settings = await prisma.storeSettings.findFirst({ orderBy: { createdAt: 'asc' } })
      if (settings?.currencyCode) {
        currencyCode = settings.currencyCode
      }
    } catch {
      // Fallback NGN
    }

    const products = items.map((w) => {
      const p = w.product
      const primaryCat = p.categories[0]?.category
      const basePriceNum = Number(p.basePrice)
      const images = p.images.length > 0
        ? p.images.map((img) => ({ src: img.url, alt: img.altText || p.name, isPrimary: img.isPrimary }))
        : [{ src: 'https://placehold.co/600x600?text=No+Image', alt: p.name, isPrimary: true }]

      const totalStock = p.hasVariants
        ? p.variants.reduce((acc, v) => acc + (v.isActive ? v.stock : 0), 0)
        : p.stock

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        shortDescription: p.description ? p.description.slice(0, 120) : '',
        description: p.description || '',
        category: primaryCat ? primaryCat.name : 'Uncategorized',
        parentCategory: primaryCat?.parent ? primaryCat.parent.name : undefined,
        brand: p.brand.name,
        tags: [],
        price: basePriceNum,
        compareAtPrice: p.isOnSale ? basePriceNum * 1.2 : undefined,
        currency: currencyCode,
        rating: 5,
        reviewCount: p._count.reviews || 0,
        images,
        inventoryStatus: totalStock > 0 ? ('in_stock' as const) : ('out_of_stock' as const),
        inventoryCount: totalStock,
        isFeatured: p.isFeatured,
        isOnSale: p.isOnSale,
        createdAt: p.createdAt.toISOString(),
      }
    })

    return NextResponse.json({ success: true, products, productIds: products.map((p) => p.id) })
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Unable to fetch wishlist.' },
      { status: 400 },
    )
  }
}

export async function POST(request: Request) {
  const token = getAuthCookie(await cookies())
  let user
  try {
    user = await requireAuth(token)
  } catch {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 })
  }

  try {
    const { productId } = await request.json()
    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ success: false, message: 'Product ID is required.' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product || !product.isPublished) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 })
    }

    await prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId: user.sub,
          productId,
        },
      },
      update: {},
      create: {
        userId: user.sub,
        productId,
      },
    })

    return GET()
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Unable to add to wishlist.' },
      { status: 400 },
    )
  }
}

export async function DELETE(request: Request) {
  const token = getAuthCookie(await cookies())
  let user
  try {
    user = await requireAuth(token)
  } catch {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    let productId = searchParams.get('productId')

    if (!productId) {
      try {
        const body = await request.json()
        productId = body.productId
      } catch {
        // No body passed
      }
    }

    if (!productId) {
      return NextResponse.json({ success: false, message: 'Product ID is required.' }, { status: 400 })
    }

    await prisma.wishlist.deleteMany({
      where: {
        userId: user.sub,
        productId,
      },
    })

    return GET()
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Unable to remove from wishlist.' },
      { status: 400 },
    )
  }
}
