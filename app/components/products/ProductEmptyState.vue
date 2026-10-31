<script setup lang="ts">
import { SearchX } from 'lucide-vue-next'
const emit = defineEmits<{ reset: [] }>()
</script>

<template>
  <div class="catalog-empty-state" role="status">
    <SearchX :size="40" :stroke-width="1.2" aria-hidden="true" />
    <h3>محصولی با این مشخصات پیدا نکردیم.</h3>
    <p>فیلترها را تغییر دهید یا جستجوی دیگری انجام دهید.</p>
    <UiBaseButton @click="emit('reset')">حذف فیلترها و جستجو</UiBaseButton>
  </div>
</template>
