<script setup lang="ts">
import { Minus, Plus } from 'lucide-vue-next'
import type { ProductOrdering } from '~/types/product-detail'
import {
  formatProductQuantity,
  stepProductQuantity,
  validateProductQuantity,
} from '~/utils/product-detail'
const props = defineProps<{ modelValue: string; ordering: ProductOrdering; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const fieldId = useId()
const validation = computed(() => validateProductQuantity(props.modelValue, props.ordering))
function step(direction: 1 | -1) {
  emit(
    'update:modelValue',
    formatProductQuantity(stepProductQuantity(props.modelValue, props.ordering, direction)),
  )
}
function format() {
  if (validation.value.valid)
    emit('update:modelValue', formatProductQuantity(validation.value.quantity))
}
</script>

<template>
  <div class="detail-quantity">
    <label :for="fieldId"
      >مقدار <span>({{ ordering.unit }})</span></label
    >
    <div class="detail-quantity-control">
      <button
        type="button"
        aria-label="افزایش مقدار"
        :disabled="disabled || (validation.valid && validation.quantity >= ordering.maximum)"
        @click="step(1)"
      >
        <Plus :size="18" aria-hidden="true" />
      </button>
      <input
        :id="fieldId"
        :value="modelValue"
        type="text"
        :inputmode="ordering.precision ? 'decimal' : 'numeric'"
        autocomplete="off"
        :disabled="disabled"
        :aria-invalid="!validation.valid"
        :aria-describedby="`${fieldId}-help${!validation.valid ? ` ${fieldId}-error` : ''}`"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="format"
      />
      <button
        type="button"
        aria-label="کاهش مقدار"
        :disabled="disabled || (validation.valid && validation.quantity <= ordering.minimum)"
        @click="step(-1)"
      >
        <Minus :size="18" aria-hidden="true" />
      </button>
    </div>
    <p :id="`${fieldId}-help`" class="detail-quantity-help">
      حداقل نمایشی {{ formatProductQuantity(ordering.minimum) }}؛ گام
      {{ formatProductQuantity(ordering.step) }} {{ ordering.unit }}
    </p>
    <p
      v-if="!validation.valid"
      :id="`${fieldId}-error`"
      class="detail-quantity-error"
      role="status"
    >
      {{ validation.message }}
    </p>
  </div>
</template>
