<script setup lang="ts">
import { Heart, ShoppingCart } from 'lucide-vue-next'
import type { Product } from '~/types/home'
import { formatToman } from '~/utils/format'
import { useUiStore } from '~/stores/ui'
defineProps<{ product: Product }>()
const ui = useUiStore()
</script>

<template>
  <article class="product-card">
    <div class="product-image-wrap">
      <img
        :src="product.image"
        :srcset="`${product.image.replace('.webp', '-320.webp')} 320w, ${product.image} 640w`"
        sizes="(max-width: 767px) 44vw, (max-width: 1023px) 158px, 18vw"
        :alt="product.name"
        width="640"
        height="640"
        loading="lazy"
        decoding="async"
      />
      <button
        class="favorite-button"
        :class="{ 'is-favorite': ui.favoriteIds.includes(product.id) }"
        type="button"
        :aria-label="`${ui.favoriteIds.includes(product.id) ? 'حذف از' : 'افزودن به'} علاقه‌مندی‌ها: ${product.name}`"
        :aria-pressed="ui.favoriteIds.includes(product.id)"
        @click="ui.toggleFavorite(product.id)"
      >
        <Heart :size="19" :stroke-width="1.6" aria-hidden="true" />
      </button>
    </div>
    <div class="product-info">
      <h3>{{ product.name }}</h3>
      <p>{{ product.spec }}</p>
      <div class="product-price">
        <span>{{ formatToman(product.priceRial) }}</span
        ><small v-if="product.priceRial !== null">تومان</small>
      </div>
    </div>
    <button
      type="button"
      class="add-to-cart"
      @click="
        ui.notify(
          'سبد خرید در مرحله بعد فعال می‌شود. این محصولات و قیمت‌ها صرفاً نمونه نمایشی هستند.',
        )
      "
    >
      <ShoppingCart :size="16" :stroke-width="1.6" aria-hidden="true" /><span>افزودن به سبد</span>
    </button>
  </article>
</template>
