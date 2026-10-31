<script setup lang="ts">
import { ArrowLeft, Check, ShoppingCart, PackageCheck, MessageSquareText } from 'lucide-vue-next'
import type { ProductDetail } from '~/types/product-detail'
import { calculateLineTotalRial, validateProductQuantity } from '~/utils/product-detail'
import { formatToman } from '~/utils/format'
const props = defineProps<{ detail: ProductDetail; quantity: string }>()
const emit = defineEmits<{
  'update:quantity': [value: string]
  selectVariant: [slug: string]
  purchase: []
}>()
const product = computed(() => props.detail.product)
const invalid = computed(
  () => !validateProductQuantity(props.quantity, props.detail.ordering).valid,
)
const subtotal = computed(() =>
  calculateLineTotalRial(product.value.priceRial, props.quantity, props.detail.ordering),
)
const availabilityLabel = computed(
  () =>
    ({
      available: 'موجود در فهرست نمونه',
      unavailable: 'ناموجود',
      unknown: 'موجودی نیازمند تأیید',
    })[product.value.availability],
)
const actionLabel = computed(() =>
  product.value.availability === 'unavailable'
    ? 'ناموجود'
    : product.value.priceRial === null
      ? 'استعلام قیمت'
      : 'افزودن به سبد خرید',
)
</script>

<template>
  <section class="detail-purchase" aria-label="انتخاب و خرید نمونه">
    <fieldset v-if="detail.variants" class="detail-variants">
      <legend>{{ detail.variants.label }}</legend>
      <div class="detail-variant-options">
        <button
          v-for="option in detail.variants.options"
          :key="option.id"
          type="button"
          :aria-pressed="option.id === detail.variants.selectedId"
          :class="{ 'is-selected': option.id === detail.variants.selectedId }"
          :aria-label="`${option.label}${option.availability === 'unavailable' ? '، ناموجود' : ''}${option.priceRial === null ? '، استعلام قیمت' : ''}`"
          @click="emit('selectVariant', option.slug)"
        >
          <Check
            v-if="option.id === detail.variants.selectedId"
            :size="14"
            aria-hidden="true"
          /><span>{{ option.label }}</span
          ><span v-if="option.availability === 'unavailable'" class="detail-variant-unavailable"
            >ناموجود</span
          >
        </button>
      </div>
      <p class="detail-variant-note">{{ detail.variants.note }}</p>
    </fieldset>
    <div class="detail-price-row">
      <div>
        <p class="detail-price-label">قیمت نمونه / هر {{ product.unit }}</p>
        <p class="detail-price">
          <strong>{{ formatToman(product.priceRial) }}</strong
          ><span v-if="product.priceRial !== null">تومان</span>
        </p>
      </div>
      <span class="detail-availability" :class="`detail-availability--${product.availability}`"
        ><i aria-hidden="true" />{{ availabilityLabel }}</span
      >
    </div>
    <div class="detail-order-row">
      <ProductDetailProductQuantitySelector
        :model-value="quantity"
        :ordering="detail.ordering"
        :disabled="product.availability === 'unavailable'"
        @update:model-value="emit('update:quantity', $event)"
      />
      <div v-if="subtotal !== null" class="detail-subtotal">
        <span>جمع نمونه</span>
        <p>
          <strong>{{ formatToman(subtotal) }}</strong> تومان
        </p>
      </div>
    </div>
    <button
      class="base-button base-button--bronze detail-purchase-action"
      type="button"
      :disabled="product.availability === 'unavailable' || invalid"
      @click="emit('purchase')"
    >
      <component
        :is="product.priceRial === null ? MessageSquareText : ShoppingCart"
        :size="20"
        aria-hidden="true"
      /><span>{{ actionLabel }}</span
      ><ArrowLeft :size="18" aria-hidden="true" />
    </button>
    <p class="detail-order-note">
      <PackageCheck :size="16" aria-hidden="true" /><span
        >سبد نمونهٔ محلی؛ قیمت و موجودی واقعی باید تأیید شوند.</span
      >
    </p>
    <details class="detail-order-rules">
      <summary>دربارهٔ مقدار و واحد فروش</summary>
      <p>{{ detail.ordering.note }}</p>
    </details>
  </section>
</template>
