import {
  catalogCategories,
  getCatalogBrands,
  getCatalogSpecificationFilters,
} from '../data/catalog-filters.ts'
import type {
  CatalogFilters,
  CatalogPage,
  CatalogProduct,
  CatalogQuery,
  CatalogSort,
  CatalogState,
} from '../types/catalog.ts'
import type { ProductAvailability } from '../types/marketplace.ts'

export const DEFAULT_CATALOG_PAGE_SIZE = 12
export const CATALOG_PAGE_SIZES = [12, 24, 48] as const
export const CATALOG_SORTS: CatalogSort[] = [
  'recommended',
  'newest',
  'price-asc',
  'price-desc',
  'name',
]
const MAX_PRICE_TOMAN = 1_000_000_000_000
const MAX_QUERY_PAGE = 10_000
const persianCollator = new Intl.Collator('fa', { numeric: true, sensitivity: 'base' })

export function createEmptyCatalogFilters(): CatalogFilters {
  return {
    category: null,
    subcategory: null,
    minPriceToman: null,
    maxPriceToman: null,
    brands: [],
    availability: [],
    specifications: {},
  }
}

export function cloneCatalogFilters(filters: CatalogFilters): CatalogFilters {
  return {
    ...filters,
    brands: [...filters.brands],
    availability: [...filters.availability],
    specifications: Object.fromEntries(
      Object.entries(filters.specifications).map(([key, values]) => [key, [...values]]),
    ),
  }
}

export function createDefaultCatalogState(): CatalogState {
  return {
    filters: createEmptyCatalogFilters(),
    search: '',
    sort: 'recommended',
    page: 1,
    pageSize: DEFAULT_CATALOG_PAGE_SIZE,
  }
}

/** Shared normalization for Persian/Arabic typing, searchable codes, and numeric input. */
export function normalizeCatalogText(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u064b-\u065f\u0670]/g, '')
    .replace(/[\u200c\u200d]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('fa')
}

/** Integer toman amounts only. Reject signs, currency text, decimals and exponent syntax. */
export function parseCatalogNumber(value: unknown): number | null {
  if (typeof value === 'number')
    return Number.isSafeInteger(value) && value >= 0 && value <= MAX_PRICE_TOMAN ? value : null
  if (typeof value !== 'string') return null
  const normalized = normalizeCatalogText(value).replace(/[٬،,\s]/g, '')
  if (!/^\d{1,13}$/.test(normalized)) return null
  const parsed = Number(normalized)
  return Number.isSafeInteger(parsed) && parsed <= MAX_PRICE_TOMAN ? parsed : null
}

function boundedInteger(value: unknown, fallback: number, maximum: number): number {
  const parsed = parseCatalogNumber(value)
  return parsed !== null && parsed > 0 ? Math.min(parsed, maximum) : fallback
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort(persianCollator.compare)
}

/** Validate only known taxonomy/brands/spec values; retain reversed price ranges for UI feedback. */
export function normalizeCatalogState(input: Partial<CatalogState> = {}): CatalogState {
  const defaults = createDefaultCatalogState()
  const incoming = input.filters ?? defaults.filters
  const alias = incoming.category === 'tiles' ? { category: 'stone', subcategory: 'ceramic' } : null
  const selectedCategory = alias?.category ?? incoming.category
  const category = catalogCategories.find((entry) => entry.id === selectedCategory) ?? null
  const selectedSubcategory = incoming.subcategory ?? alias?.subcategory
  const subcategory =
    category?.subcategories.find((entry) => entry.id === selectedSubcategory)?.id ?? null
  const filters: CatalogFilters = {
    category: category?.id ?? null,
    subcategory,
    minPriceToman: parseCatalogNumber(incoming.minPriceToman),
    maxPriceToman: parseCatalogNumber(incoming.maxPriceToman),
    brands: uniqueSorted(
      (incoming.brands ?? []).filter((brand) => getCatalogBrands().includes(brand)),
    ),
    availability: uniqueSorted(
      (incoming.availability ?? []).filter((value) =>
        ['available', 'unavailable', 'unknown'].includes(value),
      ),
    ) as ProductAvailability[],
    specifications: {},
  }
  for (const config of getCatalogSpecificationFilters(filters)) {
    const selected = uniqueSorted(
      (incoming.specifications?.[config.key] ?? []).filter((value) =>
        config.options.includes(value),
      ),
    )
    if (selected.length) filters.specifications[config.key] = selected
  }
  const pageSize =
    CATALOG_PAGE_SIZES.find(
      (size) => size === boundedInteger(input.pageSize, DEFAULT_CATALOG_PAGE_SIZE, 48),
    ) ?? DEFAULT_CATALOG_PAGE_SIZE
  return {
    filters,
    search: typeof input.search === 'string' ? input.search.trim().slice(0, 140) : '',
    sort: CATALOG_SORTS.includes(input.sort as CatalogSort) ? input.sort! : defaults.sort,
    page: boundedInteger(input.page, 1, MAX_QUERY_PAGE),
    pageSize,
  }
}

