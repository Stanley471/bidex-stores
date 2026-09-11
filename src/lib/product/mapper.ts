import type { ProductWithRelations } from '@/services/product.service'
import type { Product as StorefrontProduct, InventoryStatus } from '@/types/product'

export function mapPrismaProductToStorefront(
  p: ProductWithRelations,
  currencyCode = 'NGN',
): StorefrontProduct {
  const primaryImage = p.images?.find((img) => img.isPrimary) || p.images?.[0]
  const imageSrc = primaryImage?.url || ''

  let inventoryStatus: InventoryStatus = 'in_stock'
  if (p.stock <= 0) {
    inventoryStatus = 'out_of_stock'
  } else if (p.stock <= 5) {
    inventoryStatus = 'low_stock'
  }

  const price = Number(p.basePrice)
  const compareAtPrice = (p as unknown as { compareAtPrice?: unknown }).compareAtPrice
    ? Number((p as unknown as { compareAtPrice?: unknown }).compareAtPrice)
    : undefined

  const discountPercent =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : undefined

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    shortDescription: p.description || p.name,
    description: p.description || '',
    category: p.categories?.[0]?.category?.name || 'General',
    brand: p.brand?.name || 'Generic',
    tags: [],
    price,
    compareAtPrice,
    currency: currencyCode as unknown as StorefrontProduct['currency'],
    rating: (p._count?.reviews && p._count.reviews > 0) ? 5.0 : 0,
    reviewCount: p._count?.reviews || 0,
    images:
      p.images && p.images.length > 0
        ? p.images.map((img) => ({
            src: img.url,
            alt: img.altText || p.name,
            isPrimary: img.isPrimary,
          }))
        : imageSrc
        ? [{ src: imageSrc, alt: p.name }]
        : [],
    inventoryStatus,
    inventoryCount: p.stock,
    isFeatured: p.isFeatured,
    isOnSale: compareAtPrice ? compareAtPrice > price : false,
    discountPercent,
    createdAt: p.createdAt.toISOString(),
  }
}
