<script setup lang="ts">
import { brand } from '~/data/home'
defineProps<{ light?: boolean; small?: boolean }>()
const { publicAsset } = usePublicAssets()
</script>

<template>
  <a
    class="brand"
    :class="{ 'brand--light': light, 'brand--small': small }"
    href="#"
    :aria-label="`${brand.name}، صفحه اصلی`"
  >
    <img :src="publicAsset(brand.logo)" alt="" width="48" height="52" class="brand-mark" />
    <span>{{ brand.name }}</span>
  </a>
</template>