export function filterCatalogProducts(
  products: readonly CatalogProduct[],
  filters: CatalogFilters,
  search = '',
): CatalogProduct[] {
  const words = normalizeCatalogText(search).split(' ').filter(Boolean)
  return products.filter((product) => {
    if (filters.category && product.categoryId !== filters.category) return false
    if (filters.subcategory && product.subcategoryId !== filters.subcategory) return false
    if (filters.brands.length && (!product.brand || !filters.brands.includes(product.brand)))
      return false
    if (filters.availability.length && !filters.availability.includes(product.availability))
      return false
    if (filters.minPriceToman !== null || filters.maxPriceToman !== null) {
      if (product.priceRial === null) return false
      if (filters.minPriceToman !== null && product.priceRial < filters.minPriceToman * 10)
        return false
      if (filters.maxPriceToman !== null && product.priceRial > filters.maxPriceToman * 10)
        return false
    }
    for (const [key, values] of Object.entries(filters.specifications)) {
      if (values.length && !values.includes(product.specifications[key] ?? '')) return false
    }
    if (!words.length) return true
    const category = catalogCategories.find((entry) => entry.id === product.categoryId)
    const subcategory = category?.subcategories.find((entry) => entry.id === product.subcategoryId)
    const haystack = normalizeCatalogText(
      [
        product.name,
        product.description,
        product.brand,
        product.code,
        product.slug,
        category?.name,
        product.categoryId,
        subcategory?.name,
        product.subcategoryId,
        ...Object.values(product.specifications),
      ]
        .filter(Boolean)
        .join(' '),
    )
    return words.every((word) => haystack.includes(word))
  })
}

/** All sorts are stable, leave fixtures untouched, and keep unpriced items last in both directions. */
export function sortCatalogProducts(
  products: readonly CatalogProduct[],
  sort: CatalogSort,
): CatalogProduct[] {
  return products
    .map((product, index) => ({ product, index }))
    .sort((left, right) => {
      let comparison = 0
      if (sort === 'price-asc' || sort === 'price-desc') {
        if (left.product.priceRial === null && right.product.priceRial !== null) return 1
        if (right.product.priceRial === null && left.product.priceRial !== null) return -1
        comparison =
          left.product.priceRial === null || right.product.priceRial === null
            ? 0
            : (left.product.priceRial - right.product.priceRial) * (sort === 'price-asc' ? 1 : -1)
      } else if (sort === 'newest')
        comparison = Date.parse(right.product.createdAt) - Date.parse(left.product.createdAt)
      else if (sort === 'name')
        comparison = persianCollator.compare(left.product.name, right.product.name)
      return comparison || left.index - right.index
    })
    .map(({ product }) => product)
}

