<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
import { businessPromotion } from '~/data/business'
const ui = useUiStore()
const { publicAsset, imageSrcset } = usePublicAssets()
</script>

<template>
  <div class="business-banner">
    <img
      :src="publicAsset(businessPromotion.image.src)"
      :srcset="imageSrcset(businessPromotion.image.src, businessPromotion.image.widths)"
      sizes="100vw"
      :alt="businessPromotion.image.alt"
      :width="businessPromotion.image.width"
      :height="businessPromotion.image.height"
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
