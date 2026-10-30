<script setup lang="ts">
defineProps<{ id?: string; eyebrow?: string; title: string; description?: string }>()
</script>

<template>
  <div class="section-heading">
    <p v-if="eyebrow" class="eyebrow" dir="ltr">{{ eyebrow }}</p>
    <h2 :id="id">{{ title }}</h2>
    <span class="heading-rule" aria-hidden="true" />
    <p v-if="description" class="section-description">{{ description }}</p>
    <slot />
  </div>
</template>
