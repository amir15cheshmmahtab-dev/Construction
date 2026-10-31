<script setup lang="ts">
import { ChevronDown, MapPin, Truck } from 'lucide-vue-next'
import type { ProductDetail } from '~/types/product-detail'

const props = defineProps<{ detail: ProductDetail }>()
const sectionsId = useId()
const activeTab = ref('description')
const expanded = ref(['description'])
const tablist = ref<HTMLElement | null>(null)
const isMobile = ref(false)
const sections = computed(() => [
  { id: 'description', title: 'معرفی محصول' },
  { id: 'specifications', title: 'مشخصات فنی' },
  { id: 'delivery', title: 'اطلاعات خرید و تحویل' },
  ...(props.detail.product.brand || props.detail.product.manufacturer
    ? [{ id: 'brand', title: 'برند و تولیدکننده' }]
    : []),
])

function selectTab(id: string) {
  activeTab.value = id
}

function handleTabKey(event: KeyboardEvent, index: number) {
  let next = index
  if (event.key === 'ArrowLeft') next = (index + 1) % sections.value.length
  else if (event.key === 'ArrowRight')
    next = (index - 1 + sections.value.length) % sections.value.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = sections.value.length - 1
  else return
  event.preventDefault()
  const section = sections.value[next]
  if (!section) return
  selectTab(section.id)
  tablist.value?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
}

function handleToggle(id: string, event: Event) {
  if (!isMobile.value) return
  const open = (event.target as HTMLDetailsElement).open
  if (open) {
    if (!expanded.value.includes(id)) expanded.value = [...expanded.value, id]
    activeTab.value = id
  } else {
    expanded.value = expanded.value.filter((value) => value !== id)
  }
}

let media: MediaQueryList | null = null
function syncMedia() {
  isMobile.value = media?.matches ?? false
}
onMounted(() => {
  media = window.matchMedia('(max-width: 767px)')
  syncMedia()
  media.addEventListener('change', syncMedia)
})
onBeforeUnmount(() => media?.removeEventListener('change', syncMedia))
watch(
  () => props.detail.product.id,
  () => {
    activeTab.value = 'description'
    expanded.value = ['description']
  },
)
</script>

