import type { Category } from '@/generated/prisma/client'
import type { CategoryInput } from '@/lib/category/validation'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export interface CategoryWithDetails extends Category {
  parent?: Category | null
  children?: Category[]
  _count?: {
    productCategories: number
    children: number
  }
}

export interface CategoryListOptions {
  search?: string
  parentId?: string | null
}

class CategoryService {
  async createCategory(input: CategoryInput): Promise<Category> {
    const name = input.name.trim()
    if (!name) {
      throw new Error('Category name is required.')
    }

    const slug = slugify(input.slug?.trim() || name)
    if (!slug) {
      throw new Error('Category slug is required.')
    }

    const existingSlug = await prisma.category.findUnique({
      where: { slug },
    })

    if (existingSlug) {
      throw new Error('A category with this slug already exists.')
    }

    const parentId = input.parentId?.trim() || null
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      })
      if (!parent) {
        throw new Error('Parent category not found.')
      }
    }

    return prisma.category.create({
      data: {
        name,
        slug,
        description: input.description?.trim() || null,
        image: input.image?.trim() || null,
        parentId,
      },
    })
  }

  async getCategories(options: CategoryListOptions = {}): Promise<CategoryWithDetails[]> {
    const where: Record<string, unknown> = {}

    if (options.search?.trim()) {
      where.OR = [
        { name: { contains: options.search.trim(), mode: 'insensitive' as const } },
        { slug: { contains: options.search.trim(), mode: 'insensitive' as const } },
      ]
    }

    if (options.parentId !== undefined) {
      where.parentId = options.parentId
    }

    return prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            productCategories: true,
            children: true,
          },
        },
      },
    })
  }

  async getCategory(id: string): Promise<CategoryWithDetails> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            productCategories: true,
            children: true,
          },
        },
      },
    })

    if (!category) {
      throw new Error('Category not found.')
    }

    return category
  }

  async updateCategory(id: string, input: CategoryInput): Promise<Category> {
    const existing = await prisma.category.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new Error('Category not found.')
    }

    const name = input.name.trim()
    if (!name) {
      throw new Error('Category name is required.')
    }

    const slug = slugify(input.slug?.trim() || name)
    if (!slug) {
      throw new Error('Category slug is required.')
    }

    const duplicateSlug = await prisma.category.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { slug },
        ],
      },
    })

    if (duplicateSlug) {
      throw new Error('A category with this slug already exists.')
    }

    const parentId = input.parentId?.trim() || null

    if (parentId) {
      if (parentId === id) {
        throw new Error('A category cannot be its own parent.')
      }

      // Check circular reference
      let currentParentId: string | null = parentId
      while (currentParentId) {
        if (currentParentId === id) {
          throw new Error('Cannot assign a descendant category as a parent (circular reference).')
        }
        const parentCat: { parentId: string | null } | null = await prisma.category.findUnique({
          where: { id: currentParentId },
          select: { parentId: true },
        })
        currentParentId = parentCat?.parentId || null
      }
    }

    return prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: input.description?.trim() || null,
        image: input.image?.trim() || null,
        parentId,
      },
    })
  }

  async deleteCategory(id: string): Promise<Category> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            productCategories: true,
            children: true,
          },
        },
      },
    })

    if (!category) {
      throw new Error('Category not found.')
    }

    if (category._count.children > 0) {
      throw new Error('Cannot delete category with subcategories.')
    }

    if (category._count.productCategories > 0) {
      throw new Error('Cannot delete category with associated products.')
    }

    return prisma.category.delete({
      where: { id },
    })
  }
}

export const categoryService = new CategoryService()
