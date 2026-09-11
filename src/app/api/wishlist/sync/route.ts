import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAuth } from '@/lib/auth/authorization'
import { prisma } from '@/lib/prisma'
import { GET } from '../route'

export async function POST(request: Request) {
  const token = getAuthCookie(await cookies())
  let user
  try {
    user = await requireAuth(token)
  } catch {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 })
  }

  try {
    const { productIds } = await request.json()
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return GET()
    }

    // Filter valid published products
    const validProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isPublished: true,
      },
      select: { id: true },
    })

    const validIds = validProducts.map((p) => p.id)

    // Upsert items into DB wishlist for authenticated user
    for (const productId of validIds) {
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
    }

    return GET()
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Unable to sync wishlist.' },
      { status: 400 },
    )
  }
}