<template>
  <section class="pd-information" aria-label="اطلاعات تکمیلی محصول">
    <div
      ref="tablist"
      class="pd-information-tabs"
      role="tablist"
      aria-label="اطلاعات محصول"
      aria-orientation="horizontal"
    >
      <button
        v-for="(section, index) in sections"
        :id="`${sectionsId}-tab-${section.id}`"
        :key="section.id"
        class="pd-information-tab"
        type="button"
        role="tab"
        :aria-selected="activeTab === section.id"
        :aria-controls="`${sectionsId}-panel-${section.id}`"
        :tabindex="activeTab === section.id ? 0 : -1"
        @click="selectTab(section.id)"
        @keydown="handleTabKey($event, index)"
      >
        {{ section.title }}
      </button>
    </div>

    <div class="pd-information-panels">
      <details
        v-for="section in sections"
        :key="section.id"
        class="pd-information-section"
        :class="{ 'is-active': activeTab === section.id }"
        :open="isMobile ? expanded.includes(section.id) : activeTab === section.id"
        @toggle="handleToggle(section.id, $event)"
      >
        <summary :id="`${sectionsId}-summary-${section.id}`">
          {{ section.title }}<ChevronDown :size="18" aria-hidden="true" />
        </summary>
        <div
          :id="`${sectionsId}-panel-${section.id}`"
          class="pd-information-panel"
          :role="isMobile ? undefined : 'tabpanel'"
          :aria-labelledby="`${sectionsId}-${isMobile ? 'summary' : 'tab'}-${section.id}`"
          :tabindex="isMobile ? undefined : 0"
        >
          <template v-if="section.id === 'description'">
            <div
              v-for="description in detail.descriptionSections"
              :key="description.id"
              class="pd-description-block"
            >
              <h3>{{ description.title }}</h3>
              <p v-for="(paragraph, index) in description.paragraphs" :key="index">
                {{ paragraph }}
              </p>
            </div>
          </template>
          <ProductDetailProductSpecifications
            v-else-if="section.id === 'specifications'"
            :groups="detail.specifications"
          />
          <template v-else-if="section.id === 'delivery'">
            <div class="pd-delivery-destination">
              <div>
                <MapPin :size="19" :stroke-width="1.5" aria-hidden="true" /><span>مقصد پروژه</span>
              </div>
              <SharedLocationPicker />
            </div>
            <div class="pd-delivery-copy">
              <Truck :size="26" :stroke-width="1.3" aria-hidden="true" />
              <div>
                <h3>هماهنگی ارسال متناسب با پروژه</h3>
                <p>
                  محدوده آغاز فعالیت سیوان تهران است. روش ارسال و هزینه حمل، پس از تأیید مقدار
                  سفارش، مقصد و نوع محصول مشخص می‌شود.
                </p>
                <p>
                  در این نسخه، هزینه و زمان تحویل محاسبه نمی‌شود. امکان تأمین، وسیله حمل و شرایط
                  تخلیه باید پیش از خرید نهایی تأیید شوند.
                </p>
              </div>
            </div>
            <p class="pd-ordering-note">{{ detail.ordering.note }}</p>
          </template>
          <template v-else-if="section.id === 'brand'">
            <h3 class="pd-brand-heading">اطلاعات درج‌شده برای محصول</h3>
            <dl class="pd-brand-information">
              <div v-if="detail.product.brand">
                <dt>برند محصول</dt>
                <dd>{{ detail.product.brand }}</dd>
              </div>
              <div v-if="detail.product.manufacturer">
                <dt>تولیدکننده</dt>
                <dd>{{ detail.product.manufacturer }}</dd>
              </div>
              <div v-if="detail.product.code">
                <dt>کد محصول در سیوان</dt>
                <dd dir="ltr">{{ detail.product.code }}</dd>
              </div>
            </dl>
            <p class="pd-brand-note">
              اطلاعات ضمانت، مبدأ ساخت یا مدارک فنی فقط پس از تأیید به مشخصات محصول اضافه می‌شوند.
            </p>
          </template>
        </div>
      </details>
    </div>
    <p class="pd-information-demo-note">
      توضیحات و مشخصات این صفحه نمونهٔ نمایشی‌اند؛ اطلاعات نهایی محصول و شرایط خرید باید پیش از
      سفارش تأیید شوند.
    </p>
  </section>
</template>

