<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import type { CatalogCategory, CatalogFilters, CatalogSpecificationFilter } from '~/types/catalog'
import type { ProductAvailability } from '~/types/marketplace'
import { cloneCatalogFilters, parseCatalogNumber } from '~/utils/catalog'
import { formatNumber } from '~/utils/format'

const props = defineProps<{
  modelValue: CatalogFilters
  categories: readonly CatalogCategory[]
  brands: readonly string[]
  specificationFilters: readonly CatalogSpecificationFilter[]
}>()
const emit = defineEmits<{
  'update:modelValue': [filters: CatalogFilters]
  validityChange: [valid: boolean]
}>()

const fieldId = useId()
const minimum = ref('')
const maximum = ref('')
const focusedPrice = ref<'minPriceToman' | 'maxPriceToman' | null>(null)
const selectedCategory = computed(() =>
  props.categories.find((category) => category.id === props.modelValue.category),
)
const availabilityOptions: { value: ProductAvailability; label: string }[] = [
  { value: 'available', label: 'موجود' },
  { value: 'unavailable', label: 'ناموجود' },
]

function parsePrice(value: string): number | null | 'invalid' {
  if (!value.replace(/[\s,٬،]/g, '')) return null
  return parseCatalogNumber(value) ?? 'invalid'
}

watch(
  () => props.modelValue.minPriceToman,
  (value) => {
    // Preserve live digit formatting only while it represents the incoming value.
    // Browser navigation must also restore an input that still has focus.
    if (focusedPrice.value !== 'minPriceToman' || parsePrice(minimum.value) !== value) {
      minimum.value = value === null ? '' : formatNumber(value)
    }
  },
  { immediate: true },
)
watch(
  () => props.modelValue.maxPriceToman,
  (value) => {
    if (focusedPrice.value !== 'maxPriceToman' || parsePrice(maximum.value) !== value) {
      maximum.value = value === null ? '' : formatNumber(value)
    }
  },
  { immediate: true },
)

const priceError = computed(() => {
  const min = parsePrice(minimum.value)
  const max = parsePrice(maximum.value)
  if (min === 'invalid' || max === 'invalid') {
    return 'قیمت را با عدد صحیح از صفر تا ۱٬۰۰۰٬۰۰۰٬۰۰۰٬۰۰۰ تومان وارد کنید.'
  }
  if (min !== null && max !== null && min > max) {
    return 'حداقل قیمت باید کمتر یا برابر حداکثر قیمت باشد.'
  }
  return ''
})
watch(priceError, (error) => emit('validityChange', !error), { immediate: true })

function patchFilters(values: Partial<CatalogFilters>) {
  emit('update:modelValue', { ...cloneCatalogFilters(props.modelValue), ...values })
}

function setCategory(event: Event) {
  const category = (event.target as HTMLSelectElement).value || null
  patchFilters({ category, subcategory: null, specifications: {} })
}

function setSubcategory(event: Event) {
  patchFilters({
    subcategory: (event.target as HTMLSelectElement).value || null,
    specifications: {},
  })
}

function setPrice(field: 'minPriceToman' | 'maxPriceToman', event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (field === 'minPriceToman') minimum.value = value
  else maximum.value = value
  const amount = parsePrice(value)
  if (amount !== 'invalid') patchFilters({ [field]: amount })
}

function finishPrice(field: 'minPriceToman' | 'maxPriceToman') {
  focusedPrice.value = null
  const value = field === 'minPriceToman' ? minimum : maximum
  const amount = parsePrice(value.value)
  if (amount !== null && amount !== 'invalid') value.value = formatNumber(amount)
}

function toggleBrand(brand: string) {
  const selected = props.modelValue.brands
  patchFilters({
    brands: selected.includes(brand)
      ? selected.filter((value) => value !== brand)
      : [...selected, brand],
  })
}

function toggleAvailability(availability: ProductAvailability) {
  const selected = props.modelValue.availability
  patchFilters({
    availability: selected.includes(availability)
      ? selected.filter((value) => value !== availability)
      : [...selected, availability],
  })
}

function toggleSpecification(key: string, value: string) {
  const specifications = cloneCatalogFilters(props.modelValue).specifications
  const selected = specifications[key] ?? []
  const next = selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value]
  patchFilters({
    specifications: next.length
      ? { ...specifications, [key]: next }
      : Object.fromEntries(Object.entries(specifications).filter(([itemKey]) => itemKey !== key)),
  })
}
</script>

