<script setup lang="ts">
import { Heart, ShoppingCart } from 'lucide-vue-next'
import type { Product } from '~/types/home'
import type { CatalogProduct } from '~/types/catalog'
import { formatToman } from '~/utils/format'
import { useUiStore } from '~/stores/ui'
import { useCartStore } from '~/stores/cart'
import { getCanonicalCardProduct, getCatalogReturnPath } from '~/utils/product-navigation'
import { getProductOrdering } from '~/utils/product-detail'
const props = withDefaults(
  defineProps<{ product: Product | CatalogProduct; variant?: 'featured' | 'catalog' }>(),
  {
    variant: 'featured',
  },
)
const ui = useUiStore()
const cart = useCartStore()
const route = useRoute()
const canonicalProduct = computed(() => getCanonicalCardProduct(props.product))
const favoriteId = computed(() => canonicalProduct.value?.id ?? props.product.id)
const detailLink = computed(() => ({
  path: `/products/${canonicalProduct.value?.slug ?? props.product.slug}`,
  query: {
    from: getCatalogReturnPath(route.path === '/products' ? route.fullPath : route.query.from),
  },
}))
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
  const selectedProduct = canonicalProduct.value
  if (selectedProduct && selectedProduct.priceRial !== null) {
    const result = cart.addItem({
      productId: selectedProduct.id,
      quantity: getProductOrdering(selectedProduct).minimum,
    })
    ui.notify(
      result.success
        ? 'محصول به سبد نمونهٔ محلی اضافه شد؛ سفارش واقعی ثبت نشده است.'
        : result.message,
    )
    return
  }
  ui.notify(
    selectedProduct?.priceRial === null
      ? 'ثبت استعلام قیمت در مرحله بعد فعال می‌شود؛ درخواست واقعی ارسال نشده است.'
      : 'این محصول در فهرست نمایشی پیدا نشد؛ چیزی به سبد اضافه نشده است.',
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
      <NuxtLink
        v-if="canonicalProduct"
        class="product-image-link"
        :to="detailLink"
        :aria-label="`مشاهدهٔ ${product.name}`"
      />
      <button
        class="favorite-button"
        :class="{ 'is-favorite': ui.favoriteIds.includes(favoriteId) }"
        type="button"
        :aria-label="`${ui.favoriteIds.includes(favoriteId) ? 'حذف از' : 'افزودن به'} علاقه‌مندی‌ها: ${product.name}`"
        :aria-pressed="ui.favoriteIds.includes(favoriteId)"
        @click="ui.toggleFavorite(favoriteId)"
      >
        <Heart :size="19" :stroke-width="1.6" aria-hidden="true" />
      </button>
    </div>
    <div class="product-info">
      <h3>
        <NuxtLink v-if="canonicalProduct" :to="detailLink">{{ product.name }}</NuxtLink
        ><template v-else>{{ product.name }}</template>
      </h3>
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

<style scoped>
.product-image-link {
  position: absolute;
  inset: 0;
  border-radius: inherit;
}
.product-image-link:focus-visible {
  outline-offset: -4px;
}
.favorite-button {
  z-index: 1;
}
.product-info h3 a:hover {
  color: var(--color-bronze-action);
}
</style>
