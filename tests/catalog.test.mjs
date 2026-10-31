import assert from 'node:assert/strict'
import test from 'node:test'
import { catalogProducts } from '../app/data/catalog.ts'
import { products as homepageProducts } from '../app/data/products.ts'
import { categories as homepageCategories } from '../app/data/categories.ts'
import {
  catalogCategories,
  getCatalogBrands,
  getSpecificationFilters,
} from '../app/data/catalog-filters.ts'
import { catalogRepository } from '../app/repositories/catalog.ts'
import {
  cloneCatalogFilters,
  createDefaultCatalogState,
  createEmptyCatalogFilters,
  filterCatalogProducts,
  getCatalogResults,
  normalizeCatalogState,
  normalizeCatalogText,
  paginateCatalogProducts,
  parseCatalogNumber,
  parseCatalogQuery,
  serializeCatalogQuery,
  sortCatalogProducts,
} from '../app/utils/catalog.ts'

test('the existing homepage fixtures remain separate and retain their five original products', () => {
  assert.deepEqual(
    homepageProducts.map(({ id }) => id),
    ['cement-02', 'brick-red', 'rebar-a3', 'faucet-bronze', 'tiles-travertine'],
  )
  assert.equal(homepageCategories.length, 7)
  assert.ok(
    homepageProducts.every(({ id }) => !catalogProducts.some((product) => product.id === id)),
  )
  assert.equal(homepageProducts[0].priceRial, 2140000)
  assert.ok(homepageProducts.every(({ availability }) => availability === 'unknown'))
})

test('48 deterministic, unique, typed mock products cover all seven categories', () => {
  assert.equal(catalogProducts.length, 48)
  assert.equal(new Set(catalogProducts.map(({ id }) => id)).size, 48)
  assert.equal(new Set(catalogProducts.map(({ slug }) => slug)).size, 48)
  assert.deepEqual(
    new Set(catalogProducts.map(({ categoryId }) => categoryId)),
    new Set(catalogCategories.map(({ id }) => id)),
  )
  for (const product of catalogProducts) {
    assert.ok(product.priceRial === null || Number.isSafeInteger(product.priceRial))
    assert.ok(product.image.startsWith('/images/'))
    assert.ok(product.imageAlt && product.spec && product.code)
    assert.ok(Number.isFinite(Date.parse(product.createdAt)))
    const category = catalogCategories.find(({ id }) => id === product.categoryId)
    assert.ok(category.subcategories.some(({ id }) => id === product.subcategoryId))
  }
})

test('normalizes Persian/Arabic letters, joiners, diacritics, and both digit sets', () => {
  assert.equal(normalizeCatalogText('  كاشيِ ۱۲۳ و ميلگرد ٤٥٦  '), 'کاشی 123 و میلگرد 456')
  assert.equal(normalizeCatalogText('برس‌خورده'), 'برس خورده')
})

test('numeric parsing accepts formatted integer toman input, rejects executable or malformed input', () => {
  for (const value of ['۱٬۲۳۴٬۵۶۷', '١,٢٣٤,٥٦٧', '١،٢٣٤،٥٦٧', '1 234 567', 1234567])
    assert.equal(parseCatalogNumber(value), 1234567)
  assert.equal(parseCatalogNumber('۰'), 0)
  assert.equal(parseCatalogNumber('۱۰۰۰۰۰۰۰۰۰۰۰۰'), 1_000_000_000_000)
  for (const value of [
    '',
    null,
    undefined,
    '-20',
    '1.5',
    '1e8',
    '۲ تومان',
    '1;alert(1)',
    '12foo',
    Infinity,
    NaN,
    1_000_000_000_001,
  ])
    assert.equal(parseCatalogNumber(value), null)
})

test('search covers normalized names, category names, specification values and product codes', () => {
  const filters = createEmptyCatalogFilters()
  assert.ok(
    filterCatalogProducts(catalogProducts, filters, 'ميلگرد ١٦').some(
      ({ id }) => id === 'catalog-rebar-16',
    ),
  )
  assert.equal(filterCatalogProducts(catalogProducts, filters, 'GSB 18V-50')[0].brand, 'بوش')
  assert.equal(filterCatalogProducts(catalogProducts, filters, 'cement').length, 8)
  assert.equal(filterCatalogProducts(catalogProducts, filters, '۲۱۱۳')[0].brand, 'رونیکس')
  assert.ok(filterCatalogProducts(catalogProducts, filters, 'سنگ و سرامیک').length >= 8)
  assert.equal(filterCatalogProducts(catalogProducts, filters, 'کاملاً نامرتبط').length, 0)
})