<style scoped>
.pd-information {
  min-width: 0;
}
.pd-information-tabs {
  display: flex;
  gap: 35px;
  border-block-end: 1px solid #dcd4c8;
}
.pd-information-tab {
  position: relative;
  min-height: 60px;
  padding: 15px 1px;
  color: var(--text-secondary);
  font-size: 14px;
  white-space: nowrap;
}
.pd-information-tab::after {
  position: absolute;
  inset-inline: 0;
  inset-block-end: -1px;
  height: 2px;
  background: var(--color-bronze);
  content: '';
  transform: scaleX(0);
  transition: transform 160ms;
}
.pd-information-tab[aria-selected='true'] {
  color: #795632;
  font-weight: 550;
}
.pd-information-tab[aria-selected='true']::after {
  transform: scaleX(1);
}
.pd-information-section {
  display: none;
}
.pd-information-section.is-active {
  display: block;
}
.pd-information-section > summary {
  display: none;
}
.pd-information-panel {
  padding-block: 30px 10px;
}
.pd-description-block {
  max-width: 88ch;
}
.pd-description-block + .pd-description-block {
  margin-block-start: 25px;
}
.pd-description-block h3,
.pd-delivery-copy h3,
.pd-brand-heading {
  margin-block-end: 8px;
  font-size: 15px;
  font-weight: 550;
}
.pd-description-block p,
.pd-delivery-copy p {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 2.2;
}
.pd-description-block p + p,
.pd-delivery-copy p + p {
  margin-block-start: 8px;
}
.pd-delivery-destination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  max-width: 530px;
  padding: 12px 16px;
  border: 1px solid #e0d7c9;
  border-radius: 5px;
  background: #f4f0e8;
}
.pd-delivery-destination > div {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #7e684f;
  font-size: 13px;
}
.pd-delivery-copy {
  display: flex;
  gap: 15px;
  align-items: flex-start;
  max-width: 90ch;
  margin-block-start: 25px;
}
.pd-delivery-copy > svg {
  flex-shrink: 0;
  margin-block-start: 2px;
  color: #a07c56;
}
.pd-ordering-note {
  max-width: 85ch;
  margin-block-start: 20px;
  color: #7b6b57;
  font-size: 12px;
  line-height: 2;
}
.pd-brand-information {
  max-width: 650px;
  margin: 17px 0 0;
  border-block-start: 1px solid var(--color-border);
}
.pd-brand-information > div {
  display: grid;
  grid-template-columns: minmax(130px, 1fr) minmax(0, 1.5fr);
  gap: 20px;
  border-block-end: 1px solid var(--color-border);
  padding: 12px 0;
  font-size: 13px;
}
.pd-brand-information dt {
  color: var(--text-secondary);
}
.pd-brand-information dd {
  margin: 0;
  overflow-wrap: anywhere;
}
.pd-brand-information dd[dir='ltr'] {
  text-align: start;
}
.pd-brand-note {
  margin-block-start: 18px;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 2;
}
.pd-information-demo-note {
  margin-block-start: 28px;
  padding-inline-start: 11px;
  border-inline-start: 2px solid #a67c5244;
  color: #82786a;
  font-size: 11px;
  line-height: 2;
}
@media (max-width: 767px) {
  .pd-information-tabs {
    display: none;
  }
  .pd-information-panels {
    border-block-start: 1px solid #ddd5c9;
  }
  .pd-information-section,
  .pd-information-section.is-active {
    display: block;
    border-block-end: 1px solid #ddd5c9;
  }
  .pd-information-section > summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    min-height: 61px;
    padding-block: 15px;
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 500;
    list-style: none;
    cursor: pointer;
  }
  .pd-information-section > summary::-webkit-details-marker {
    display: none;
  }
  .pd-information-section > summary svg {
    color: #9a7955;
    transition: transform 160ms;
  }
  .pd-information-section[open] > summary svg {
    transform: rotate(180deg);
  }
  .pd-information-panel {
    padding-block: 4px 23px;
  }
  .pd-description-block + .pd-description-block {
    margin-block-start: 21px;
  }
  .pd-description-block h3,
  .pd-delivery-copy h3,
  .pd-brand-heading {
    font-size: 13px;
  }
  .pd-description-block p,
  .pd-delivery-copy p {
    font-size: 12px;
    line-height: 2.15;
  }
  .pd-delivery-destination {
    padding: 8px 11px;
  }
  .pd-delivery-destination > div {
    font-size: 12px;
    gap: 7px;
  }
  .pd-delivery-copy {
    gap: 11px;
    margin-block-start: 20px;
  }
  .pd-delivery-copy > svg {
    width: 23px;
    height: 23px;
  }
  .pd-brand-information > div {
    grid-template-columns: minmax(100px, 0.9fr) minmax(0, 1.1fr);
    gap: 12px;
    font-size: 12px;
  }
  .pd-brand-note,
  .pd-ordering-note {
    font-size: 11px;
  }
  .pd-information-demo-note {
    margin-block-start: 20px;
    font-size: 10px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .pd-information-tab::after,
  .pd-information-section > summary svg {
    transition: none;
  }
}
</style>
