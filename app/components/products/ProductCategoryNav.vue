<script setup lang="ts">
import { LayoutGrid } from 'lucide-vue-next'
import type { CatalogCategory } from '~/types/catalog'

const { publicAsset } = usePublicAssets()
defineProps<{
  modelValue: string | null
  categories: readonly CatalogCategory[]
}>()
const emit = defineEmits<{ 'update:modelValue': [category: string | null] }>()
</script>

<template>
  <nav class="catalog-category-nav" aria-label="انتخاب دسته محصولات">
    <div class="catalog-category-scroll">
      <button
        class="catalog-category-chip"
        :class="{ 'is-active': modelValue === null }"
        type="button"
        :aria-pressed="modelValue === null"
        @click="emit('update:modelValue', null)"
      >
        <span class="catalog-category-all-icon"><LayoutGrid :size="21" aria-hidden="true" /></span>
        <span>همه محصولات</span>
      </button>
      <button
        v-for="category in categories"
        :key="category.id"
        class="catalog-category-chip"
        :class="{ 'is-active': modelValue === category.id }"
        type="button"
        :aria-pressed="modelValue === category.id"
        @click="emit('update:modelValue', category.id)"
      >
        <img
          :src="publicAsset(category.image)"
          alt=""
          width="48"
          height="48"
          loading="lazy"
          decoding="async"
        />
        <span>{{ category.name }}</span>
      </button>
    </div>
  </nav>
</template>
