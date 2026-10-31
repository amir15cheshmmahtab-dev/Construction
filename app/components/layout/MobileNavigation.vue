<script setup lang="ts">
import { House, ShoppingCart, ClipboardList, LayoutGrid } from 'lucide-vue-next'
const { cart, showCart } = useDemoCartNotice()
const route = useRoute()
const isHome = computed(() => route.path === '/')
const destination = (section: string) =>
  isHome.value ? section : section === '#main-content' ? '/' : `/${section}`
const activeSection = ref('home')
let observer: IntersectionObserver | undefined
function observeSections() {
  observer?.disconnect()
  activeSection.value = 'home'
  if (!isHome.value) return
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
}
onMounted(observeSections)
watch(
  () => route.path,
  async () => {
    await nextTick()
    observeSections()
  },
)
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <nav class="mobile-bottom-nav" aria-label="دسترسی سریع">
    <NuxtLink
      :to="destination('#main-content')"
      :class="{ active: isHome && activeSection === 'home' }"
      :aria-current="isHome && activeSection === 'home' ? 'page' : undefined"
      @click="activeSection = 'home'"
      ><House :size="22" :stroke-width="1.5" /><span>خانه</span></NuxtLink
    ><button type="button" @click="showCart">
      <ShoppingCart :size="22" :stroke-width="1.5" /><span
        >سبد خرید<span v-if="cart.itemCount">
          ({{ cart.itemCount.toLocaleString('fa-IR') }})</span
        ></span
      ></button
    ><NuxtLink
      :to="destination('#projects')"
      :class="{ active: isHome && activeSection === 'projects' }"
      :aria-current="isHome && activeSection === 'projects' ? 'location' : undefined"
      @click="activeSection = 'projects'"
      ><ClipboardList :size="22" :stroke-width="1.5" /><span>پروژه‌ها</span></NuxtLink
    ><NuxtLink
      :to="destination('#categories')"
      :class="{ active: isHome && activeSection === 'categories' }"
      :aria-current="isHome && activeSection === 'categories' ? 'location' : undefined"
      @click="activeSection = 'categories'"
      ><LayoutGrid :size="22" :stroke-width="1.5" /><span>دسته‌بندی‌ها</span></NuxtLink
    >
  </nav>
</template>
