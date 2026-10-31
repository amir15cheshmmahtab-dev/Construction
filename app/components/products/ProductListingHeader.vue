<script setup lang="ts">
import { ChevronLeft, Search, X } from 'lucide-vue-next'
import { formatNumber } from '~/utils/format'

defineProps<{ search: string; count: number; total: number }>()
const emit = defineEmits<{ 'update:search': [value: string]; submit: []; clear: [] }>()
const searchId = useId()
</script>

<template>
  <div class="catalog-introduction">
    <nav class="catalog-breadcrumb" aria-label="مسیر صفحه">
      <NuxtLink to="/">خانه</NuxtLink><ChevronLeft :size="14" aria-hidden="true" />
      <span aria-current="page">محصولات</span>
    </nav>
    <div class="catalog-intro-row">
      <div>
        <h1>تمام محصولات ساختمانی</h1>
        <p class="catalog-intro-copy">
          مصالح، تجهیزات و محصولات تخصصی ساختمان؛ برای انتخابی دقیق در هر مرحلهٔ پروژه.
        </p>
      </div>
      <div class="catalog-search-area">
        <form
          class="catalog-search"
          role="search"
          aria-label="جستجو در تمام محصولات"
          @submit.prevent="emit('submit')"
        >
          <Search :size="21" :stroke-width="1.5" aria-hidden="true" />
          <label class="sr-only" :for="searchId">جستجو در محصولات</label>
          <input
            :id="searchId"
            :value="search"
            type="search"
            autocomplete="off"
            maxlength="140"
            placeholder="نام محصول، برند یا کد محصول"
            @input="emit('update:search', ($event.target as HTMLInputElement).value)"
          />
          <button
            v-if="search"
            class="icon-button"
            type="button"
            aria-label="پاک کردن جستجوی محصولات"
            @click="emit('clear')"
          >
            <X :size="18" aria-hidden="true" />
          </button>
          <button v-else class="catalog-search-action" type="submit">جستجو</button>
        </form>
        <p class="catalog-intro-count">
          {{ formatNumber(count) }} نتیجه از {{ formatNumber(total) }} محصول نمونه
        </p>
      </div>
    </div>
    <p class="catalog-demo-note">
      فهرست نمایشی است؛ قیمت‌ها و موجودی نمونه‌اند و تصاویر، نمایش عمومی نوع محصول هستند.
    </p>
  </div>
</template>
