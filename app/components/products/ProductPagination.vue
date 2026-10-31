<script setup lang="ts">
import { ChevronRight, ChevronLeft } from 'lucide-vue-next'
import { CATALOG_PAGE_SIZES } from '~/utils/catalog'
import { formatNumber } from '~/utils/format'

const props = defineProps<{ page: number; totalPages: number; pageSize: number; total: number }>()
const emit = defineEmits<{ 'update:page': [value: number]; 'update:pageSize': [value: number] }>()
const sizeId = useId()
const pages = computed(() => Array.from({ length: props.totalPages }, (_, index) => index + 1))
</script>

<template>
  <div v-if="total" class="catalog-pagination-area">
    <nav class="catalog-pagination" aria-label="صفحه‌بندی محصولات">
      <button
        class="catalog-page-direction"
        type="button"
        :disabled="page === 1"
        aria-label="صفحه قبل"
        @click="emit('update:page', page - 1)"
      >
        <ChevronRight :size="18" aria-hidden="true" /><span>قبلی</span>
      </button>
      <button
        v-for="number in pages"
        :key="number"
        class="catalog-page-number"
        :class="{ 'is-current': number === page }"
        type="button"
        :aria-label="`صفحه ${formatNumber(number)}`"
        :aria-current="number === page ? 'page' : undefined"
        @click="emit('update:page', number)"
      >
        {{ formatNumber(number) }}
      </button>
      <button
        class="catalog-page-direction"
        type="button"
        :disabled="page === totalPages"
        aria-label="صفحه بعد"
        @click="emit('update:page', page + 1)"
      >
        <span>بعدی</span><ChevronLeft :size="18" aria-hidden="true" />
      </button>
    </nav>
    <div class="catalog-page-details">
      <span>صفحه {{ formatNumber(page) }} از {{ formatNumber(totalPages) }}</span>
      <label :for="sizeId">تعداد در هر صفحه</label>
      <select
        :id="sizeId"
        :value="pageSize"
        @change="emit('update:pageSize', Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="size in CATALOG_PAGE_SIZES" :key="size" :value="size">
          {{ formatNumber(size) }}
        </option>
      </select>
    </div>
  </div>
</template>