<template>
  <div class="catalog-filter-fields">
    <details class="catalog-filter-group" open>
      <summary><span>دسته‌بندی محصولات</span><ChevronDown :size="17" aria-hidden="true" /></summary>
      <div class="catalog-filter-group-body">
        <label class="catalog-field-label" :for="`${fieldId}-category`">دسته اصلی</label>
        <select
          :id="`${fieldId}-category`"
          class="catalog-select"
          :value="modelValue.category ?? ''"
          @change="setCategory"
        >
          <option value="">همه دسته‌ها</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        <template v-if="selectedCategory">
          <label class="catalog-field-label" :for="`${fieldId}-subcategory`">زیردسته</label>
          <select
            :id="`${fieldId}-subcategory`"
            class="catalog-select"
            :value="modelValue.subcategory ?? ''"
            @change="setSubcategory"
          >
            <option value="">همه {{ selectedCategory.name }}</option>
            <option
              v-for="subcategory in selectedCategory.subcategories"
              :key="subcategory.id"
              :value="subcategory.id"
            >
              {{ subcategory.name }}
            </option>
          </select>
        </template>
      </div>
    </details>

    <details class="catalog-filter-group" open>
      <summary><span>محدوده قیمت</span><ChevronDown :size="17" aria-hidden="true" /></summary>
      <div class="catalog-filter-group-body">
        <p :id="`${fieldId}-price-note`" class="catalog-filter-note">مبلغ به تومان</p>
        <div class="catalog-price-fields">
          <div>
            <label class="catalog-field-label" :for="`${fieldId}-minimum`">از</label>
            <input
              :id="`${fieldId}-minimum`"
              :value="minimum"
              class="catalog-price-input"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              placeholder="حداقل"
              :aria-describedby="`${fieldId}-price-note${priceError ? ` ${fieldId}-price-error` : ''}`"
              :aria-invalid="Boolean(priceError)"
              @focus="focusedPrice = 'minPriceToman'"
              @input="setPrice('minPriceToman', $event)"
              @blur="finishPrice('minPriceToman')"
            />
          </div>
          <div>
            <label class="catalog-field-label" :for="`${fieldId}-maximum`">تا</label>
            <input
              :id="`${fieldId}-maximum`"
              :value="maximum"
              class="catalog-price-input"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              placeholder="حداکثر"
              :aria-describedby="`${fieldId}-price-note${priceError ? ` ${fieldId}-price-error` : ''}`"
              :aria-invalid="Boolean(priceError)"
              @focus="focusedPrice = 'maxPriceToman'"
              @input="setPrice('maxPriceToman', $event)"
              @blur="finishPrice('maxPriceToman')"
            />
          </div>
        </div>
        <p
          v-if="priceError"
          :id="`${fieldId}-price-error`"
          class="catalog-field-error"
          role="status"
        >
          {{ priceError }}
        </p>
      </div>
    </details>

    <details v-if="brands.length" class="catalog-filter-group" open>
      <summary><span>برند محصول</span><ChevronDown :size="17" aria-hidden="true" /></summary>
      <div class="catalog-filter-group-body catalog-check-list">
        <label v-for="brand in brands" :key="brand" class="catalog-check-option">
          <input
            type="checkbox"
            :checked="modelValue.brands.includes(brand)"
            @change="toggleBrand(brand)"
          />
          <span>{{ brand }}</span>
        </label>
      </div>
    </details>

    <details class="catalog-filter-group" open>
      <summary><span>وضعیت موجودی</span><ChevronDown :size="17" aria-hidden="true" /></summary>
      <div class="catalog-filter-group-body catalog-check-list">
        <label
          v-for="option in availabilityOptions"
          :key="option.value"
          class="catalog-check-option"
        >
          <input
            type="checkbox"
            :checked="modelValue.availability.includes(option.value)"
            @change="toggleAvailability(option.value)"
          />
          <span>{{ option.label }}</span>
        </label>
      </div>
    </details>

    <details v-if="specificationFilters.length" class="catalog-filter-group" open>
      <summary><span>مشخصات فنی</span><ChevronDown :size="17" aria-hidden="true" /></summary>
      <div class="catalog-filter-group-body catalog-technical-fields">
        <fieldset v-for="filter in specificationFilters" :key="filter.key">
          <legend>{{ filter.label }}</legend>
          <div class="catalog-check-list">
            <label v-for="option in filter.options" :key="option" class="catalog-check-option">
              <input
                type="checkbox"
                :checked="modelValue.specifications[filter.key]?.includes(option) ?? false"
                @change="toggleSpecification(filter.key, option)"
              />
              <span>{{ option }}</span>
            </label>
          </div>
        </fieldset>
      </div>
    </details>
  </div>
</template>
