<script setup lang="ts">
import { Headset, Layers3, Truck, ScanLine } from 'lucide-vue-next'
import type { Service } from '~/types/home'
import { brand } from '~/data/home'
defineProps<{ services: Service[] }>()
const icons = { Headset, Layers3, Truck, ScanLine }
</script>

<template>
  <div class="service-highlights">
    <div class="service-list">
      <div v-for="service in services" :key="service.id" class="service-item">
        <component :is="icons[service.icon]" :size="27" :stroke-width="1.1" aria-hidden="true" />
        <h3>{{ service.title }}</h3>
        <p>{{ service.description }}</p>
      </div>
    </div>
    <p class="services-note">چشم‌انداز خدمات {{ brand.name }}؛ در حال آماده‌سازی</p>
  </div>
</template>
