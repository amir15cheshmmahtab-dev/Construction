<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { CatalogFilters } from '~/types/catalog'
import { catalogCategories, getCatalogSpecificationFilters } from '~/data/catalog-filters'
import { cloneCatalogFilters } from '~/utils/catalog'
import { formatNumber } from '~/utils/format'

const props = withDefaults(defineProps<{ filters: CatalogFilters; search?: string }>(), {
  search: '',
})
const emit = defineEmits<{
  'update:filters': [filters: CatalogFilters]
  removeSearch: []
  clear: []
}>()

interface FilterChip {
  id: string
  label: string
  remove: () => void
}

function patchFilters(values: Partial<CatalogFilters>) {
  emit('update:filters', { ...cloneCatalogFilters(props.filters), ...values })
}

const chips = computed<FilterChip[]>(() => {
  const filters = props.filters
  const result: FilterChip[] = []
  if (props.search) {
    result.push({
      id: 'search',
      label: `جستجو: ${props.search}`,
      remove: () => emit('removeSearch'),
    })
  }
  const category = catalogCategories.find((item) => item.id === filters.category)
  if (category) {
    result.push({
      id: 'category',
      label: category.name,
      remove: () => patchFilters({ category: null, subcategory: null, specifications: {} }),
    })
  }
  const subcategory = category?.subcategories.find((item) => item.id === filters.subcategory)
  if (subcategory) {
    result.push({
      id: 'subcategory',
      label: subcategory.name,
      remove: () => patchFilters({ subcategory: null, specifications: {} }),
    })
  }
  if (filters.minPriceToman !== null) {
    result.push({
      id: 'min-price',
      label: `از ${formatNumber(filters.minPriceToman)} تومان`,
      remove: () => patchFilters({ minPriceToman: null }),
    })
  }
  if (filters.maxPriceToman !== null) {
    result.push({
      id: 'max-price',
      label: `تا ${formatNumber(filters.maxPriceToman)} تومان`,
      remove: () => patchFilters({ maxPriceToman: null }),
    })
  }
  for (const brand of filters.brands) {
    result.push({
      id: `brand-${brand}`,
      label: `برند: ${brand}`,
      remove: () => patchFilters({ brands: filters.brands.filter((item) => item !== brand) }),
    })
  }
  const availabilityLabels = {
    available: 'موجود',
    unavailable: 'ناموجود',
    unknown: 'نیازمند استعلام',
  }
  for (const availability of filters.availability) {
    result.push({
      id: `availability-${availability}`,
      label: availabilityLabels[availability],
      remove: () =>
        patchFilters({
          availability: filters.availability.filter((item) => item !== availability),
        }),
    })
  }
  const specificationFilters = getCatalogSpecificationFilters(filters)
  for (const [key, values] of Object.entries(filters.specifications)) {
    const label = specificationFilters.find((item) => item.key === key)?.label ?? 'مشخصه'
    for (const value of values) {
      result.push({
        id: `specification-${key}-${value}`,
        label: `${label}: ${value}`,
        remove: () => {
          const specifications = cloneCatalogFilters(props.filters).specifications
          const next = (specifications[key] ?? []).filter((item) => item !== value)
          patchFilters({
            specifications: next.length
              ? { ...specifications, [key]: next }
              : Object.fromEntries(
                  Object.entries(specifications).filter(([itemKey]) => itemKey !== key),
                ),
          })
        },
      })
    }
  }
  return result
})
</script>

<template>
  <div v-if="chips.length" class="catalog-active-filters" aria-label="فیلترهای فعال">
    <span class="catalog-active-label">انتخاب شما:</span>
    <button
      v-for="chip in chips"
      :key="chip.id"
      class="catalog-active-chip"
      type="button"
      :aria-label="`حذف فیلتر ${chip.label}`"
      @click="chip.remove"
    >
      <span>{{ chip.label }}</span
      ><X :size="14" aria-hidden="true" />
    </button>
    <button class="catalog-text-button" type="button" @click="emit('clear')">حذف همه</button>
  </div>
</template>