export function paginateCatalogProducts<T>(
  products: readonly T[],
  requestedPage = 1,
  requestedPageSize = DEFAULT_CATALOG_PAGE_SIZE,
): CatalogPage<T> {
  const pageSize = boundedInteger(requestedPageSize, DEFAULT_CATALOG_PAGE_SIZE, 48)
  const total = products.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(boundedInteger(requestedPage, 1, MAX_QUERY_PAGE), totalPages)
  return {
    items: products.slice((page - 1) * pageSize, page * pageSize),
    total,
    totalPages,
    page,
    pageSize,
  }
}

export function getCatalogResults(
  products: readonly CatalogProduct[],
  state: CatalogState,
): CatalogPage<CatalogProduct> {
  return paginateCatalogProducts(
    sortCatalogProducts(filterCatalogProducts(products, state.filters, state.search), state.sort),
    state.page,
    state.pageSize,
  )
}

function firstQueryValue(value: CatalogQuery[string]): string | undefined {
  return Array.isArray(value)
    ? value.find((entry): entry is string => typeof entry === 'string')
    : (value ?? undefined)
}

function queryValues(value: CatalogQuery[string]): string[] {
  const values = Array.isArray(value) ? value : [value]
  return values
    .flatMap((entry) =>
      typeof entry === 'string'
        ? entry
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean)
        : [],
    )
    .slice(0, 50)
}

/** Router queries are parsed afresh on each navigation, including browser back/forward. */
export function parseCatalogQuery(query: CatalogQuery): CatalogState {
  const specifications: Record<string, string[]> = {}
  for (const [key, value] of Object.entries(query)) {
    if (/^spec\.[a-zA-Z][a-zA-Z0-9]{0,30}$/.test(key))
      specifications[key.slice(5)] = queryValues(value)
  }
  return normalizeCatalogState({
    filters: {
      category: firstQueryValue(query.category) ?? null,
      subcategory: firstQueryValue(query.subcategory) ?? null,
      minPriceToman: parseCatalogNumber(firstQueryValue(query.min)),
      maxPriceToman: parseCatalogNumber(firstQueryValue(query.max)),
      brands: queryValues(query.brands),
      availability: queryValues(query.availability) as ProductAvailability[],
      specifications,
    },
    search: firstQueryValue(query.search) ?? '',
    sort: firstQueryValue(query.sort) as CatalogSort,
    page: boundedInteger(firstQueryValue(query.page), 1, MAX_QUERY_PAGE),
    pageSize: boundedInteger(firstQueryValue(query.pageSize), DEFAULT_CATALOG_PAGE_SIZE, 48),
  })
}

/** A fresh canonical query (no merging) avoids duplicate arrays and growing URL state. */
export function serializeCatalogQuery(input: CatalogState): Record<string, string> {
  const state = normalizeCatalogState(input)
  const { filters } = state
  const query: Record<string, string> = {}
  if (filters.category) query.category = filters.category
  if (filters.subcategory) query.subcategory = filters.subcategory
  if (state.search) query.search = state.search
  if (state.sort !== 'recommended') query.sort = state.sort
  if (filters.minPriceToman !== null) query.min = String(filters.minPriceToman)
  if (filters.maxPriceToman !== null) query.max = String(filters.maxPriceToman)
  if (filters.brands.length) query.brands = filters.brands.join(',')
  if (filters.availability.length) query.availability = filters.availability.join(',')
  for (const key of Object.keys(filters.specifications).sort())
    query[`spec.${key}`] = filters.specifications[key]!.join(',')
  if (state.page !== 1) query.page = String(state.page)
  if (state.pageSize !== DEFAULT_CATALOG_PAGE_SIZE) query.pageSize = String(state.pageSize)
  return query
}

export function countCatalogFilters(filters: CatalogFilters): number {
  return (
    Number(Boolean(filters.category)) +
    Number(Boolean(filters.subcategory)) +
    Number(filters.minPriceToman !== null || filters.maxPriceToman !== null) +
    filters.brands.length +
    filters.availability.length +
    Object.values(filters.specifications).reduce((count, values) => count + values.length, 0)
  )
}
