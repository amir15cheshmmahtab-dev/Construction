<script setup lang="ts">
import { ChevronDown, MapPin, Check, X } from 'lucide-vue-next'
import { useUiStore } from '~/stores/ui'
import { brand } from '~/data/home'

defineProps<{ dark?: boolean; compact?: boolean }>()
const ui = useUiStore()
const dialog = ref<HTMLDialogElement | null>(null)
const open = () => dialog.value?.showModal()
const close = () => dialog.value?.close()
const select = () => {
  ui.selectLocation('تهران')
  close()
}
</script>

<template>
  <button
    class="location-button"
    :class="{ 'location-button--dark': dark, 'location-button--compact': compact }"
    type="button"
    aria-haspopup="dialog"
    @click="open"
  >
    <MapPin :size="16" :stroke-width="1.5" aria-hidden="true" />
    <span>{{ ui.location }}</span>
    <ChevronDown :size="13" aria-hidden="true" />
  </button>
  <Teleport to="body">
    <dialog
      ref="dialog"
      class="location-dialog"
      aria-label="انتخاب شهر"
      @click="$event.target === dialog && close()"
    >
      <div class="dialog-inner">
        <button
          class="icon-button dialog-close"
          type="button"
          aria-label="بستن انتخاب شهر"
          @click="close"
        >
          <X :size="21" />
        </button>
        <MapPin class="dialog-symbol" :size="30" :stroke-width="1.3" />
        <h2>از کجا می‌سازید؟</h2>
        <p>برای نمایش اطلاعات متناسب با محل پروژه، شهر خود را انتخاب کنید.</p>
        <button type="button" class="city-option" @click="select">
          <span>تهران</span><Check :size="18" />
        </button>
        <p class="dialog-note">
          {{ brand.name }} از تهران آغاز می‌کند؛ شهرهای دیگر در آینده اضافه می‌شوند.
        </p>
      </div>
    </dialog>
  </Teleport>
</template>
