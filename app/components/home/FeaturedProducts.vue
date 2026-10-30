<script setup lang="ts">
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
import type { Product } from '~/types/home'
import { useUiStore } from '~/stores/ui'
defineProps<{ products: Product[] }>()
const ui = useUiStore()
const expanded = ref(false)
const track = ref<HTMLElement | null>(null)
const move = (direction: number) =>
  track.value?.scrollBy({
    left: direction * 220,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  })
</script>

<template>
  <section
    id="products"
    class="products-section page-container editorial-section"
    aria-labelledby="products-title"
  >
    <UiSectionHeading
      id="products-title"
      title="محصولات منتخب"
      description="گزیده‌ای از مصالح و تجهیزات، برای ساختن فضاهایی ماندگار."
    >
      <UiBaseButton
        variant="dark"
        @click="ui.notify('فهرست کامل محصولات در مرحله بعد در دسترس قرار می‌گیرد.')"
        >مشاهده همه محصولات</UiBaseButton
      >
    </UiSectionHeading>
    <button
      class="mobile-section-link"
      type="button"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      {{ expanded ? 'نمایش کمتر' : 'مشاهده همه' }}<ArrowLeft :size="14" />
    </button>
    <div class="products-content">
      <div ref="track" class="product-grid" :class="{ 'product-grid--expanded': expanded }">
        <HomeProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
      <div class="product-arrows">
        <button type="button" aria-label="محصولات قبلی" @click="move(-1)">
          <ArrowLeft :size="17" /></button
        ><button type="button" aria-label="محصولات بعدی" @click="move(1)">
          <ArrowRight :size="17" />
        </button>
      </div>
      <p class="sample-note">محصولات و قیمت‌ها نمونه نمایشی هستند.</p>
    </div>
  </section>
</template>
