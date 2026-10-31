<script setup lang="ts">
import type { CatalogProduct } from '~/types/catalog'
defineProps<{ products: CatalogProduct[] }>()
</script>

<template>
  <div class="catalog-grid">
    <HomeProductCard
      v-for="product in products"
      :key="product.id"
      :product="product"
      variant="catalog"
    />
  </div>
</template>
