import type { Product, ProductAvailability } from './marketplace.ts'

export interface CatalogProduct extends Product {
  subcategoryId: string
  brand: string | null
  imageAlt: string
  description: string
  specifications: Record<string, string>
  code: string
  createdAt: string
}

export interface CatalogCategory {
  id: string
  name: string
  image: string
  subcategories: { id: string; name: string }[]
}

export interface CatalogSpecificationFilter {
  key: string
  label: string
  options: string[]
}

export interface CatalogFilters {
  category: string | null
  subcategory: string | null
  minPriceToman: number | null
  maxPriceToman: number | null
  brands: string[]
  availability: ProductAvailability[]
  specifications: Record<string, string[]>
}

export type CatalogSort = 'recommended' | 'newest' | 'price-asc' | 'price-desc' | 'name'

export interface CatalogState {
  filters: CatalogFilters
  search: string
  sort: CatalogSort
  page: number
  pageSize: number
}

export interface CatalogPage<T> {
  items: T[]
  total: number
  totalPages: number
  page: number
  pageSize: number
}

export type CatalogQuery = Record<string, string | (string | null)[] | null | undefined>
