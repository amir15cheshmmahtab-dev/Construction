import { catalogProducts } from '../data/catalog.ts'
import type { CatalogProduct } from '../types/catalog.ts'

export interface CatalogRepository {
  getProducts(): CatalogProduct[]
}

/** Local, synchronous SSR adapter; replace the boundary when a real API exists. */
export const catalogRepository: CatalogRepository = {
  getProducts() {
    return structuredClone(catalogProducts)
  },
}
