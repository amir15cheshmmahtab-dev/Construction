<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { NuxtLink } from '#components'
const props = withDefaults(
  defineProps<{ href?: string; variant?: 'bronze' | 'dark' | 'outline'; arrow?: boolean }>(),
  {
    href: undefined,
    variant: 'bronze',
    arrow: true,
  },
)
const isInternalRoute = computed(() => props.href?.startsWith('/') && !props.href.startsWith('//'))
</script>

<template>
  <component
    :is="isInternalRoute ? NuxtLink : href ? 'a' : 'button'"
    :href="isInternalRoute ? undefined : href"
    :to="isInternalRoute ? href : undefined"
    :type="href ? undefined : 'button'"
    class="base-button"
    :class="`base-button--${variant}`"
  >
    <slot />
    <ArrowLeft v-if="arrow" :size="17" :stroke-width="1.5" aria-hidden="true" />
  </component>
</template>
