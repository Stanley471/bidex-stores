import type { Product, Brand, Category, ProductImage, ProductVariant } from '@/generated/prisma/client'
import type { ProductInput } from '@/lib/product/validation'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export interface ProductWithRelations extends Product {
  brand: Brand
  categories: {
    category: Category
  }[]
  images: ProductImage[]
  variants: ProductVariant[]
  _count?: {
    orderItems: number
    reviews: number
    cartItems: number
  }
}

export interface ProductListOptions {
  search?: string
  brandId?: string
  categoryId?: string
  isPublished?: boolean
  isFeatured?: boolean
  isOnSale?: boolean
  page?: number
  pageSize?: number
}

export interface ProductListResult {
  products: ProductWithRelations[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

class ProductService {
  async createProduct(input: ProductInput): Promise<ProductWithRelations> {
    const name = input.name.trim()
    if (!name) {
      throw new Error('Product name is required.')
    }

    const slug = slugify(input.slug?.trim() || name)
    if (!slug) {
      throw new Error('Product slug is required.')
    }

    // Check slug uniqueness
    const existingSlug = await prisma.product.findUnique({
      where: { slug },
    })
    if (existingSlug) {
      throw new Error('A product with this slug already exists.')
    }

    // Check main SKU uniqueness if provided
    const sku = input.sku?.trim() || null
    if (sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku },
      })
      if (existingSku) {
        throw new Error('A product with this SKU already exists.')
      }
    }

    // Validate Brand existence
    const brand = await prisma.brand.findUnique({
      where: { id: input.brandId },
    })
    if (!brand) {
      throw new Error('Selected brand does not exist.')
    }

    // Validate Categories existence
    if (input.categoryIds && input.categoryIds.length > 0) {
      const foundCount = await prisma.category.count({
        where: { id: { in: input.categoryIds } },
      })
      if (foundCount !== input.categoryIds.length) {
        throw new Error('One or more selected categories do not exist.')
      }
    }

    // Process images (ensure at least one primary if images exist)
    const processedImages = (input.images || []).map((img, idx) => ({
      url: img.url.trim(),
      altText: img.altText?.trim() || null,
      sortOrder: img.sortOrder ?? idx,
      isPrimary: input.images.some((i) => i.isPrimary) ? img.isPrimary : idx === 0,
    }))

    // Process variants
    const processedVariants = input.hasVariants
      ? (input.variants || []).map((v) => ({
          sku: v.sku?.trim() || null,
          priceOverride: v.priceOverride !== undefined && v.priceOverride !== null ? v.priceOverride : null,
          stock: Math.max(0, v.stock ?? 0),
          attributes: v.attributes || {},
          isActive: v.isActive ?? true,
        }))
      : []

    // Transactionally create product with relations
    return prisma.product.create({
      data: {
        name,
        slug,
        description: input.description?.trim() || null,
        basePrice: input.basePrice,
        stock: Math.max(0, input.stock),
        hasVariants: input.hasVariants,
        sku,
        isPublished: input.isPublished,
        isFeatured: input.isFeatured,
        isOnSale: input.isOnSale,
        brand: { connect: { id: input.brandId } },
        categories: {
          create: (input.categoryIds || []).map((catId) => ({
            category: { connect: { id: catId } },
          })),
        },
        images: {
          create: processedImages,
        },
        variants: {
          create: processedVariants,
        },
        specifications: input.specifications || [],
      },
      include: {
        brand: true,
        categories: {
          include: {
            category: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          orderBy: { createdAt: 'asc' },
        },
      },
    }) as Promise<ProductWithRelations>
  }

  async getProducts(options: ProductListOptions = {}): Promise<ProductListResult> {
    const page = Math.max(1, options.page ?? 1)
    const pageSize = Math.max(1, options.pageSize ?? 10)

    const where: Record<string, unknown> = {}

    if (options.search?.trim()) {
      const q = options.search.trim()
      where.OR = [
        { name: { contains: q, mode: 'insensitive' as const } },
        { slug: { contains: q, mode: 'insensitive' as const } },
        { sku: { contains: q, mode: 'insensitive' as const } },
      ]
    }

    if (options.brandId) {
      where.brandId = options.brandId
    }

    if (options.categoryId) {
      where.categories = {
        some: {
          categoryId: options.categoryId,
        },
      }
    }

    if (options.isPublished !== undefined) {
      where.isPublished = options.isPublished
    }

    if (options.isFeatured !== undefined) {
      where.isFeatured = options.isFeatured
    }

    if (options.isOnSale !== undefined) {
      where.isOnSale = options.isOnSale
    }

    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          brand: true,
          categories: {
            include: {
              category: true,
            },
          },
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          variants: {
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
    ])

