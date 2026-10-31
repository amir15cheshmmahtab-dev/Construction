<script setup lang="ts">
import { Heart, ShoppingCart } from 'lucide-vue-next'
import type { Product } from '~/types/home'
import type { CatalogProduct } from '~/types/catalog'
import { formatToman } from '~/utils/format'
import { useUiStore } from '~/stores/ui'
const props = withDefaults(
  defineProps<{ product: Product | CatalogProduct; variant?: 'featured' | 'catalog' }>(),
  {
    variant: 'featured',
  },
)
const ui = useUiStore()
const catalogProduct = computed(() =>
  props.variant === 'catalog' && 'subcategoryId' in props.product ? props.product : null,
)
const availabilityLabel = computed(
  () =>
    ({ available: 'موجود', unavailable: 'ناموجود', unknown: 'نیازمند استعلام' })[
      props.product.availability
    ],
)
function requestCart() {
  ui.notify(
    catalogProduct.value && props.product.priceRial === null
      ? 'ثبت استعلام قیمت در مرحله بعد فعال می‌شود؛ درخواست واقعی ارسال نشده است.'
      : 'سبد خرید در مرحله بعد فعال می‌شود. این محصولات و قیمت‌ها صرفاً نمونه نمایشی هستند.',
  )
}
</script>

<template>
  <article class="product-card" :class="{ 'product-card--catalog': catalogProduct }">
    <div class="product-image-wrap">
      <img
        :src="product.image"
        :srcset="`${product.image.replace('.webp', '-320.webp')} 320w, ${product.image} 640w`"
        :sizes="
          catalogProduct
            ? '(max-width: 767px) 45vw, (max-width: 1023px) 30vw, 22vw'
            : '(max-width: 767px) 44vw, (max-width: 1023px) 158px, 18vw'
        "
        :alt="catalogProduct?.imageAlt ?? product.name"
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
      <div v-if="catalogProduct" class="catalog-card-meta">
        <span class="catalog-stock" :class="`catalog-stock--${product.availability}`"
          ><i aria-hidden="true" />{{ availabilityLabel }}</span
        >
        <span v-if="catalogProduct.brand" class="catalog-card-brand">{{
          catalogProduct.brand
        }}</span>
      </div>
      <div class="product-price">
        <span>{{ formatToman(product.priceRial) }}</span
        ><small v-if="product.priceRial !== null">تومان</small>
      </div>
      <span v-if="catalogProduct" class="catalog-card-unit">واحد فروش: {{ product.unit }}</span>
    </div>
    <button
      type="button"
      class="add-to-cart"
      :disabled="!!catalogProduct && product.availability === 'unavailable'"
      @click="requestCart"
    >
      <ShoppingCart :size="16" :stroke-width="1.6" aria-hidden="true" /><span>{{
        catalogProduct && product.priceRial === null ? 'استعلام قیمت' : 'افزودن به سبد'
      }}</span>
    </button>
  </article>
</template>
