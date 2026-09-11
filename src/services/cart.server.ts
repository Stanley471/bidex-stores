import type { Product, ProductVariant as StorefrontProductVariant } from '@/types/product'
import type { CartItem, CartState } from '@/types/cart'
import { calculateCartSummary, normalizeQuantity } from '@/lib/cart/cartCalculations'
import { prisma } from '@/lib/prisma'

export class CartServerService {
  async getDbCart(userId: string): Promise<CartState> {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' } },
                brand: true,
                categories: { include: { category: true } },
              },
            },
            productVariant: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { orderBy: { sortOrder: 'asc' } },
                  brand: true,
                  categories: { include: { category: true } },
                },
              },
              productVariant: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    }

    let currencyCode = 'NGN'
    try {
      const settings = await prisma.storeSettings.findFirst({ orderBy: { createdAt: 'asc' } })
      if (settings?.currencyCode) {
        currencyCode = settings.currencyCode
      }
    } catch {
      // Fallback
    }

    const formattedItems: CartItem[] = cart.items
      .filter((item) => item.product.isPublished)
      .map((item) => {
        const p = item.product
        const v = item.productVariant

        const effectivePrice = v?.priceOverride
          ? Number(v.priceOverride)
          : Number(p.basePrice)

        const images = p.images.length > 0
          ? p.images.map((img) => ({ src: img.url, alt: img.altText || p.name, isPrimary: img.isPrimary }))
          : [{ src: 'https://placehold.co/600x600?text=No+Image', alt: p.name, isPrimary: true }]

        const variantObj: StorefrontProductVariant | undefined = v
          ? {
              id: v.id,
              name: Object.entries((v.attributes as Record<string, string>) || {})
                .map(([k, val]) => `${k}: ${val}`)
                .join(', ') || v.sku || 'Variant',
              sku: v.sku || '',
              price: effectivePrice,
              stockStatus: v.stock > 0 && v.isActive ? 'in_stock' : 'out_of_stock',
              attributes: (v.attributes as Record<string, string>) || {},
            }
          : undefined

        const storefrontProduct: Product = {
          id: p.id,
          slug: p.slug,
          name: p.name,
          shortDescription: p.description ? p.description.slice(0, 100) : '',
          description: p.description || '',
          category: p.categories[0]?.category.name || 'Uncategorized',
          brand: p.brand.name,
          tags: [],
          price: Number(p.basePrice),
          compareAtPrice: p.isOnSale ? Number(p.basePrice) * 1.2 : undefined,
          currency: currencyCode,
          rating: 5,
          reviewCount: 0,
          images,
          inventoryStatus: v ? (v.stock > 0 && v.isActive ? 'in_stock' : 'out_of_stock') : (p.stock > 0 ? 'in_stock' : 'out_of_stock'),
          inventoryCount: v ? v.stock : p.stock,
          isFeatured: p.isFeatured,
          isOnSale: p.isOnSale,
          createdAt: p.createdAt.toISOString(),
          variants: variantObj ? [variantObj] : undefined,
        }

        return {
          id: item.id,
          productId: item.productId,
          product: storefrontProduct,
          quantity: item.quantity,
          selectedVariantId: item.productVariantId || undefined,
          unitPrice: effectivePrice,
          salePrice: p.isOnSale ? effectivePrice : undefined,
          status: 'active',
          addedAt: item.createdAt.toISOString(),
        }
      })

    return {
      items: formattedItems,
      summary: calculateCartSummary(formattedItems),
    }
  }

  async addDbCartItem(
    userId: string,
    input: { productId: string; productVariantId?: string | null; quantity: number },
  ): Promise<CartState> {
    const qty = normalizeQuantity(input.quantity)
    if (qty <= 0) {
      throw new Error('Quantity must be greater than zero.')
    }

    const product = await prisma.product.findUnique({
      where: { id: input.productId },
      include: { variants: true },
    })

    if (!product || !product.isPublished) {
      throw new Error('Product not found or unavailable.')
    }

    let variantId: string | null = null
    let availableStock = product.stock

    if (product.hasVariants) {
      if (!input.productVariantId) {
        throw new Error('Please select a product variant.')
      }
      const variant = product.variants.find((v) => v.id === input.productVariantId)
      if (!variant || !variant.isActive) {
        throw new Error('Selected variant is inactive or unavailable.')
      }
      variantId = variant.id
      availableStock = variant.stock
    } else if (input.productVariantId) {
      const variant = product.variants.find((v) => v.id === input.productVariantId)
      if (variant && variant.isActive) {
        variantId = variant.id
        availableStock = variant.stock
      }
    }

    let cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } })
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: input.productId,
        productVariantId: variantId,
      },
    })

    const newTotalQty = (existingItem?.quantity ?? 0) + qty
    if (newTotalQty > availableStock) {
      throw new Error(`Cannot add items beyond available inventory (${availableStock} in stock).`)
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newTotalQty },
      })
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: input.productId,
          productVariantId: variantId,
          quantity: qty,
        },
      })
    }

    return this.getDbCart(userId)
  }

  async updateDbCartItem(userId: string, itemId: string, quantity: number): Promise<CartState> {
    const qty = Math.max(0, Math.floor(quantity))

    const cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) throw new Error('Cart not found.')

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true, productVariant: true },
    })

    if (!item) throw new Error('Cart item not found.')

    if (qty === 0) {
      await prisma.cartItem.delete({ where: { id: itemId } })
      return this.getDbCart(userId)
    }

    const availableStock = item.productVariant
      ? item.productVariant.stock
      : item.product.stock

    if (qty > availableStock) {
      throw new Error(`Requested quantity exceeds available stock (${availableStock} available).`)
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: qty },
    })

    return this.getDbCart(userId)
  }

  async removeDbCartItem(userId: string, itemId: string): Promise<CartState> {
    const cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) throw new Error('Cart not found.')

    await prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    })

    return this.getDbCart(userId)
  }

  async clearDbCart(userId: string): Promise<CartState> {
    const cart = await prisma.cart.findUnique({ where: { userId } })
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      })
    }

    return {
      items: [],
      summary: calculateCartSummary([]),
    }
  }
}

export const cartServerService = new CartServerService()
