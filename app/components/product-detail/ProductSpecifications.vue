<script setup lang="ts">
import type { ProductSpecificationGroup } from '~/types/product-detail'

const props = defineProps<{ groups: readonly ProductSpecificationGroup[] }>()
const specificationId = useId()
const visibleGroups = computed(() =>
  props.groups
    .map((group) => ({ ...group, items: group.items.filter((item) => item.value.trim()) }))
    .filter((group) => group.items.length),
)
</script>

<template>
  <div class="pd-specifications">
    <section
      v-for="group in visibleGroups"
      :key="group.id"
      class="pd-specification-group"
      :aria-labelledby="`${specificationId}-${group.id}`"
    >
      <h3 :id="`${specificationId}-${group.id}`">{{ group.title }}</h3>
      <dl>
        <div v-for="item in group.items" :key="item.key" class="pd-specification-row">
          <dt>{{ item.label }}</dt>
          <dd>{{ item.value }}</dd>
        </div>
      </dl>
    </section>
    <p v-if="!visibleGroups.length" class="pd-specifications-empty">
      مشخصات فنی تأییدشده‌ای برای این محصول درج نشده است.
    </p>
  </div>
</template>

<style scoped>
.pd-specifications {
  max-width: 920px;
}
.pd-specification-group + .pd-specification-group {
  margin-block-start: 28px;
}
.pd-specification-group h3 {
  margin-block-end: 13px;
  color: #766148;
  font-size: 13px;
  font-weight: 500;
}
.pd-specification-group dl {
  margin: 0;
  border-block-start: 1px solid var(--color-border);
}
.pd-specification-row {
  display: grid;
  grid-template-columns: minmax(150px, 0.9fr) minmax(0, 1.5fr);
  border-block-end: 1px solid var(--color-border);
}
.pd-specification-row dt,
.pd-specification-row dd {
  margin: 0;
  padding: 13px 17px;
  overflow-wrap: anywhere;
  font-size: 13px;
  line-height: 1.9;
}
.pd-specification-row dt {
  color: var(--text-secondary);
  background: #f0ede744;
}
.pd-specification-row dd {
  color: var(--text-primary);
}
.pd-specifications-empty {
  color: var(--text-secondary);
  font-size: 13px;
}
@media (max-width: 767px) {
  .pd-specification-group + .pd-specification-group {
    margin-block-start: 22px;
  }
  .pd-specification-group h3 {
    font-size: 12px;
  }
  .pd-specification-row {
    grid-template-columns: minmax(110px, 0.85fr) minmax(0, 1.15fr);
  }
  .pd-specification-row dt,
  .pd-specification-row dd {
    padding: 12px 10px;
    font-size: 12px;
  }
}
</style>
