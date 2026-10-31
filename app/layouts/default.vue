<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div class="site-shell" :class="{ 'site-shell--inner': route.path !== '/' }">
    <a class="skip-link" href="#main-content">رفتن به محتوای اصلی</a>
    <LayoutAppHeader />
    <main id="main-content">
      <slot />
    </main>
    <LayoutAppFooter />
    <LayoutMobileNavigation />
    <SharedToastMessage />
  </div>
</template>