    return {
      products: products as ProductWithRelations[],
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    }
  }

  async getProduct(id: string): Promise<ProductWithRelations> {
    const product = await prisma.product.findUnique({
      where: { id },
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
            orderItems: true,
            reviews: true,
            cartItems: true,
          },
        },
      },
    })

    if (!product) {
      throw new Error('Product not found.')
    }

    return product as ProductWithRelations
  }

  async getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
    const product = await prisma.product.findUnique({
      where: { slug },
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
      },
    })

    return product as ProductWithRelations | null
  }

  async updateProduct(id: string, input: ProductInput): Promise<ProductWithRelations> {
    const existing = await prisma.product.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new Error('Product not found.')
    }

    const name = input.name.trim()
    if (!name) {
      throw new Error('Product name is required.')
    }

    const slug = slugify(input.slug?.trim() || name)
    if (!slug) {
      throw new Error('Product slug is required.')
    }

    // Duplicate slug check
    const duplicateSlug = await prisma.product.findFirst({
      where: {
        AND: [{ id: { not: id } }, { slug }],
      },
    })
    if (duplicateSlug) {
      throw new Error('A product with this slug already exists.')
    }

    // Duplicate SKU check
    const sku = input.sku?.trim() || null
    if (sku) {
      const duplicateSku = await prisma.product.findFirst({
        where: {
          AND: [{ id: { not: id } }, { sku }],
        },
      })
      if (duplicateSku) {
        throw new Error('A product with this SKU already exists.')
      }
    }

    // Validate Brand
    const brand = await prisma.brand.findUnique({
      where: { id: input.brandId },
    })
    if (!brand) {
      throw new Error('Selected brand does not exist.')
    }

    // Validate Categories
    if (input.categoryIds && input.categoryIds.length > 0) {
      const foundCount = await prisma.category.count({
        where: { id: { in: input.categoryIds } },
      })
      if (foundCount !== input.categoryIds.length) {
        throw new Error('One or more selected categories do not exist.')
      }
    }

    // Images processing
    const processedImages = (input.images || []).map((img, idx) => ({
      url: img.url.trim(),
      altText: img.altText?.trim() || null,
      sortOrder: img.sortOrder ?? idx,
      isPrimary: input.images.some((i) => i.isPrimary) ? img.isPrimary : idx === 0,
    }))

    // Variants processing
    const processedVariants = input.hasVariants
      ? (input.variants || []).map((v) => ({
          sku: v.sku?.trim() || null,
          priceOverride: v.priceOverride !== undefined && v.priceOverride !== null ? v.priceOverride : null,
          stock: Math.max(0, v.stock ?? 0),
          attributes: v.attributes || {},
          isActive: v.isActive ?? true,
        }))
      : []

    // Execute update inside a transaction to replace categories, images, and variants cleanly
    return prisma.$transaction(async (tx) => {
      // 1. Delete existing category relations
      await tx.productCategory.deleteMany({
        where: { productId: id },
      })

      // 2. Delete existing images
      await tx.productImage.deleteMany({
        where: { productId: id },
      })

      // 3. Delete existing variants
      await tx.productVariant.deleteMany({
        where: { productId: id },
      })

      // 4. Update core product and recreate relations
      return tx.product.update({
        where: { id },
        data: {
          name,
          slug,
          description: input.description?.trim() || null,
          basePrice: input.basePrice,
          stock: Math.max(0, input.stock),
          hasVariants: input.hasVariants,
          sku,
          isPublished: input.isPublished,
          isFeatured: input.isFeatured,
          isOnSale: input.isOnSale,
          brand: { connect: { id: input.brandId } },
          categories: {
            create: (input.categoryIds || []).map((catId) => ({
              category: { connect: { id: catId } },
            })),
          },
          images: {
            create: processedImages,
          },
          variants: {
            create: processedVariants,
          },
          specifications: input.specifications || [],
        },
        include: {
          brand: true,
          categories: {
            include: {
              category: true,
            },
          },
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          variants: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })
    }) as Promise<ProductWithRelations>
  }

  async publishProduct(id: string, isPublished: boolean): Promise<Product> {
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      throw new Error('Product not found.')
    }

    return prisma.product.update({
      where: { id },
      data: { isPublished },
    })
  }

  async deleteProduct(id: string): Promise<Product> {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    })

    if (!existing) {
      throw new Error('Product not found.')
    }

    if (existing._count.orderItems > 0) {
      throw new Error('Cannot delete a product that has associated order items.')
    }

    // Cascade delete manually in case cascade constraints are missing
    return prisma.$transaction(async (tx) => {
      await tx.productCategory.deleteMany({ where: { productId: id } })
      await tx.productImage.deleteMany({ where: { productId: id } })
      await tx.productVariant.deleteMany({ where: { productId: id } })
      await tx.review.deleteMany({ where: { productId: id } })
      await tx.wishlist.deleteMany({ where: { productId: id } })
      await tx.cartItem.deleteMany({ where: { productId: id } })

      return tx.product.delete({
        where: { id },
      })
    })
  }

  async getFeaturedProducts(limit = 8): Promise<ProductWithRelations[]> {
    const products = await prisma.product.findMany({
      where: { isPublished: true, isFeatured: true },
      take: limit,
      include: {
        brand: true,
        categories: { include: { category: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return products as ProductWithRelations[]
  }

  async getBestSellerProducts(limit = 8): Promise<ProductWithRelations[]> {
    const products = await prisma.product.findMany({
      where: { isPublished: true },
      take: limit,
      include: {
        brand: true,
        categories: { include: { category: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return products as ProductWithRelations[]
  }

  async getFlashSaleProducts(limit = 6): Promise<ProductWithRelations[]> {
    const products = await prisma.product.findMany({
      where: { isPublished: true, isOnSale: true },
      take: limit,
      include: {
        brand: true,
        categories: { include: { category: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return products as ProductWithRelations[]
  }

  async getNewArrivalProducts(limit = 8): Promise<ProductWithRelations[]> {
    const products = await prisma.product.findMany({
      where: { isPublished: true },
      take: limit,
      include: {
        brand: true,
        categories: { include: { category: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return products as ProductWithRelations[]
  }
}

export const productService = new ProductService()
