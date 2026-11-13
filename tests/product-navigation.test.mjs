import assert from 'node:assert/strict'
import test from 'node:test'
import { getCanonicalCardProduct, getCatalogReturnPath } from '../app/utils/product-navigation.ts'
import { products } from '../app/data/products.ts'
import { catalogProducts } from '../app/data/catalog.ts'

test('all catalog and original homepage cards resolve to an exact existing catalog SKU', () => {
  for (const product of [...products, ...catalogProducts]) {
    const canonical = getCanonicalCardProduct(product)
    assert.ok(canonical)
    if (product.id.startsWith('catalog-')) assert.equal(canonical.id, product.id)
  }
  assert.equal(getCanonicalCardProduct({ id: 'missing', slug: 'missing' }), undefined)
})
test('return links retain only canonical listing state and cannot become external or detail URLs', () => {
  assert.equal(
    getCatalogReturnPath('/products?category=rebar&sort=price-asc&page=2'),
    '/products?category=rebar&sort=price-asc&page=2',
  )
  assert.equal(
    getCatalogReturnPath('/products?category=tiles&tracking=1'),
    '/products?category=stone&subcategory=ceramic',
  )
  for (const value of [
    undefined,
    null,
    [],
    '//evil.test/products',
    'https://evil.test/products',
    '/products/slug',
    '/products#hash',
    '/productsevil?search=hi',
  ])
    assert.equal(getCatalogReturnPath(value), '/products')
})

test('trailing-slash return links retain canonical filters without accepting other paths', () => {
  assert.equal(getCatalogReturnPath('/products/'), '/products')
  assert.equal(
    getCatalogReturnPath('/products/?category=rebar&sort=price-asc&page=2&tracking=1'),
    '/products?category=rebar&sort=price-asc&page=2',
  )
  assert.equal(
    getCatalogReturnPath('/products/?category=tiles'),
    '/products?category=stone&subcategory=ceramic',
  )
  for (const value of [
    '/products//?category=rebar',
    '/products/../products?category=rebar',
    '/products/%2e%2e/products?category=rebar',
    '/products/%2f?category=rebar',
    '/products/#hash',
    '//evil.test/products/?category=rebar',
    'https://evil.test/products/?category=rebar',
  ])
    assert.equal(getCatalogReturnPath(value), '/products')
})

test('only explicit SKU variant navigation retains the purchase panel scroll position', async () => {
  const { shouldResetProductScroll } = await import('../app/utils/product-navigation.ts')
  assert.equal(shouldResetProductScroll('rebar-18', 'rebar-16'), false)
  assert.equal(shouldResetProductScroll('block-concrete-20', 'block-concrete-15'), false)
  assert.equal(shouldResetProductScroll('steel-profile-40', 'rebar-16'), true)
  assert.equal(shouldResetProductScroll('faucet-gold-basin', 'faucet-bronze-basin'), true)
  assert.equal(shouldResetProductScroll('rebar-16', undefined), true)
})
