'use client'

import { useEffect, useState } from 'react'
import type { Product } from '@/types/product'

export interface HomepageCategoryItem {
  id: string
  name: string
  slug: string
  image?: string | null
  productCount?: number
  recentProduct?: {
    id: string
    name: string
    slug: string
    image?: string | null
    price?: number
  } | null
}

export interface HomepageData {
  currencyCode: string
  featured: Product[]
  bestSellers: Product[]
  flashSale: Product[]
  newArrivals: Product[]
  categories: HomepageCategoryItem[]
}

let cachedData: HomepageData | null = null
let fetchPromise: Promise<HomepageData | null> | null = null

export function useHomepageData() {
  const [data, setData] = useState<HomepageData | null>(() => cachedData)
  const [loading, setLoading] = useState<boolean>(() => !cachedData)

  useEffect(() => {
    let ignore = false

    if (cachedData) {
      return
    }

    if (!fetchPromise) {
      fetchPromise = fetch('/api/homepage/data')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            cachedData = json.data
            return json.data
          }
          return null
        })
        .catch(() => null)
    }

    fetchPromise.then((result) => {
      if (!ignore) {
        if (result) {
          setData(result)
        }
        setLoading(false)
      }
    })

    return () => {
      ignore = true
    }
  }, [])

  return { data, loading }
}
