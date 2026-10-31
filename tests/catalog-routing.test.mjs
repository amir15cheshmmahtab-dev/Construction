import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { setImmediate as nextTask, setTimeout as delay } from 'node:timers/promises'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import test from 'node:test'
import { effectScope, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

let moduleVersion = 0

/** Execute the actual Nuxt composable with Vue's reactivity and a real memory router.
 * Only Nuxt auto-imports/lifecycle wiring and import.meta.client are supplied here;
 * state, timers, navigation and canonicalization remain the production implementation.
 */
async function mountCatalog(initialPath = '/products', previousPath) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/products', component: {} },
      { path: '/products/:slug', component: {} },
    ],
  })
  if (previousPath) await router.push(previousPath)
  await router.push(initialPath)
  const mounted = []
  const unmounted = []
  const route = {
    get path() {
      return router.currentRoute.value.path
    },
    get query() {
      return router.currentRoute.value.query
    },
    get hash() {
      return router.currentRoute.value.hash
    },
    get fullPath() {
      return router.currentRoute.value.fullPath
    },
  }
  globalThis.__catalogHarnessContext = { route, router, mounted, unmounted }
  const original = await readFile(
    new URL('../app/composables/useProductCatalog.ts', import.meta.url),
    'utf8',
  )
  const source = stripTypeScriptTypes(original)
    .replace(
      /from '~\/([^']+)'/g,
      (_, path) => `from '${pathToFileURL(resolve('app', `${path}.ts`)).href}'`,
    )
    .replaceAll('import.meta.client', 'true')
  const injected = `
    import { computed, shallowRef, ref, watch, nextTick } from '${import.meta.resolve('vue')}';
    const context = globalThis.__catalogHarnessContext;
    const useRoute = () => context.route;
    const useRouter = () => context.router;
    const onMounted = callback => context.mounted.push(callback);
    const onBeforeUnmount = callback => context.unmounted.push(callback);
    ${source}
  `
  const { useProductCatalog } = await import(
    `data:text/javascript;base64,${Buffer.from(injected).toString('base64')}#${++moduleVersion}`
  )
  delete globalThis.__catalogHarnessContext
  const scope = effectScope()
  const catalog = scope.run(useProductCatalog)
  for (const hook of mounted) hook()
  await settle()
  return {
    router,
    catalog,
    dispose() {
      for (const hook of unmounted) hook()
      scope.stop()
      router.options.history.destroy()
    },
  }
}

async function settle() {
  await nextTick()
  await nextTask()
  await nextTick()
}

test('rapid consecutive applied actions retain earlier filters before router promises settle', async () => {
  const context = await mountCatalog()
  try {
    const first = context.catalog.selectCategory('rebar')
    const second = context.catalog.applyFilters({
      ...context.catalog.state.value.filters,
      minPriceToman: 38000,
    })
    const third = context.catalog.setSort('price-asc')
    assert.equal(context.catalog.state.value.filters.category, 'rebar')
    assert.equal(context.catalog.state.value.filters.minPriceToman, 38000)
    await Promise.all([first, second, third])
    await settle()
    assert.deepEqual(context.router.currentRoute.value.query, {
      category: 'rebar',
      sort: 'price-asc',
      min: '38000',
    })
    assert.equal(context.catalog.state.value.filters.minPriceToman, 38000)
  } finally {
    context.dispose()
  }
})

test('own navigation does not erase a newer search draft or its debounce', async () => {
  const context = await mountCatalog()
  let release
  const gate = new Promise((resolveGate) => {
    release = resolveGate
  })
  const removeGuard = context.router.beforeEach(() => gate)
  try {
    const pending = context.catalog.selectCategory('tools')
    await settle()
    context.catalog.searchInput.value = 'رونیکس'
    await nextTick()
    release()
    await pending
    await settle()
    assert.equal(context.catalog.searchInput.value, 'رونیکس')
    await delay(290)
    await settle()
    assert.equal(context.router.currentRoute.value.query.category, 'tools')
    assert.equal(context.router.currentRoute.value.query.search, 'رونیکس')
  } finally {
    release()
    removeGuard()
    context.dispose()
  }
})

