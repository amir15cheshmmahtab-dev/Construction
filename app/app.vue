<script setup lang="ts">
import { brand } from '~/data/brand'

const { publicAsset } = usePublicAssets()

useHead({
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: publicAsset(brand.logo) },
    {
      rel: 'preload',
      href: publicAsset('/fonts/Vazirmatn-Variable.woff2'),
      as: 'font',
      type: 'font/woff2',
      crossorigin: '',
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
