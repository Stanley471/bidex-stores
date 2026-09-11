import type { Brand } from '@/generated/prisma/client'
import type { CreateBrandInput, UpdateBrandInput } from '@/lib/brand/validation'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export interface BrandListOptions {
  search?: string
  page?: number
  pageSize?: number
}

export interface BrandListResult {
  brands: Array<Brand & { _count: { products: number } }>
  total: number
  page: number
  pageSize: number
  pageCount: number
}

class BrandService {
  async createBrand(input: CreateBrandInput) {
    const name = input.name.trim()
    const slug = slugify(input.slug?.trim() ?? name)

    if (!name) {
      throw new Error('Brand name is required.')
    }

    if (!slug) {
      throw new Error('Brand slug is required.')
    }

    const existingName = await prisma.brand.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive' as const,
        },
      },
    })

    if (existingName) {
      throw new Error('A brand with this name already exists.')
    }

    const existingSlug = await prisma.brand.findUnique({
      where: {
        slug,
      },
    })

    if (existingSlug) {
      throw new Error('A brand with this slug already exists.')
    }

    return prisma.brand.create({
      data: {
        name,
        slug,
        logo: input.logo?.trim() || null,
        website: input.website?.trim() || null,
        description: input.description?.trim() || null,
      },
    })
  }

  async getBrands(options: BrandListOptions = {}): Promise<BrandListResult> {
    const page = Math.max(1, options.page ?? 1)
    const pageSize = Math.max(1, options.pageSize ?? 10)
    const where = options.search
      ? {
          OR: [
            {
              name: {
                contains: options.search,
                mode: 'insensitive' as const,
              },
            },
            {
              slug: {
                contains: options.search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : undefined

    const [total, brands] = await prisma.$transaction([
      prisma.brand.count({ where }),
      prisma.brand.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      }),
    ])

    return {
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
      brands,
    }
  }

  async getBrand(id: string) {
    const brand = await prisma.brand.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    if (!brand) {
      throw new Error('Brand not found.')
    }

    return brand
  }

  async updateBrand(id: string, input: UpdateBrandInput) {
    const existingBrand = await prisma.brand.findUnique({
      where: {
        id,
      },
    })

    if (!existingBrand) {
      throw new Error('Brand not found.')
    }

    const name = input.name.trim()
    const slug = slugify(input.slug?.trim() ?? name)

    if (!name) {
      throw new Error('Brand name is required.')
    }

    if (!slug) {
      throw new Error('Brand slug is required.')
    }

    const duplicateName = await prisma.brand.findFirst({
      where: {
        AND: [
          {
            id: {
              not: id,
            },
          },
          {
            name: {
              equals: name,
              mode: 'insensitive' as const,
            },
          },
        ],
      },
    })

    if (duplicateName) {
      throw new Error('A brand with this name already exists.')
    }

    const duplicateSlug = await prisma.brand.findFirst({
      where: {
        AND: [
          {
            id: {
              not: id,
            },
          },
          {
            slug,
          },
        ],
      },
    })

    if (duplicateSlug) {
      throw new Error('A brand with this slug already exists.')
    }

    return prisma.brand.update({
      where: {
        id,
      },
      data: {
        name,
        slug,
        logo: input.logo?.trim() || null,
        website: input.website?.trim() || null,
        description: input.description?.trim() || null,
      },
    })
  }

  async deleteBrand(id: string) {
    const brand = await prisma.brand.findUnique({
      where: {
        id,
      },
    })

    if (!brand) {
      throw new Error('Brand not found.')
    }

    const connectedProducts = await prisma.product.count({
      where: {
        brandId: id,
      },
    })

    if (connectedProducts > 0) {
      throw new Error('Cannot delete a brand with associated products.')
    }

    return prisma.brand.delete({
      where: {
        id,
      },
    })
  }
}

export const brandService = new BrandService()
