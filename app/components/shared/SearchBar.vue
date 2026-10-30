<script setup lang="ts">
import { Search, ArrowUpLeft, X } from 'lucide-vue-next'
import type { Category, Product } from '~/types/home'
import { useUiStore } from '~/stores/ui'

const props = defineProps<{ products: Product[]; categories: Category[] }>()
const ui = useUiStore()
const query = ref('')
const focused = ref(false)
const searchId = useId()
const normalize = (value: string) =>
  value.replace(/[ي]/g, 'ی').replace(/[ك]/g, 'ک').trim().toLocaleLowerCase('fa')
const results = computed(() => {
  const term = normalize(query.value)
  if (!term) return []
  return [
    ...props.products.map((p) => ({ id: p.id, name: p.name, kind: 'محصول' })),
    ...props.categories.map((c) => ({ id: c.id, name: c.name, kind: 'دسته‌بندی' })),
  ]
    .filter((item) => normalize(item.name).includes(term))
    .slice(0, 5)
})
const submit = () => {
  focused.value = false
  if (!query.value.trim()) {
    ui.notify('نام محصول یا دسته‌بندی مورد نظر را بنویسید.')
    return
  }
  ui.notify(
    results.value.length
      ? `${results.value.length.toLocaleString('fa-IR')} نتیجه در فهرست نمونه پیدا شد. جست‌وجوی کامل در مرحله بعد فعال می‌شود.`
      : 'در فهرست نمونه نتیجه‌ای پیدا نشد. محصولات بیشتری در آینده اضافه می‌شوند.',
  )
}
const select = (name: string) => {
  query.value = name
  focused.value = false
  ui.notify(`صفحه «${name}» در مرحله بعد در دسترس قرار می‌گیرد.`)
}
const onFocusOut = (event: FocusEvent) => {
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null))
    focused.value = false
}
</script>

<template>
  <form
    class="hero-search"
    role="search"
    aria-label="جست‌وجوی محصولات"
    @submit.prevent="submit"
    @focusout="onFocusOut"
    @keydown.esc="focused = false"
  >
    <button class="search-submit" type="submit" aria-label="جست‌وجو">
      <Search :size="23" :stroke-width="1.4" />
    </button>
    <div class="search-input-wrap">
      <label class="sr-only" :for="searchId">جست‌وجوی محصولات و دسته‌بندی‌ها</label>
      <input
        :id="searchId"
        v-model="query"
        type="search"
        placeholder="جست‌وجوی محصولات، برندها یا دسته‌بندی‌ها..."
        autocomplete="off"
        :aria-expanded="focused && !!query.trim()"
        :aria-controls="`${searchId}-results`"
        @focus="focused = true"
      />
      <button
        v-if="query"
        class="search-clear"
        type="button"
        aria-label="پاک کردن جست‌وجو"
        @click="query = ''"
      >
        <X :size="15" />
      </button>
    </div>
    <SharedLocationPicker compact />
    <div v-if="focused && query.trim()" :id="`${searchId}-results`" class="search-results">
      <p class="search-results-label">جست‌وجو در فهرست نمونه</p>
      <ul v-if="results.length">
        <li v-for="result in results" :key="result.id">
          <button type="button" @click="select(result.name)">
            <Search :size="15" /><span
              >{{ result.name }}<small>{{ result.kind }}</small></span
            ><ArrowUpLeft :size="16" />
          </button>
        </li>
      </ul>
      <p v-else class="search-empty">نتیجه‌ای یافت نشد؛ عبارت دیگری را امتحان کنید.</p>
    </div>
  </form>
</template>
