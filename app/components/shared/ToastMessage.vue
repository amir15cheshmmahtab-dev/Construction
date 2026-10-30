<script setup lang="ts">
import { Info, X } from 'lucide-vue-next'
import { useUiStore } from '~/stores/ui'
const ui = useUiStore()
let timeout: ReturnType<typeof setTimeout> | undefined
watch(
  () => ui.toast,
  (message) => {
    clearTimeout(timeout)
    if (message) timeout = setTimeout(() => ui.dismissToast(), 6500)
  },
)
onBeforeUnmount(() => clearTimeout(timeout))
</script>

<template>
  <div class="toast-region" aria-live="polite" aria-atomic="true">
    <Transition name="toast"
      ><div v-if="ui.toast" class="toast-message" role="status">
        <Info :size="20" :stroke-width="1.5" aria-hidden="true" />
        <p>{{ ui.toast }}</p>
        <button type="button" aria-label="بستن پیام" @click="ui.dismissToast()">
          <X :size="18" />
        </button></div
    ></Transition>
  </div>
</template>
