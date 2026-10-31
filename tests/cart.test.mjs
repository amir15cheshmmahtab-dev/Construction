import assert from 'node:assert/strict'
import test from 'node:test'
import { createPinia, setActivePinia } from 'pinia'
import { catalogProducts } from '../app/data/catalog.ts'
import { useCartStore } from '../app/stores/cart.ts'

const bySlug = (slug) => catalogProducts.find((product) => product.slug === slug)
const freshCart = () => {
  setActivePinia(createPinia())
  return useCartStore()
}

test('cart state is local to each Pinia session and header count represents distinct SKU lines', () => {
  const cart = freshCart()
  assert.equal(cart.itemCount, 0)
  assert.equal(cart.addItem({ productId: bySlug('cement-type2-50').id, quantity: 3 }).success, true)
  assert.equal(cart.addItem({ productId: bySlug('rebar-16').id, quantity: 1.5 }).success, true)
  assert.equal(cart.itemCount, 2)
  assert.equal(cart.items[0].quantity, 3)
  assert.equal(cart.items[1].quantity, 1.5)
  const anotherSession = freshCart()
  assert.equal(anotherSession.itemCount, 0)
  assert.equal(cart.itemCount, 2)
})

test('adding the same SKU merges quantities and exposes honest snapshot information', () => {
  const cart = freshCart()
  const product = bySlug('cement-type2-50')
  const first = cart.addItem({ productId: product.id, quantity: '۲' })
  assert.equal(first.success, true)
  assert.equal(first.merged, false)
  const second = cart.addItem({ productId: product.id, quantity: 3 })
  assert.equal(second.merged, true)
  assert.equal(cart.itemCount, 1)
  assert.equal(cart.items[0].quantity, 5)
  assert.equal(cart.items[0].name, product.name)
  assert.equal(cart.items[0].priceRial, product.priceRial)
  assert.equal(cart.items[0].slug, product.slug)
  assert.equal(cart.items[0].unit, product.unit)
  second.item.quantity = 1000
  assert.equal(cart.items[0].quantity, 5)
})

test('fractional weight/area quantities merge using integer-scaled arithmetic', () => {
  const cart = freshCart()
  const sand = bySlug('sand-washed')
  for (let index = 0; index < 11; index++)
    assert.equal(cart.addItem({ productId: sand.id, quantity: '۰٫۵' }).success, true)
  assert.equal(cart.items[0].quantity, 5.5)
  assert.equal(cart.itemCount, 1)
})

test('unavailable, unpriced, invalid products and invalid quantities never add lines', () => {
  const cart = freshCart()
  const unavailable = catalogProducts.find((product) => product.availability === 'unavailable')
  const unpriced = catalogProducts.find(
    (product) => product.priceRial === null && product.availability !== 'unavailable',
  )
  assert.equal(cart.addItem({ productId: unavailable.id, quantity: 1 }).code, 'unavailable')
  assert.equal(cart.addItem({ productId: unpriced.id, quantity: 1 }).code, 'price')
  assert.equal(cart.addItem({ productId: 'missing', quantity: 1 }).code, 'product')
  for (const quantity of [0, -1, 1.5, 'unsafe', Infinity, 1000001]) {
    assert.equal(
      cart.addItem({ productId: bySlug('cement-type2-50').id, quantity }).code,
      'quantity',
    )
  }
  assert.equal(cart.itemCount, 0)
})

test('unknown stock can enter only the local demo basket without claiming inventory confirmation', () => {
  const cart = freshCart()
  const unknown = catalogProducts.find(
    (product) => product.availability === 'unknown' && product.priceRial !== null,
  )
  assert.equal(cart.addItem({ productId: unknown.id, quantity: 1 }).success, true)
  assert.equal(unknown.availability, 'unknown')
})

test('variant addition resolves the selected existing SKU and merges with catalog additions of that SKU', () => {
  const cart = freshCart()
  const base = bySlug('block-concrete-15')
  const selected = bySlug('block-concrete-20')
  const result = cart.addItem({ productId: base.id, variantId: selected.id, quantity: 2 })
  assert.equal(result.success, true)
  assert.equal(result.item.productId, selected.id)
  assert.equal(result.item.slug, selected.slug)
  assert.equal(result.item.priceRial, selected.priceRial)
  assert.equal(result.item.variantId, selected.id)
  assert.equal(cart.addItem({ productId: selected.id, quantity: 3 }).merged, true)
  assert.equal(cart.itemCount, 1)
  assert.equal(cart.items[0].quantity, 5)
})

test('variants cannot cross product families or bypass selected SKU price/stock rules', () => {
  const cart = freshCart()
  const base = bySlug('rebar-16')
  assert.equal(
    cart.addItem({ productId: base.id, variantId: bySlug('cement-type2-50').id, quantity: 1 }).code,
    'variant',
  )
  assert.equal(cart.addItem({ productId: base.id, variantId: '', quantity: 1 }).code, 'variant')
  assert.equal(
    cart.addItem({ productId: bySlug('cement-type2-50').id, variantId: base.id, quantity: 1 }).code,
    'variant',
  )
  assert.equal(
    cart.addItem({ productId: base.id, variantId: bySlug('rebar-20').id, quantity: 1 }).code,
    'price',
  )
  const unavailableVariant = catalogProducts.find(
    (product) => product.subcategoryId === 'rebar' && product.availability === 'unavailable',
  )
  assert.ok(unavailableVariant)
  assert.equal(
    cart.addItem({ productId: base.id, variantId: unavailableVariant.id, quantity: 1 }).code,
    'unavailable',
  )
  assert.equal(cart.itemCount, 0)
})

test('merging over the demo safety limit fails atomically and preserves prior quantity', () => {
  const cart = freshCart()
  const product = bySlug('cement-type2-50')
  assert.equal(cart.addItem({ productId: product.id, quantity: 1000000 }).success, true)
  assert.equal(cart.addItem({ productId: product.id, quantity: 1 }).code, 'quantity')
  assert.equal(cart.items[0].quantity, 1000000)
  assert.equal(cart.itemCount, 1)
})
