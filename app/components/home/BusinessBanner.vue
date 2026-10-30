<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
const ui = useUiStore()
</script>

<template>
  <div class="business-banner">
    <img
      src="/images/business/commercial.webp"
      srcset="/images/business/commercial-640.webp 640w, /images/business/commercial.webp 1440w"
      sizes="100vw"
      alt="نمای یک ساختمان تجاری معاصر با جزئیات سنگ و فلز"
      width="1440"
      height="496"
      loading="lazy"
      decoding="async"
    />
    <div class="business-shade" />
    <div class="business-copy">
      <p class="eyebrow" dir="ltr">FOR BUSINESSES</p>
      <h2>خرید حرفه‌ای<br /><span>برای شرکت‌ها</span></h2>
      <p>راهکارهای ویژه برای پیمانکاران، سازندگان<br />و شرکت‌های ساختمانی</p>
      <UiBaseButton
        variant="bronze"
        @click="ui.notify('همکاری سازمانی و خدمات خرید عمده در حال برنامه‌ریزی است؛ ثبت درخواست هنوز فعال نیست.')"
      >آشنایی با همکاری سازمانی</UiBaseButton>
      <span class="business-note">خدمات سازمانی به‌زودی</span>
    </div>
  </div>
</template>
