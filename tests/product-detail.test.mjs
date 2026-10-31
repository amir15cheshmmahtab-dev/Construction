import assert from 'node:assert/strict'
import test from 'node:test'
import { catalogProducts } from '../app/data/catalog.ts'
import { catalogRepository } from '../app/repositories/catalog.ts'
import { formatToman } from '../app/utils/format.ts'
import {
  calculateLineTotalRial,
  formatProductQuantity,
  getProductDetail,
  getProductOrdering,
  getRelatedProducts,
  stepProductQuantity,
  validateProductQuantity,
} from '../app/utils/product-detail.ts'

const bySlug = (slug) => catalogProducts.find((product) => product.slug === slug)

test('exact repository lookup supports all 48 slugs and does not mutate the shared source', () => {
  assert.equal(catalogProducts.length, 48)
  for (const source of catalogProducts) {
    const product = catalogRepository.getProductBySlug(source.slug)
    assert.deepEqual(product, source)
    assert.notEqual(product, source)
    product.specifications.injected = 'not in source'
    assert.equal(source.specifications.injected, undefined)
  }
  for (const slug of [
    'missing',
    '',
    'rebar-a3',
    ' rebar-16',
    'rebar-16/',
    '../rebar-16',
    'REBAR-16',
  ]) {
    assert.equal(catalogRepository.getProductBySlug(slug), undefined)
  }
})

test('every detail reuses a single source image without fake gallery angles', () => {
  for (const product of catalogProducts) {
    const detail = getProductDetail(product)
    assert.equal(detail.product, product)
    assert.equal(detail.images.length, 1)
    assert.equal(detail.images[0].src, product.image)
    assert.equal(detail.images[0].alt, product.imageAlt)
    assert.equal(new Set(detail.images.map(({ src }) => src)).size, detail.images.length)
    assert.ok(detail.images[0].width > 0 && detail.images[0].height > 0)
  }
})

test('category-aware grouped specifications render existing values only, with no irrelevant or empty rows', () => {
  for (const product of catalogProducts) {
    const detail = getProductDetail(product)
    const items = detail.specifications.flatMap((group) => {
      assert.ok(group.title && group.items.length)
      return group.items
    })
    for (const item of items) {
      assert.ok(item.label && item.value)
      assert.equal(
        item.value,
        item.key === 'unitOfSale' ? product.unit : product.specifications[item.key],
      )
    }
    assert.equal(new Set(items.map(({ key }) => key)).size, items.length)
    assert.equal(items.length, Object.keys(product.specifications).length + 1)
  }
  const cementKeys = getProductDetail(bySlug('cement-type2-50')).specifications.flatMap(
    ({ items }) => items.map(({ key }) => key),
  )
  assert.ok(cementKeys.includes('cementType') && cementKeys.includes('packageWeight'))
  assert.ok(!cementKeys.includes('diameter') && !cementKeys.includes('powerSource'))
  const rebarKeys = getProductDetail(bySlug('rebar-16')).specifications.flatMap(({ items }) =>
    items.map(({ key }) => key),
  )
  assert.ok(rebarKeys.includes('diameter') && rebarKeys.includes('length'))
  assert.ok(!rebarKeys.includes('grade'))
  const toolKeys = getProductDetail(bySlug('drill-ronix-2113')).specifications.flatMap(
    ({ items }) => items.map(({ key }) => key),
  )
  assert.ok(toolKeys.includes('wattage') && toolKeys.includes('powerSource'))
  assert.ok(!toolKeys.includes('packageWeight'))
})

test('descriptions use category context, recorded characteristics, and explicit demonstration language', () => {
  for (const product of catalogProducts) {
    const sections = getProductDetail(product).descriptionSections
    assert.deepEqual(
      sections.map(({ id }) => id),
      ['introduction', 'uses', 'characteristics', 'considerations'],
    )
    assert.equal(sections[0].paragraphs[0], product.description)
    assert.ok(
      sections.every(
        ({ title, paragraphs }) => title && paragraphs.length && paragraphs.every(Boolean),
      ),
    )
    assert.ok(sections.at(-1).paragraphs.some((paragraph) => paragraph.includes('نمایشی')))
  }
  assert.notEqual(
    getProductDetail(bySlug('cement-type2-50')).descriptionSections[1].paragraphs[0],
    getProductDetail(bySlug('drill-ronix-2113')).descriptionSections[1].paragraphs[0],
  )
})

test('only explicit existing rebar and block families expose real SKU variant options', () => {
  const rebar = getProductDetail(bySlug('rebar-16')).variants
  assert.equal(rebar.id, 'rebar-diameter')
  assert.equal(rebar.selectedId, bySlug('rebar-16').id)
  assert.equal(rebar.options.length, 6)
  assert.deepEqual(
    rebar.options.map(({ slug }) => slug),
    ['rebar-10', 'rebar-12', 'rebar-14', 'rebar-16', 'rebar-18', 'rebar-20'],
  )
  for (const option of rebar.options) {
    const product = bySlug(option.slug)
    assert.equal(option.productId, product.id)
    assert.equal(option.priceRial, product.priceRial)
    assert.equal(option.availability, product.availability)
    assert.equal(option.value, product.specifications.diameter)
  }
  const blocks = getProductDetail(bySlug('block-concrete-15')).variants
  assert.equal(blocks.options.length, 2)
  assert.deepEqual(
    blocks.options.map(({ value }) => value),
    ['۱۵ سانتی‌متر', '۲۰ سانتی‌متر'],
  )
  for (const slug of [
    'cement-type2-50',
    'faucet-bronze-basin',
    'drill-bosch-gsb18v50',
    'ceramic-travertine-60',
  ]) {
    assert.equal(getProductDetail(bySlug(slug)).variants, null)
  }
  const altered = catalogProducts.map((product) =>
    product.slug === 'rebar-10' ? { ...product, brand: 'different brand' } : product,
  )
  assert.equal(getProductDetail(bySlug('rebar-16'), altered).variants.options.length, 5)
})