test('Back and Forward restore filters and search and discard unapplied search drafts', async () => {
  const context = await mountCatalog('/products?category=stone&search=سنگ')
  try {
    context.catalog.searchInput.value = ''
    await context.catalog.selectCategory('tools')
    await settle()
    context.catalog.searchInput.value = 'unapplied draft'
    await nextTick()
    context.router.back()
    await settle()
    assert.equal(context.catalog.state.value.filters.category, 'stone')
    assert.equal(context.catalog.searchInput.value, 'سنگ')
    await delay(290)
    assert.equal(context.router.currentRoute.value.query.search, 'سنگ')
    context.router.forward()
    await settle()
    assert.equal(context.catalog.state.value.filters.category, 'tools')
    assert.equal(context.catalog.searchInput.value, '')
  } finally {
    context.dispose()
  }
})

test('Back remains authoritative when its destination equals a pending own target', async () => {
  const context = await mountCatalog('/products?category=rebar')
  let release
  const gate = new Promise((resolveGate) => {
    release = resolveGate
  })
  try {
    await context.catalog.selectCategory('tools')
    await settle()
    const removeGuard = context.router.beforeEach(() => gate)
    const pending = context.catalog.selectCategory('rebar')
    await settle()
    context.catalog.searchInput.value = 'discard this'
    await nextTick()
    context.router.back()
    release()
    await pending
    await settle()
    removeGuard()
    assert.equal(context.catalog.state.value.filters.category, 'rebar')
    assert.equal(context.catalog.searchInput.value, '')
    await delay(290)
    assert.ok(!context.router.currentRoute.value.query.search)
  } finally {
    release?.()
    context.dispose()
  }
})

test('direct aliases and out-of-range pages canonicalize once without creating history entries', async () => {
  const context = await mountCatalog(
    '/products?category=tiles&sort=price-asc&page=999&unknown=value',
    '/products?category=rebar',
  )
  try {
    assert.deepEqual(context.router.currentRoute.value.query, {
      category: 'stone',
      subcategory: 'ceramic',
      sort: 'price-asc',
    })
    assert.equal(context.catalog.state.value.page, 1)
    assert.equal(context.catalog.results.value.total, 3)
    const canonicalPath = context.router.currentRoute.value.fullPath
    await settle()
    assert.equal(context.router.currentRoute.value.fullPath, canonicalPath)
    context.router.back()
    await settle()
    assert.equal(context.catalog.state.value.filters.category, 'rebar')
  } finally {
    context.dispose()
  }
})

test('a rejected navigation rolls optimistic state back to the actual route', async () => {
  const context = await mountCatalog('/products?category=cement')
  const removeGuard = context.router.beforeEach((to) => to.query.category !== 'tools')
  try {
    const pending = context.catalog.selectCategory('tools')
    assert.equal(context.catalog.state.value.filters.category, 'tools')
    await pending
    await settle()
    assert.equal(context.router.currentRoute.value.query.category, 'cement')
    assert.equal(context.catalog.state.value.filters.category, 'cement')
  } finally {
    removeGuard()
    context.dispose()
  }
})

test('leaving the listing for a detail route never canonicalizes the detail query back to listing', async () => {
  const context = await mountCatalog('/products?category=rebar&page=2')
  try {
    context.catalog.searchInput.value = 'pending search'
    await nextTick()
    await context.router.push('/products/rebar-16?from=%2Fproducts%3Fcategory%3Drebar')
    await settle()
    await delay(290)
    assert.equal(context.router.currentRoute.value.path, '/products/rebar-16')
    assert.equal(context.router.currentRoute.value.query.from, '/products?category=rebar')
  } finally {
    context.dispose()
  }
})
