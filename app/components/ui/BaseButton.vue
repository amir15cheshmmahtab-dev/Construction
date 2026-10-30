<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
withDefaults(
  defineProps<{ href?: string; variant?: 'bronze' | 'dark' | 'outline'; arrow?: boolean }>(),
  {
    href: undefined,
    variant: 'bronze',
    arrow: true,
  },
)
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :type="href ? undefined : 'button'"
    class="base-button"
    :class="`base-button--${variant}`"
  >
    <slot />
    <ArrowLeft v-if="arrow" :size="17" :stroke-width="1.5" aria-hidden="true" />
  </component>
</template>