test('related products exclude the current SKU and prefer complementary actual subcategories', () => {
  for (const product of catalogProducts) {
    const related = getRelatedProducts(product)
    assert.ok(related.length <= 4)
    assert.ok(
      related.every((entry) => entry.id !== product.id && entry.categoryId === product.categoryId),
    )
    assert.ok(related.every((entry) => catalogProducts.includes(entry)))
  }
  assert.equal(getRelatedProducts(bySlug('cement-type2-50'))[0].subcategoryId, 'sand')
  assert.equal(getRelatedProducts(bySlug('rebar-16'))[0].subcategoryId, 'profile')
  assert.deepEqual(getRelatedProducts(bySlug('rebar-16'), catalogProducts, 0), [])
  assert.ok(getRelatedProducts(bySlug('rebar-16'), catalogProducts, 1000).length <= 8)
})

test('ordering rules respect units and clearly identify UI demonstration increments', () => {
  const bags = getProductOrdering(bySlug('cement-type2-50'))
  assert.equal(bags.minimum, 1)
  assert.equal(bags.step, 1)
  assert.equal(bags.precision, 0)
  for (const slug of ['sand-washed', 'rebar-16', 'ceramic-travertine-60']) {
    const ordering = getProductOrdering(bySlug(slug))
    assert.equal(ordering.step, 0.5)
    assert.equal(ordering.scale, 10)
    assert.ok(ordering.note.includes('نمایشی'))
    assert.ok(ordering.note.includes('واقعی'))
  }
  assert.equal(getProductOrdering(bySlug('sand-washed')).minimum, 0.5)
})

test('quantity parsing supports Persian/Arabic digits and exact fractional/grouped input', () => {
  const ordering = getProductOrdering(bySlug('sand-washed'))
  for (const input of ['۰٫۵', '٠.٥', '0.50', 0.5]) {
    assert.deepEqual(validateProductQuantity(input, ordering), {
      valid: true,
      quantity: 0.5,
      scaled: 5,
    })
  }
  assert.deepEqual(validateProductQuantity('١٬٠٠٠٫٥', ordering), {
    valid: true,
    quantity: 1000.5,
    scaled: 10005,
  })
  for (const input of [
    '',
    '1e3',
    '-1',
    'NaN',
    Infinity,
    NaN,
    '1,5',
    '1.2.3',
    '۱ تن',
    '2 000',
    '0.25',
  ]) {
    assert.equal(validateProductQuantity(input, ordering).valid, false)
  }
  assert.equal(validateProductQuantity('0', ordering).code, 'minimum')
  assert.equal(validateProductQuantity('1.1', ordering).code, 'step')
  assert.equal(validateProductQuantity('1000000.5', ordering).code, 'maximum')
  const bags = getProductOrdering(bySlug('cement-type2-50'))
  assert.equal(validateProductQuantity('1.5', bags).valid, false)
  assert.equal(validateProductQuantity('۱.۰۰', bags).quantity, 1)
})

test('quantity stepping uses scaled integer arithmetic, clamps bounds, and recovers invalid input', () => {
  const ordering = getProductOrdering(bySlug('sand-washed'))
  let quantity = ordering.minimum
  for (let index = 0; index < 25; index++) quantity = stepProductQuantity(quantity, ordering, 1)
  assert.equal(quantity, 13)
  assert.equal(validateProductQuantity(quantity, ordering).valid, true)
  assert.equal(stepProductQuantity(ordering.minimum, ordering, -1), ordering.minimum)
  assert.equal(stepProductQuantity(ordering.maximum, ordering, 1), ordering.maximum)
  assert.equal(stepProductQuantity('invalid', ordering, 1), ordering.minimum)
})

test('quantity display and line totals keep fractional units separate from rial/toman formatting', () => {
  assert.equal(formatProductQuantity(1.5), '۱٫۵')
  assert.equal(formatProductQuantity(0.125), '۰٫۱۲۵')
  const product = bySlug('ceramic-travertine-60')
  const ordering = getProductOrdering(product)
  assert.equal(calculateLineTotalRial(product.priceRial, '۱٫۵', ordering), 27750000)
  assert.equal(formatToman(calculateLineTotalRial(product.priceRial, 1.5, ordering)), '۲٬۷۷۵٬۰۰۰')
  assert.equal(calculateLineTotalRial(null, 1.5, ordering), null)
  assert.equal(calculateLineTotalRial(product.priceRial, 1.25, ordering), null)
})
