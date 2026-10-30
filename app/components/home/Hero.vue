<script setup lang="ts">
import type { Category, Product } from '~/types/home'
defineProps<{ products: Product[]; categories: Category[] }>()
</script>

<template>
  <section class="home-hero" aria-labelledby="hero-title">
    <picture class="hero-picture">
      <source
        srcset="
          /images/hero/residence-640.webp  640w,
          /images/hero/residence-960.webp  960w,
          /images/hero/residence.webp     1920w
        "
        sizes="100vw"
        type="image/webp"
      />
      <img
        src="/images/hero/residence.webp"
        alt="خانه‌ای معاصر با نمای سنگ و بتن و نور گرم معماری در میان درختان"
        width="1920"
        height="768"
        fetchpriority="high"
        decoding="async"
      />
    </picture>
    <div class="hero-shade" />
    <div class="hero-content page-container">
      <div class="hero-copy">
        <div class="hero-eyebrow">
          <span dir="ltr">BUILD<br />BETTER<br />LIVES</span><i aria-hidden="true" />
        </div>
        <h1 id="hero-title">همه‌چیز برای<br /><span>ساختن یک آینده بهتر</span></h1>
        <p>تأمین کامل مصالح و تجهیزات ساختمانی<br />با بهترین کیفیت و قیمت</p>
        <UiBaseButton class="hero-cta" href="#projects">شروع کنید</UiBaseButton>
      </div>
      <SharedSearchBar :products="products" :categories="categories" />
    </div>
    <span class="hero-bottom-caption" dir="ltr">A BETTER FOUNDATION FOR TOMORROW</span>
  </section>
</template>
