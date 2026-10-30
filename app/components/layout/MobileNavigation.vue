<script setup lang="ts">
import { House, ShoppingCart, ClipboardList, LayoutGrid } from 'lucide-vue-next'
import { useUiStore } from '~/stores/ui'
const ui = useUiStore()
const activeSection = ref('home')
let observer: IntersectionObserver | undefined
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        if (entry.isIntersecting)
          activeSection.value = ['categories', 'projects'].includes(entry.target.id)
            ? entry.target.id
            : 'home'
    },
    { rootMargin: '-10% 0px -60% 0px', threshold: 0 },
  )
  for (const id of ['main-content', 'categories', 'projects', 'products']) {
    const element = document.getElementById(id)
    if (element) observer.observe(element)
  }
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <nav class="mobile-bottom-nav" aria-label="دسترسی سریع">
    <a
      href="#main-content"
      :class="{ active: activeSection === 'home' }"
      :aria-current="activeSection === 'home' ? 'page' : undefined"
      @click="activeSection = 'home'"
      ><House :size="22" :stroke-width="1.5" /><span>خانه</span></a
    ><button type="button" @click="ui.notify('سبد خرید در مرحله بعد فعال می‌شود.')">
      <ShoppingCart :size="22" :stroke-width="1.5" /><span>سبد خرید</span></button
    ><a
      href="#projects"
      :class="{ active: activeSection === 'projects' }"
      @click="activeSection = 'projects'"
      ><ClipboardList :size="22" :stroke-width="1.5" /><span>پروژه‌ها</span></a
    ><a
      href="#categories"
      :class="{ active: activeSection === 'categories' }"
      @click="activeSection = 'categories'"
      ><LayoutGrid :size="22" :stroke-width="1.5" /><span>دسته‌بندی‌ها</span></a
    >
  </nav>
</template>
