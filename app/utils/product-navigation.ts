import type { Product } from '../types/marketplace.ts'
import { catalogProducts } from '../data/catalog.ts'
import { parseCatalogQuery, serializeCatalogQuery } from './catalog.ts'
import { getProductDetail } from './product-detail.ts'

/** Explicit legacy showcase mapping; homepage fixtures retain their original content. */
const showcaseSlugs: Record<string, string> = {
  'portland-cement-type-2': 'cement-type2-50',
  'red-facing-brick': 'brick-red-facing',
  'ribbed-rebar-a3': 'rebar-16',
  'modern-basin-faucet': 'faucet-bronze-basin',
  'travertine-ceramic-tiles': 'ceramic-travertine-60',
}

export function getCanonicalCardProduct(product: Pick<Product, 'id' | 'slug'>) {
  const slug = showcaseSlugs[product.slug] ?? product.slug
  return catalogProducts.find((candidate) => candidate.slug === slug)
}

/** Only a canonical local listing URL may be used as a detail page's return link. */
export function getCatalogReturnPath(value: unknown): string {
  if (typeof value !== 'string' || value.length > 4096) return '/products'
  if (value !== '/products' && !value.startsWith('/products?')) return '/products'
  const url = new URL(value, 'https://sivan.invalid')
  if (url.origin !== 'https://sivan.invalid' || url.pathname !== '/products') return '/products'
  const query = serializeCatalogQuery(parseCatalogQuery(Object.fromEntries(url.searchParams)))
  const encoded = new URLSearchParams(query).toString()
  return `/products${encoded ? `?${encoded}` : ''}`
}

/** Keep the purchase controls in view when switching an explicit SKU option. */
export function shouldResetProductScroll(toSlug: unknown, fromSlug: unknown): boolean {
  const from = catalogProducts.find((product) => product.slug === fromSlug)
  const to = catalogProducts.find((product) => product.slug === toSlug)
  if (!from || !to) return true
  return !getProductDetail(from).variants?.options.some((option) => option.productId === to.id)
}
