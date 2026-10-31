<script setup lang="ts">
import { ShoppingCart, MessageSquareText } from 'lucide-vue-next'
import type { CatalogProduct } from '~/types/catalog'
import { formatToman } from '~/utils/format'
defineProps<{ product: CatalogProduct; quantity: string; disabled: boolean }>()
const emit = defineEmits<{ purchase: [] }>()
</script>

<template>
  <aside class="detail-mobile-purchase" aria-label="خرید سریع محصول">
    <div class="detail-mobile-price">
      <p>
        {{ formatToman(product.priceRial) }} <small v-if="product.priceRial !== null">تومان</small>
      </p>
      <span>{{ quantity }} {{ product.unit }} · قیمت هر {{ product.unit }}</span>
    </div>
    <button
      class="base-button base-button--bronze"
      type="button"
      :disabled="disabled"
      @click="emit('purchase')"
    >
      <component
        :is="product.priceRial === null ? MessageSquareText : ShoppingCart"
        :size="18"
        aria-hidden="true"
      />{{
        product.availability === 'unavailable'
          ? 'ناموجود'
          : product.priceRial === null
            ? 'استعلام قیمت'
            : 'افزودن به سبد'
      }}
    </button>
  </aside>
</template>
