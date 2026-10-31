<script setup lang="ts">
import type { NuxtError } from '#app'
import { ArrowLeft } from 'lucide-vue-next'
import { brand } from '~/data/brand'
const props = defineProps<{ error: NuxtError }>()
const missing = computed(() => props.error.statusCode === 404)
useSeoMeta({
  title: () => `${missing.value ? 'صفحه پیدا نشد' : 'خطا در نمایش صفحه'} | ${brand.name}`,
  robots: 'noindex, nofollow',
})
</script>

<template>
  <main class="error-page" dir="rtl">
    <SharedBrandLogo />
    <div class="error-content">
      <p class="error-code">{{ error.statusCode }}</p>
      <h1>{{ missing ? 'این صفحه را پیدا نکردیم.' : 'نمایش این صفحه با مشکل روبه‌رو شد.' }}</h1>
      <p>
        {{
          missing
            ? 'ممکن است نشانی محصول تغییر کرده باشد. از فهرست محصولات، انتخاب خود را ادامه دهید.'
            : 'دوباره تلاش کنید یا به فهرست محصولات برگردید.'
        }}
      </p>
      <button
        class="base-button base-button--bronze"
        type="button"
        @click="clearError({ redirect: '/products' })"
      >
        مشاهدهٔ محصولات<ArrowLeft :size="18" aria-hidden="true" />
      </button>
      <a class="error-home" href="/">بازگشت به خانه</a>
    </div>
  </main>
</template>

<style scoped>
.error-page {
  min-height: 100svh;
  width: min(calc(100% - 48px), 1280px);
  margin-inline: auto;
  padding-block: 34px;
}
.error-content {
  min-height: 70svh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  max-width: 650px;
  margin-inline: auto;
}
.error-code {
  color: var(--color-bronze);
  font-size: 70px;
  font-weight: 300;
  letter-spacing: 8px;
  line-height: 1.4;
}
h1 {
  font-size: clamp(25px, 3vw, 36px);
  font-weight: 550;
  margin-block: 22px 15px;
}
.error-content > p:not(.error-code) {
  font-size: 14px;
  line-height: 2.1;
  color: var(--text-secondary);
}
.base-button {
  margin-block-start: 30px;
  min-height: 48px;
}
.error-home {
  min-height: 44px;
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  font-size: 12px;
  margin-block-start: 10px;
}
</style>
