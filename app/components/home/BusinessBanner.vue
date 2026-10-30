<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
import { businessPromotion } from '~/data/business'
const ui = useUiStore()
</script>

<template>
  <div class="business-banner">
    <img
      src="/images/business/partnership.webp"
      srcset="/images/business/partnership-640.webp 640w, /images/business/partnership-960.webp 960w, /images/business/partnership.webp 1920w"
      sizes="100vw"
      alt="همکاری نمایندگان تأمین‌کننده مصالح و شرکت ساختمانی در جلسه بررسی نمونه‌های مصالح و نقشه پروژه"
      width="1920"
      height="686"
      loading="lazy"
      decoding="async"
    />
    <div class="business-shade" />
    <div class="business-copy">
      <p class="eyebrow" dir="ltr">{{ businessPromotion.eyebrow }}</p>
      <h2>
        {{ businessPromotion.headline[0] }}<br /><span>{{ businessPromotion.headline[1] }}</span>
      </h2>
      <p>{{ businessPromotion.description }}</p>
      <div class="business-actions" role="group" aria-label="مسیرهای همکاری سازمانی">
        <UiBaseButton
          v-for="action in businessPromotion.actions"
          :key="action.id"
          :variant="action.id === 'supplier' ? 'bronze' : 'outline'"
          @click="ui.notify(action.notice)"
          >{{ action.label }}</UiBaseButton
        >
      </div>
      <span class="business-note">{{ businessPromotion.availabilityNote }}</span>
    </div>
  </div>
</template>