test('all filter families and search combine using AND, multi-values within a group use OR', () => {
  const state = parseCatalogQuery({
    category: 'tools',
    subcategory: 'power-tools',
    brands: 'رونیکس,بوش',
    availability: 'unavailable',
    min: '۴٬۰۰۰٬۰۰۰',
    max: '۴٬۳۰۰٬۰۰۰',
    'spec.powerSource': 'برق شهری',
    search: '۲۱۱۳',
  })
  const result = getCatalogResults(catalogProducts, state)
  assert.deepEqual(
    result.items.map(({ id }) => id),
    ['catalog-drill-ronix-2113'],
  )
})

test('price filters compare toman bounds against canonical rials, inclusively, and exclude unknown prices', () => {
  const filters = { ...createEmptyCatalogFilters(), minPriceToman: 214000, maxPriceToman: 214000 }
  assert.deepEqual(
    filterCatalogProducts(catalogProducts, filters).map(({ id }) => id),
    ['catalog-cement-type2-50'],
  )
  filters.minPriceToman = 0
  filters.maxPriceToman = 1_000_000_000_000
  assert.ok(
    filterCatalogProducts(catalogProducts, filters).every(({ priceRial }) => priceRial !== null),
  )
})

test('reversed price ranges are retained for UI feedback and produce zero results, never silently swapped', () => {
  const state = parseCatalogQuery({ min: '1000', max: '10' })
  assert.equal(state.filters.minPriceToman, 1000)
  assert.equal(state.filters.maxPriceToman, 10)
  assert.equal(getCatalogResults(catalogProducts, state).total, 0)
})

test('availability distinguishes unknown demo stock from available and unavailable', () => {
  for (const availability of ['available', 'unavailable', 'unknown']) {
    const products = filterCatalogProducts(catalogProducts, {
      ...createEmptyCatalogFilters(),
      availability: [availability],
    })
    assert.ok(products.length > 0)
    assert.ok(products.every((product) => product.availability === availability))
  }
})

test('technical filter options come only from actual category/subcategory fixture values', () => {
  assert.deepEqual(getSpecificationFilters(null, null), [])
  const cement = getSpecificationFilters('cement', 'cement')
  assert.ok(cement.some(({ key }) => key === 'packageWeight'))
  assert.ok(!cement.some(({ key }) => key === 'diameter'))
  const rebar = getSpecificationFilters('rebar', 'rebar')
  assert.ok(rebar.some(({ key }) => key === 'diameter'))
  assert.ok(!rebar.some(({ key }) => key === 'grade'))
  assert.ok(!rebar.some(({ key }) => key === 'powerSource'))
  assert.deepEqual(getCatalogBrands({ category: 'cement', subcategory: null }), [])
  assert.equal(getCatalogBrands({ category: 'tools', subcategory: null }).length, 3)
})

test('price sorts are stable and keep null prices last in BOTH directions', () => {
  const input = [
    { ...catalogProducts[0], id: 'first', priceRial: 100 },
    { ...catalogProducts[0], id: 'second', priceRial: 100 },
    { ...catalogProducts[0], id: 'unknown', priceRial: null },
    { ...catalogProducts[0], id: 'high', priceRial: 200 },
  ]
  assert.deepEqual(
    sortCatalogProducts(input, 'price-asc').map(({ id }) => id),
    ['first', 'second', 'high', 'unknown'],
  )
  assert.deepEqual(
    sortCatalogProducts(input, 'price-desc').map(({ id }) => id),
    ['high', 'first', 'second', 'unknown'],
  )
  assert.deepEqual(
    input.map(({ id }) => id),
    ['first', 'second', 'unknown', 'high'],
  )
})

test('recommended, newest, and Persian name sorting work without mutating fixtures', () => {
  assert.deepEqual(sortCatalogProducts(catalogProducts, 'recommended'), catalogProducts)
  const newest = sortCatalogProducts(catalogProducts, 'newest')
  assert.ok(
    newest.every(
      (product, index) => index === 0 || product.createdAt <= newest[index - 1].createdAt,
    ),
  )
  const names = [
    { ...catalogProducts[0], name: 'ب' },
    { ...catalogProducts[0], name: 'آ' },
  ]
  assert.equal(sortCatalogProducts(names, 'name')[0].name, 'آ')
})

