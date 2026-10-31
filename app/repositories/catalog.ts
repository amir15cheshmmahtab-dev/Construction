import { catalogProducts } from '../data/catalog.ts'
import type { CatalogProduct } from '../types/catalog.ts'

export interface CatalogRepository {
  getProducts(): CatalogProduct[]
  getProductBySlug(slug: string): CatalogProduct | undefined
}

/** Local, synchronous SSR adapter; replace the boundary when a real API exists. */
export const catalogRepository: CatalogRepository = {
  getProducts() {
    return structuredClone(catalogProducts)
  },
  getProductBySlug(slug) {
    const product = catalogProducts.find((entry) => entry.slug === slug)
    return product ? structuredClone(product) : undefined
  },
}
