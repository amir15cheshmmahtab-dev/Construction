import type { CatalogFilters, CatalogQuery, CatalogSort, CatalogState } from '~/types/catalog'
import { catalogRepository } from '~/repositories/catalog'
import {
  countCatalogFilters,
  createEmptyCatalogFilters,
  getCatalogResults,
  normalizeCatalogState,
  parseCatalogQuery,
  serializeCatalogQuery,
} from '~/utils/catalog'

function querySignature(query: CatalogQuery): string {
  return JSON.stringify(Object.entries(query).sort(([left], [right]) => left.localeCompare(right)))
}

/** Only applied state is routed; a drawer's unapplied draft never enters it. */
export function useProductCatalog() {
  const route = useRoute()
  const router = useRouter()
  const products = catalogRepository.getProducts()
  // Apply immediately so another control never builds its update from a stale URL.
  const state = shallowRef(parseCatalogQuery(route.query))
  const results = computed(() => getCatalogResults(products, state.value))
  const searchInput = ref(state.value.search)
  const filterCount = computed(() => countCatalogFilters(state.value.filters))
  let searchTimer: ReturnType<typeof setTimeout> | undefined
  let navigationVersion = 0
  let pendingTarget: string | undefined
  const ownTargets = new Set<string>()

  function clearSearchTimer() {
    clearTimeout(searchTimer)
    searchTimer = undefined
  }

  async function updateState(patch: Partial<CatalogState>) {
    clearSearchTimer()
    const next = normalizeCatalogState({
      ...state.value,
      search: searchInput.value,
      ...patch,
    })
    if (next.search !== state.value.search) next.page = 1
    next.page = getCatalogResults(products, next).page
    const query = serializeCatalogQuery(next)
    const signature = querySignature(query)
    state.value = next
    if (pendingTarget || signature !== querySignature(route.query)) {
      const version = ++navigationVersion
      pendingTarget = signature
      ownTargets.add(signature)
      try {
        const failure = await router.push({ path: '/products', query })
        if (version !== navigationVersion) return
        if (failure) {
          cancelPendingNavigation()
          restoreRouteState()
        } else if (signature === querySignature(route.query)) {
          restoreRouteState()
        }
      } catch (error) {
        if (version === navigationVersion) {
          cancelPendingNavigation()
          restoreRouteState()
        }
        throw error
      }
    }
  }

  function applyFilters(filters: CatalogFilters) {
    return updateState({ filters, page: 1 })
  }

  function selectCategory(category: string | null) {
    return applyFilters({ ...state.value.filters, category, subcategory: null, specifications: {} })
  }

  function clearAll() {
    searchInput.value = ''
    return updateState({ filters: createEmptyCatalogFilters(), search: '', page: 1 })
  }

  function clearSearch() {
    searchInput.value = ''
    return updateState({ search: '', page: 1 })
  }

  function submitSearch() {
    return updateState({ search: searchInput.value, page: 1 })
  }

  function setSort(sort: CatalogSort) {
    return updateState({ sort, page: 1 })
  }

  function setPageSize(pageSize: number) {
    return updateState({ pageSize, page: 1 })
  }

  async function setPage(page: number) {
    await updateState({ page })
    await nextTick()
    const heading = document.getElementById('catalog-results-title')
    heading?.focus({ preventScroll: true })
    document.getElementById('catalog-results')?.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }

  watch(searchInput, () => {
    clearSearchTimer()
    if (searchInput.value.trim() === state.value.search) return
    searchTimer = setTimeout(() => void submitSearch(), 250)
  })

  function cancelPendingNavigation() {
    navigationVersion += 1
    pendingTarget = undefined
    ownTargets.clear()
  }

  function restoreRouteState() {
    const signature = querySignature(route.query)
    // A superseded push may settle while the newest selection is still routing.
    if (pendingTarget && signature !== pendingTarget && ownTargets.has(signature)) return
    const isOwnNavigation = signature === pendingTarget
    cancelPendingNavigation()
    state.value = parseCatalogQuery(route.query)
    if (!isOwnNavigation) {
      clearSearchTimer()
      searchInput.value = state.value.search
    }
    const query = serializeCatalogQuery({ ...state.value, page: results.value.page })
    if (querySignature(query) !== querySignature(route.query)) {
      void router.replace({ path: '/products', query, hash: route.hash })
    }
  }

  // Pop navigation is authoritative, including a destination equal to an older push.
  const stopHistoryListener = import.meta.client
    ? router.options.history.listen(cancelPendingNavigation)
    : undefined
  onMounted(restoreRouteState)
  watch(() => route.fullPath, restoreRouteState, { flush: 'sync' })
  onBeforeUnmount(() => {
    clearSearchTimer()
    stopHistoryListener?.()
  })

  return {
    state,
    results,
    searchInput,
    filterCount,
    totalProducts: products.length,
    applyFilters,
    selectCategory,
    clearAll,
    clearSearch,
    submitSearch,
    setSort,
    setPage,
    setPageSize,
  }
}