test('pagination returns real slices, clamps after filtering, and safely handles empty data', () => {
  const page = paginateCatalogProducts(catalogProducts, 2, 12)
  assert.equal(page.total, 48)
  assert.equal(page.totalPages, 4)
  assert.deepEqual(page.items, catalogProducts.slice(12, 24))
  assert.equal(paginateCatalogProducts(catalogProducts.slice(0, 2), 99999, 12).page, 1)
  assert.deepEqual(paginateCatalogProducts([], -4, 0), {
    items: [],
    total: 0,
    totalPages: 1,
    page: 1,
    pageSize: 12,
  })
  assert.equal(paginateCatalogProducts(catalogProducts, Infinity, 99999).pageSize, 48)
})

test('URL aliases work and invalid query state is bounded and validated', () => {
  assert.equal(parseCatalogQuery({ category: 'rebar' }).filters.category, 'rebar')
  const tiles = parseCatalogQuery({ category: 'tiles', sort: 'price-asc' })
  assert.equal(tiles.filters.category, 'stone')
  assert.equal(tiles.filters.subcategory, 'ceramic')
  assert.equal(tiles.sort, 'price-asc')
  const invalid = parseCatalogQuery({
    category: 'missing',
    subcategory: 'rebar',
    sort: 'unsafe',
    brands: 'invented',
    availability: 'invented',
    min: '-1',
    page: '99999999',
    pageSize: '999999',
    'spec.certification': 'fake',
    search: 'x'.repeat(1000),
  })
  assert.deepEqual(invalid.filters, createEmptyCatalogFilters())
  assert.equal(invalid.sort, 'recommended')
  assert.equal(invalid.page, 10000)
  assert.equal(invalid.pageSize, 48)
  assert.equal(invalid.search.length, 140)
})

test('a URL roundtrip is canonical, deduplicated, and does not grow on repeated navigation', () => {
  const state = parseCatalogQuery({
    category: ['tools', 'tools'],
    brands: ['رونیکس,بوش', 'رونیکس'],
    availability: ['available', 'available,unavailable'],
    'spec.powerSource': ['شارژی', 'شارژی,برق شهری'],
    search: '  دریل  ',
    page: '۲',
    pageSize: '24',
    unknown: 'ignored',
  })
  const first = serializeCatalogQuery(state)
  assert.equal(first.brands, 'بوش,رونیکس')
  assert.ok(!('unknown' in first))
  assert.deepEqual(parseCatalogQuery(first), state)
  for (let index = 0; index < 20; index++)
    assert.deepEqual(serializeCatalogQuery(parseCatalogQuery(first)), first)
  assert.deepEqual(serializeCatalogQuery(createDefaultCatalogState()), {})
})

test('fresh URL parsing restores earlier applied filters without carrying later page state', () => {
  const previous = { category: 'stone', 'spec.finish': 'مات', sort: 'price-desc', page: '2' }
  const oldState = parseCatalogQuery(previous)
  const newerState = parseCatalogQuery({ category: 'tools', search: 'رونیکس' })
  assert.equal(newerState.page, 1)
  assert.deepEqual(parseCatalogQuery(previous), oldState)
  assert.equal(oldState.filters.specifications.finish[0], 'مات')
})

test('irrelevant technical filters are removed when category context changes', () => {
  const state = normalizeCatalogState({
    filters: {
      ...createEmptyCatalogFilters(),
      category: 'cement',
      subcategory: 'cement',
      specifications: { diameter: ['۱۶ میلی‌متر'], cementType: ['پرتلند تیپ ۲'] },
    },
  })
  assert.deepEqual(state.filters.specifications, { cementType: ['پرتلند تیپ ۲'] })
  assert.equal(getCatalogResults(catalogProducts, state).total, 1)
})

test('filter drafts and repository results cannot mutate applied state or exported fixtures', () => {
  const state = parseCatalogQuery({ category: 'tools', brands: 'بوش', 'spec.powerSource': 'شارژی' })
  const draft = cloneCatalogFilters(state.filters)
  draft.brands.push('رونیکس')
  draft.specifications.powerSource.push('برق شهری')
  assert.deepEqual(state.filters.brands, ['بوش'])
  assert.deepEqual(state.filters.specifications.powerSource, ['شارژی'])
  const products = catalogRepository.getProducts()
  products[0].specifications.packageWeight = 'mutated'
  assert.equal(catalogProducts[0].specifications.packageWeight, '۵۰ کیلوگرم')
})
