<script setup lang="ts">
import { brand, homepageData } from '~/data/home'

const { data } = useHomepageData()
const home = computed(() => data.value ?? homepageData)
const siteUrl = useSiteUrl()
const image = siteUrl('/images/hero/residence.webp')

useSeoMeta({
  title: `${brand.name} | همه‌چیز برای ساختن یک آینده بهتر`,
  description: `مصالح و تجهیزات ساختمانی، از اولین آجر تا آخرین جزئیات. محصولات و راهکارهای ساخت و بازسازی را در ${brand.name} کشف کنید.`,
  ogTitle: `${brand.name} | ${brand.tagline}`,
  ogDescription: 'همراه شما، از اولین آجر تا آخرین جزئیات.',
  ogType: 'website',
  ogLocale: 'fa_IR',
  ogImage: image,
  twitterCard: 'summary_large_image',
  themeColor: '#F7F6F2',
})
</script>

<template>
  <div class="homepage">
    <HomeHero :products="home.products" :categories="home.categories" />
    <HomeCategoryShowcase :categories="home.categories" />
    <div class="collections-surface">
      <HomeProjectShowcase :projects="home.projects" />
      <HomeFeaturedProducts :products="home.products" />
    </div>
    <section id="business" class="business-services" aria-label="راهکارهای خرید حرفه‌ای">
      <HomeBusinessBanner />
      <HomeServiceHighlights :services="home.services" />
    </section>
  </div>
</template>
