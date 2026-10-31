<script setup lang="ts">
import { SlidersHorizontal } from 'lucide-vue-next'
import type { CatalogFilters } from '~/types/catalog'
import {
  catalogCategories,
  getCatalogBrands,
  getCatalogSpecificationFilters,
} from '~/data/catalog-filters'

const props = defineProps<{ modelValue: CatalogFilters }>()
const emit = defineEmits<{
  'update:modelValue': [filters: CatalogFilters]
  clear: []
}>()
const headingId = useId()
const resetVersion = ref(0)
const brands = computed(() => [
  ...new Set([...getCatalogBrands(props.modelValue), ...props.modelValue.brands]),
])
const specificationFilters = computed(() => getCatalogSpecificationFilters(props.modelValue))

function clearFilters() {
  resetVersion.value += 1
  emit('clear')
}
</script>

<template>
  <aside class="catalog-filter-sidebar" :aria-labelledby="headingId">
    <div class="catalog-filter-heading">
      <h2 :id="headingId"><SlidersHorizontal :size="18" aria-hidden="true" />فیلتر محصولات</h2>
      <button class="catalog-text-button" type="button" @click="clearFilters">حذف همه</button>
    </div>
    <ProductsProductFilterFields
      :key="resetVersion"
      :model-value="modelValue"
      :categories="catalogCategories"
      :brands="brands"
      :specification-filters="specificationFilters"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <button class="catalog-clear-filters" type="button" @click="clearFilters">
      حذف همه فیلترها
    </button>
  </aside>
</template>
