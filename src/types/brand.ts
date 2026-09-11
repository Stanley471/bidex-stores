export interface BrandListItem {
  id: string
  name: string
  slug: string
  logo?: string | null
  website?: string | null
  description?: string | null
  createdAt: string
  updatedAt: string
  _count: {
    products: number
  }
}

export interface BrandFormValues {
  name: string
  slug?: string
  logo?: string
  website?: string
  description?: string
}
