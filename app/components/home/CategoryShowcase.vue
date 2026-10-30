<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import type { Category } from '~/types/home'
import { useUiStore } from '~/stores/ui'
defineProps<{ categories: Category[] }>()
const ui = useUiStore()
</script>

<template>
  <section id="categories" class="categories-section" aria-label="دسته‌بندی مصالح و تجهیزات">
    <div class="category-grid page-container">
      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
        class="category-card"
        @click="ui.notify(`محصولات «${category.name}» در مرحله بعد در دسترس قرار می‌گیرند.`)"
      >
        <div class="category-image">
          <img
            :src="category.image"
            :srcset="`${category.image.replace('.webp', '-320.webp')} 320w, ${category.image} 640w`"
            sizes="(max-width: 767px) 33vw, 14vw"
            :alt="category.name"
            width="640"
            height="480"
            loading="lazy"
            decoding="async"
          />
        </div>
        <span class="category-label"
          ><span>{{ category.name }}</span
          ><ArrowLeft :size="16" :stroke-width="1.3" aria-hidden="true"
        /></span>
      </button>
    </div>
  </section>
</template>
