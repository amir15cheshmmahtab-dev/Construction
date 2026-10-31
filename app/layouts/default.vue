<script setup lang="ts">
const route = useRoute()
const isProductDetail = computed(() => Boolean(route.meta.productDetail))
</script>

<template>
  <div
    class="site-shell"
    :class="{
      'site-shell--inner': route.path !== '/',
      'site-shell--product-detail': isProductDetail,
    }"
  >
    <a class="skip-link" href="#main-content">رفتن به محتوای اصلی</a>
    <LayoutAppHeader />
    <main id="main-content">
      <slot />
    </main>
    <LayoutAppFooter />
    <LayoutMobileNavigation v-if="!isProductDetail" />
    <SharedToastMessage />
  </div>
</template>

<style src="~/assets/css/inner-page.css"></style>
