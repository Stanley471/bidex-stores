import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { storeConfig } from '@/config/store.config'
import type { AnySectionConfig, SectionTheme } from '@/types/homepage'
import { productService } from '@/services/product.service'
import { storeSettingsService } from '@/services/store-settings.service'
import { mapPrismaProductToStorefront } from '@/lib/product/mapper'

export interface UpdateSectionInput {
  title?: string | null
  subtitle?: string | null
  theme?: SectionTheme
  enabled?: boolean
  config?: Record<string, unknown>
}

export interface CreateSectionInput {
  type: string
  title?: string
  subtitle?: string
  theme?: SectionTheme
  enabled?: boolean
  config?: Record<string, unknown>
}

class HomepageService {
  private isSeeded = false

  async getHomepageData() {
    const [featuredRes, bestSellersRes, flashSaleRes, newArrivalsRes, categoriesRes, publicSettingsRes] =
      await Promise.allSettled([
        productService.getFeaturedProducts(8),
        productService.getBestSellerProducts(8),
        productService.getFlashSaleProducts(6),
        productService.getNewArrivalProducts(8),
        prisma.category.findMany({
          where: {
            productCategories: {
              some: {
                product: { isPublished: true },
              },
            },
          },
          take: 8,
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: { productCategories: true },
            },
            productCategories: {
              where: {
                product: { isPublished: true },
              },
              take: 1,
              orderBy: { createdAt: 'desc' },
              include: {
                product: {
                  include: {
                    images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                  },
                },
              },
            },
          },
        }),
        storeSettingsService.getPublicStoreSettings(),
      ])

    const featured = featuredRes.status === 'fulfilled' ? featuredRes.value : []
    const bestSellers = bestSellersRes.status === 'fulfilled' ? bestSellersRes.value : []
    const flashSale = flashSaleRes.status === 'fulfilled' ? flashSaleRes.value : []
    const newArrivals = newArrivalsRes.status === 'fulfilled' ? newArrivalsRes.value : []
    const categories = categoriesRes.status === 'fulfilled' ? categoriesRes.value : []
    const publicSettings = publicSettingsRes.status === 'fulfilled' ? publicSettingsRes.value : null

    const currencyCode = publicSettings?.currencyCode || 'NGN'

    return {
      currencyCode,
      featured: featured.map((p) => mapPrismaProductToStorefront(p, currencyCode)),
      bestSellers: bestSellers.map((p) => mapPrismaProductToStorefront(p, currencyCode)),
      flashSale: flashSale.map((p) => mapPrismaProductToStorefront(p, currencyCode)),
      newArrivals: newArrivals.map((p) => mapPrismaProductToStorefront(p, currencyCode)),
      categories: categories
        .map((cat) => {
          const latestProduct = cat.productCategories[0]?.product
          const latestImg = latestProduct?.images[0]?.url || null

          return {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            image: cat.image || null,
            productCount: cat._count?.productCategories || 0,
            recentProduct: latestProduct
              ? {
                  id: latestProduct.id,
                  name: latestProduct.name,
                  slug: latestProduct.slug,
                  image: latestImg,
                  price: Number(latestProduct.basePrice),
                }
              : null,
          }
        })
        .filter((cat) => cat.productCount > 0),
    }
  }

  /**
   * Idempotent seeder: Seeds default homepage sections if table is empty
   */
  async seedDefaultSections() {
    if (this.isSeeded) return

    const count = await prisma.homepageSection.count()
    if (count > 0) {
      this.isSeeded = true
      return
    }

    const defaultSections = storeConfig.homepageSections || []

    await prisma.$transaction(
      defaultSections.map((sec, idx) =>
        prisma.homepageSection.create({
          data: {
            type: sec.type,
            enabled: sec.enabled ?? true,
            order: idx + 1,
            title: sec.title || null,
            subtitle: sec.subtitle || null,
            theme: sec.theme || 'light',
            config: (sec.config as Prisma.InputJsonValue) ?? {},
          },
        }),
      ),
    )

    this.isSeeded = true
  }

  async getHomepageSections(): Promise<AnySectionConfig[]> {
    await this.seedDefaultSections()

    const sections = await prisma.homepageSection.findMany({
      orderBy: { order: 'asc' },
    })

    return sections.map((sec) => ({
      id: sec.id,
      type: sec.type as AnySectionConfig['type'],
      enabled: sec.enabled,
      order: sec.order,
      title: sec.title || undefined,
      subtitle: sec.subtitle || undefined,
      theme: (sec.theme as SectionTheme) || 'light',
      config: (sec.config as Record<string, unknown>) || {},
    })) as AnySectionConfig[]
  }

  async getEnabledHomepageSections(): Promise<AnySectionConfig[]> {
    await this.seedDefaultSections()

    const sections = await prisma.homepageSection.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' },
    })

    return sections.map((sec) => ({
      id: sec.id,
      type: sec.type as AnySectionConfig['type'],
      enabled: sec.enabled,
      order: sec.order,
      title: sec.title || undefined,
      subtitle: sec.subtitle || undefined,
      theme: (sec.theme as SectionTheme) || 'light',
      config: (sec.config as Record<string, unknown>) || {},
    })) as AnySectionConfig[]
  }

  async updateHomepageSection(id: string, input: UpdateSectionInput): Promise<AnySectionConfig> {
    const existing = await prisma.homepageSection.findUnique({ where: { id } })
    if (!existing) {
      throw new Error('Homepage section not found.')
    }

    const updated = await prisma.homepageSection.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title?.trim() || null } : {}),
        ...(input.subtitle !== undefined ? { subtitle: input.subtitle?.trim() || null } : {}),
        ...(input.theme !== undefined ? { theme: input.theme } : {}),
        ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
        ...(input.config !== undefined ? { config: (input.config as Prisma.InputJsonValue) ?? {} } : {}),
      },
    })

    return {
      id: updated.id,
      type: updated.type as AnySectionConfig['type'],
      enabled: updated.enabled,
      order: updated.order,
      title: updated.title || undefined,
      subtitle: updated.subtitle || undefined,
      theme: (updated.theme as SectionTheme) || 'light',
      config: (updated.config as Record<string, unknown>) || {},
    } as AnySectionConfig
  }

  async reorderHomepageSections(orderedIds: string[]): Promise<void> {
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      throw new Error('Ordered section IDs list is required.')
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.homepageSection.update({
          where: { id },
          data: { order: index + 1 },
        }),
      ),
    )
  }

  async createHomepageSection(input: CreateSectionInput): Promise<AnySectionConfig> {
    if (!input.type || typeof input.type !== 'string') {
      throw new Error('Section type is required.')
    }

    const maxOrderAgg = await prisma.homepageSection.aggregate({
      _max: { order: true },
    })
    const nextOrder = (maxOrderAgg._max.order || 0) + 1

    const created = await prisma.homepageSection.create({
      data: {
        type: input.type,
        enabled: input.enabled ?? true,
        order: nextOrder,
        title: input.title?.trim() || null,
        subtitle: input.subtitle?.trim() || null,
        theme: input.theme || 'light',
        config: input.config ? (input.config as Prisma.InputJsonValue) : {},
      },
    })

    return {
      id: created.id,
      type: created.type as AnySectionConfig['type'],
      enabled: created.enabled,
      order: created.order,
      title: created.title || undefined,
      subtitle: created.subtitle || undefined,
      theme: (created.theme as SectionTheme) || 'light',
      config: (created.config as Record<string, unknown>) || {},
    } as AnySectionConfig
  }

  async deleteHomepageSection(id: string): Promise<void> {
    const existing = await prisma.homepageSection.findUnique({ where: { id } })
    if (!existing) {
      throw new Error('Homepage section not found.')
    }

    await prisma.homepageSection.delete({ where: { id } })
  }
}

export const homepageService = new HomepageService()
