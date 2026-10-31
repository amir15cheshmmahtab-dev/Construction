<script setup lang="ts">
import { SlidersHorizontal, X } from 'lucide-vue-next'
import type { CatalogFilters } from '~/types/catalog'
import {
  catalogCategories,
  getCatalogBrands,
  getCatalogSpecificationFilters,
} from '~/data/catalog-filters'
import { cloneCatalogFilters, createEmptyCatalogFilters } from '~/utils/catalog'

const props = defineProps<{ open: boolean; modelValue: CatalogFilters }>()
const emit = defineEmits<{
  'update:open': [open: boolean]
  apply: [filters: CatalogFilters]
}>()
const dialog = ref<HTMLDialogElement | null>(null)
const titleId = useId()
const draft = ref<CatalogFilters>(createEmptyCatalogFilters())
const valid = ref(true)
const draftVersion = ref(0)
const brands = computed(() => [
  ...new Set([...getCatalogBrands(draft.value), ...draft.value.brands]),
])
const specificationFilters = computed(() => getCatalogSpecificationFilters(draft.value))
let previousFocus: HTMLElement | null = null
let unlockScroll: (() => void) | null = null

function lockScroll() {
  if (unlockScroll) return
  const body = document.body
  const html = document.documentElement
  const previousBodyOverflow = body.style.overflow
  const previousHtmlOverflow = html.style.overflow
  const previousPadding = body.style.paddingInlineEnd
  const scrollbarWidth = window.innerWidth - html.clientWidth
  if (scrollbarWidth > 0) {
    body.style.paddingInlineEnd = `${Number.parseFloat(getComputedStyle(body).paddingInlineEnd) + scrollbarWidth}px`
  }
  body.style.overflow = 'hidden'
  html.style.overflow = 'hidden'
  unlockScroll = () => {
    body.style.overflow = previousBodyOverflow
    html.style.overflow = previousHtmlOverflow
    body.style.paddingInlineEnd = previousPadding
    unlockScroll = null
  }
}

function finishClose() {
  unlockScroll?.()
  emit('update:open', false)
  const focusTarget =
    previousFocus?.isConnected && previousFocus.getClientRects().length
      ? previousFocus
      : document.getElementById('catalog-results-title')
  focusTarget?.focus({ preventScroll: true })
  previousFocus = null
}

function discard() {
  if (dialog.value?.open) dialog.value.close()
  else finishClose()
  emit('update:open', false)
}

function resetDraft() {
  draft.value = createEmptyCatalogFilters()
  valid.value = true
  draftVersion.value += 1
}

function applyDraft() {
  if (!valid.value) return
  emit('apply', cloneCatalogFilters(draft.value))
  discard()
}

function synchronizeDialog() {
  if (!dialog.value) return
  if (props.open && !dialog.value.open) {
    draft.value = cloneCatalogFilters(props.modelValue)
    valid.value = true
    draftVersion.value += 1
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.value.showModal()
    lockScroll()
  } else if (!props.open && dialog.value.open) {
    dialog.value.close()
  }
}

watch(() => props.open, synchronizeDialog)
onMounted(synchronizeDialog)
onBeforeUnmount(() => {
  unlockScroll?.()
  if (dialog.value?.open) dialog.value.close()
})
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialog"
      class="catalog-filter-dialog"
      dir="rtl"
      :aria-labelledby="titleId"
      @cancel.prevent="discard"
      @close="finishClose"
      @click="$event.target === dialog && discard()"
    >
      <div class="catalog-drawer-inner">
        <header class="catalog-drawer-header">
          <div>
            <p class="eyebrow" dir="ltr">REFINE YOUR SELECTION</p>
            <h2 :id="titleId"><SlidersHorizontal :size="20" aria-hidden="true" />فیلتر محصولات</h2>
          </div>
          <button class="icon-button" type="button" aria-label="بستن فیلترها" @click="discard">
            <X :size="23" aria-hidden="true" />
          </button>
        </header>
        <div class="catalog-drawer-body">
          <ProductsProductFilterFields
            :key="draftVersion"
            v-model="draft"
            :categories="catalogCategories"
            :brands="brands"
            :specification-filters="specificationFilters"
            @validity-change="valid = $event"
          />
        </div>
        <footer class="catalog-drawer-footer">
          <button class="catalog-clear-filters" type="button" @click="resetDraft">
            حذف همه فیلترها
          </button>
          <button
            class="base-button base-button--bronze catalog-apply-filters"
            type="button"
            :disabled="!valid"
            @click="applyDraft"
          >
            اعمال فیلترها
          </button>
          <p v-if="!valid" class="catalog-field-error" role="status">
            ابتدا محدوده قیمت را اصلاح کنید.
          </p>
        </footer>
      </div>
    </dialog>
  </Teleport>
</template>
