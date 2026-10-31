<script setup lang="ts">
import { SlidersHorizontal, ArrowDownWideNarrow } from 'lucide-vue-next'
import type { CatalogSort } from '~/types/catalog'
import { formatNumber } from '~/utils/format'

defineProps<{ count: number; sort: CatalogSort; filterCount: number; filtersOpen: boolean }>()
const emit = defineEmits<{ 'update:sort': [value: CatalogSort]; openFilters: [] }>()
const sortId = useId()
</script>

<template>
  <div class="catalog-toolbar">
    <h2
      id="catalog-results-title"
      class="catalog-result-count"
      tabindex="-1"
      aria-live="polite"
      aria-atomic="true"
    >
      <strong>{{ formatNumber(count) }}</strong> محصول
    </h2>
    <button
      class="catalog-open-filters"
      type="button"
      aria-haspopup="dialog"
      :aria-expanded="filtersOpen"
      @click="emit('openFilters')"
    >
      <SlidersHorizontal :size="18" :stroke-width="1.5" aria-hidden="true" />
      فیلترها<span v-if="filterCount" class="catalog-filter-count">{{
        formatNumber(filterCount)
      }}</span>
    </button>
    <div class="catalog-sort">
      <ArrowDownWideNarrow :size="18" :stroke-width="1.5" aria-hidden="true" />
      <label :for="sortId">مرتب‌سازی</label>
      <select
        :id="sortId"
        :value="sort"
        aria-label="مرتب‌سازی محصولات"
        @change="emit('update:sort', ($event.target as HTMLSelectElement).value as CatalogSort)"
      >
        <option value="recommended">پیشنهاد سیوان</option>
        <option value="newest">جدیدترین</option>
        <option value="price-asc">ارزان‌ترین</option>
        <option value="price-desc">گران‌ترین</option>
        <option value="name">نام محصول</option>
      </select>
    </div>
  </div>
</template>
