<script setup lang="ts">
import { brand } from '~/data/home'
defineProps<{ light?: boolean; small?: boolean }>()
</script>

<template>
  <NuxtLink
    class="brand"
    :class="{ 'brand--light': light, 'brand--small': small }"
    to="/"
    :aria-label="`${brand.name}، صفحه اصلی`"
  >
    <img :src="brand.logo" alt="" width="48" height="52" class="brand-mark" />
    <span>{{ brand.name }}</span>
  </NuxtLink>
</template>
