import { prisma } from '@/lib/prisma';
import type { Product, ProductVariant as StorefrontProductVariant } from '@/types/product';

export const storefrontService = {
  async getStorefrontProducts(): Promise<Product[]> {
    let currencyCode = 'NGN'
    try {
      const settings = await prisma.storeSettings.findFirst({ orderBy: { createdAt: 'asc' } })
      if (settings?.currencyCode) {
        currencyCode = settings.currencyCode
      }
    } catch {
      // Fallback
    }

    const dbProducts = await prisma.product.findMany({
      where: { isPublished: true },
      include: {
        brand: true,
        categories: {
          include: {
            category: {
              include: {
                parent: true,
              },
            },
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return dbProducts.map((p) => {
      const primaryCat = p.categories[0]?.category;
      const basePriceNum = Number(p.basePrice);

      const images = p.images.length > 0
        ? p.images.map((img) => ({
            src: img.url,
            alt: img.altText || p.name,
            isPrimary: img.isPrimary,
          }))
        : [{ src: 'https://placehold.co/600x600?text=No+Image', alt: p.name, isPrimary: true }];

      const totalStock = p.hasVariants
        ? p.variants.reduce((acc, v) => acc + (v.isActive ? v.stock : 0), 0)
        : p.stock;

      const inventoryStatus = totalStock > 0 ? 'in_stock' : 'out_of_stock';

      const variants: StorefrontProductVariant[] = p.variants.map((v) => {
        const attrStr = Object.entries((v.attributes as Record<string, string>) || {})
          .map(([k, val]) => `${k}: ${val}`)
          .join(', ');

        return {
          id: v.id,
          name: attrStr || v.sku || 'Variant',
          sku: v.sku || '',
          price: v.priceOverride ? Number(v.priceOverride) : basePriceNum,
          stockStatus: v.stock > 0 && v.isActive ? 'in_stock' : 'out_of_stock',
          attributes: (v.attributes as Record<string, string>) || {},
        };
      });

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
        inventoryStatus,
        inventoryCount: totalStock,
        isFeatured: p.isFeatured,
        isOnSale: p.isOnSale,
        createdAt: p.createdAt.toISOString(),
        variants: p.hasVariants ? variants : undefined,
        specifications: (p.specifications as Array<{ key: string; value: string }>) || [],
      };
    });
  },

  async getStorefrontProductBySlug(slug: string): Promise<Product | null> {
    let currencyCode = 'NGN'
    try {
      const settings = await prisma.storeSettings.findFirst({ orderBy: { createdAt: 'asc' } })
      if (settings?.currencyCode) {
        currencyCode = settings.currencyCode
      }
    } catch {
      // Fallback
    }

    const p = await prisma.product.findFirst({
      where: { slug, isPublished: true },
      include: {
        brand: true,
        categories: {
          include: {
            category: {
              include: {
                parent: true,
              },
            },
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!p) return null;

    const primaryCat = p.categories[0]?.category;
    const basePriceNum = Number(p.basePrice);

    const images = p.images.length > 0
      ? p.images.map((img) => ({
          src: img.url,
          alt: img.altText || p.name,
          isPrimary: img.isPrimary,
        }))
      : [{ src: 'https://placehold.co/600x600?text=No+Image', alt: p.name, isPrimary: true }];

    const totalStock = p.hasVariants
      ? p.variants.reduce((acc, v) => acc + (v.isActive ? v.stock : 0), 0)
      : p.stock;

    const inventoryStatus = totalStock > 0 ? 'in_stock' : 'out_of_stock';

    const variants: StorefrontProductVariant[] = p.variants.map((v) => {
      const attrStr = Object.entries((v.attributes as Record<string, string>) || {})
        .map(([k, val]) => `${k}: ${val}`)
        .join(', ');

      return {
        id: v.id,
        name: attrStr || v.sku || 'Variant',
        sku: v.sku || '',
        price: v.priceOverride ? Number(v.priceOverride) : basePriceNum,
        stockStatus: v.stock > 0 && v.isActive ? 'in_stock' : 'out_of_stock',
        attributes: (v.attributes as Record<string, string>) || {},
      };
    });

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
      inventoryStatus,
      inventoryCount: totalStock,
      isFeatured: p.isFeatured,
      isOnSale: p.isOnSale,
      createdAt: p.createdAt.toISOString(),
      variants: p.hasVariants ? variants : undefined,
      specifications: (p.specifications as Array<{ key: string; value: string }>) || [],
    };
  },
};
