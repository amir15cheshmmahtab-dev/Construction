<script setup lang="ts">
import { ArrowLeft, ArrowRight, Image, Maximize2, Minus, Plus, RotateCcw, X } from 'lucide-vue-next'
import type { ProductImage } from '~/types/product-detail'
import { formatNumber } from '~/utils/format'

const props = defineProps<{ images: readonly ProductImage[]; productName: string }>()
const images = computed(() => {
  const seen = new Set<string>()
  return props.images.filter((image) => {
    const src = image.src.trim()
    if (!src || seen.has(src)) return false
    seen.add(src)
    return true
  })
})
const activeIndex = ref(0)
const activeImage = computed(() => images.value[activeIndex.value] ?? images.value[0])
const dialog = ref<HTMLDialogElement | null>(null)
const viewport = ref<HTMLElement | null>(null)
const titleId = useId()
const zoom = ref(1)
let previousFocus: HTMLElement | null = null
let restoreScroll: (() => void) | null = null

function lockScroll() {
  if (restoreScroll) return
  const body = document.body
  const html = document.documentElement
  const previousBodyOverflow = body.style.overflow
  const previousHtmlOverflow = html.style.overflow
  const previousPadding = body.style.paddingInlineEnd
  const scrollbar = window.innerWidth - html.clientWidth
  if (scrollbar > 0) {
    body.style.paddingInlineEnd = `${Number.parseFloat(getComputedStyle(body).paddingInlineEnd) + scrollbar}px`
  }
  body.style.overflow = 'hidden'
  html.style.overflow = 'hidden'
  restoreScroll = () => {
    body.style.overflow = previousBodyOverflow
    html.style.overflow = previousHtmlOverflow
    body.style.paddingInlineEnd = previousPadding
    restoreScroll = null
  }
}

function finishClose() {
  restoreScroll?.()
  if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
  previousFocus = null
}

function close() {
  if (dialog.value?.open) dialog.value.close()
  else finishClose()
}

function resetZoom() {
  zoom.value = 1
  if (viewport.value) {
    viewport.value.scrollTop = 0
    viewport.value.scrollLeft = 0
  }
}

function open() {
  if (!activeImage.value || !dialog.value || dialog.value.open) return
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  resetZoom()
  dialog.value.showModal()
  lockScroll()
}

function selectImage(index: number) {
  activeIndex.value = index
  resetZoom()
}

function moveImage(direction: number) {
  selectImage((activeIndex.value + direction + images.value.length) % images.value.length)
}

function changeZoom(direction: number) {
  zoom.value = Math.min(3, Math.max(1, zoom.value + direction * 0.25))
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === '+' || event.key === '=') {
    event.preventDefault()
    changeZoom(1)
  } else if (event.key === '-') {
    event.preventDefault()
    changeZoom(-1)
  } else if (event.key === '0') {
    event.preventDefault()
    resetZoom()
  } else if (images.value.length > 1 && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault()
    moveImage(event.key === 'ArrowLeft' ? 1 : -1)
  }
}

watch(
  () => images.value.map((image) => image.src).join('|'),
  () => {
    activeIndex.value = 0
    resetZoom()
    close()
  },
)
onBeforeUnmount(() => {
  restoreScroll?.()
  if (dialog.value?.open) dialog.value.close()
})
</script>

<template>
  <div class="pd-gallery" :aria-label="`تصاویر ${productName}`">
    <button
      v-if="activeImage"
      class="pd-gallery-stage"
      type="button"
      aria-haspopup="dialog"
      :aria-label="`بزرگ‌نمایی تصویر ${productName}`"
      @click="open"
    >
      <img
        :key="activeImage.src"
        class="pd-gallery-main-image"
        :src="activeImage.src"
        :alt="activeImage.alt"
        :width="activeImage.width"
        :height="activeImage.height"
        fetchpriority="high"
        decoding="async"
      />
      <span class="pd-gallery-zoom-hint"
        ><Maximize2 :size="17" aria-hidden="true" />بزرگ‌نمایی تصویر</span
      >
    </button>
    <div v-else class="pd-gallery-placeholder">
      <Image :size="42" :stroke-width="1.2" aria-hidden="true" />
      <p>تصویر محصول در دسترس نیست.</p>
    </div>
    <div
      v-if="images.length > 1"
      class="pd-gallery-thumbnails"
      role="group"
      aria-label="انتخاب تصویر محصول"
    >
      <button
        v-for="(image, index) in images"
        :key="image.src"
        class="pd-gallery-thumbnail"
        :class="{ 'is-active': index === activeIndex }"
        type="button"
        :aria-pressed="index === activeIndex"
        :aria-label="`تصویر ${formatNumber(index + 1)}: ${image.alt}`"
        @click="selectImage(index)"
      >
        <img :src="image.src" alt="" width="88" height="88" loading="lazy" decoding="async" />
      </button>
    </div>
    <p class="pd-gallery-image-note">
      تصویر نمایشی محصول؛ جزئیات نهایی را با مشخصات کالا تطبیق دهید.
    </p>

    <Teleport to="body">
      <dialog
        ref="dialog"
        class="pd-lightbox"
        dir="rtl"
        :aria-labelledby="titleId"
        @cancel.prevent="close"
        @close="finishClose"
        @keydown="handleKeydown"
        @click="$event.target === dialog && close()"
      >
        <div class="pd-lightbox-inner">
          <header class="pd-lightbox-header">
            <div>
              <p>نمای محصول</p>
              <h2 :id="titleId">{{ productName }}</h2>
            </div>
            <button class="icon-button" type="button" aria-label="بستن تصویر بزرگ" @click="close">
              <X :size="23" aria-hidden="true" />
            </button>
          </header>
          <div
            ref="viewport"
            class="pd-lightbox-viewport"
            tabindex="0"
            aria-label="تصویر قابل بزرگ‌نمایی؛ برای جابه‌جایی از نوار پیمایش استفاده کنید"
          >
            <div
              class="pd-lightbox-canvas"
              :style="{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }"
            >
              <img
                v-if="activeImage"
                :src="activeImage.src"
                :alt="activeImage.alt"
                :width="activeImage.width"
                :height="activeImage.height"
                decoding="async"
              />
            </div>
          </div>
          <footer class="pd-lightbox-footer">
            <div class="pd-lightbox-zoom" role="group" aria-label="بزرگ‌نمایی تصویر">
              <button
                class="icon-button"
                type="button"
                aria-label="بزرگ‌نمایی بیشتر"
                :disabled="zoom >= 3"
                @click="changeZoom(1)"
              >
                <Plus :size="19" aria-hidden="true" />
              </button>
              <output class="pd-lightbox-percentage" aria-live="polite"
                >{{ formatNumber(zoom * 100) }}٪</output
              >
              <button
                class="icon-button"
                type="button"
                aria-label="بزرگ‌نمایی کمتر"
                :disabled="zoom <= 1"
                @click="changeZoom(-1)"
              >
                <Minus :size="19" aria-hidden="true" />
              </button>
              <button
                class="icon-button"
                type="button"
                aria-label="بازنشانی بزرگ‌نمایی"
                @click="resetZoom"
              >
                <RotateCcw :size="17" aria-hidden="true" />
              </button>
            </div>
            <div
              v-if="images.length > 1"
              class="pd-lightbox-navigation"
              role="group"
              aria-label="مرور تصاویر"
            >
              <button
                class="icon-button"
                type="button"
                aria-label="تصویر قبلی"
                @click="moveImage(-1)"
              >
                <ArrowRight :size="19" aria-hidden="true" />
              </button>
              <span aria-live="polite"
                >{{ formatNumber(activeIndex + 1) }} از {{ formatNumber(images.length) }}</span
              >
              <button
                class="icon-button"
                type="button"
                aria-label="تصویر بعدی"
                @click="moveImage(1)"
              >
                <ArrowLeft :size="19" aria-hidden="true" />
              </button>
            </div>
            <p class="pd-lightbox-keyboard-note">کلیدهای + و − برای بزرگ‌نمایی · Esc برای بستن</p>
          </footer>
        </div>
      </dialog>
    </Teleport>
  </div>
</template>

<style scoped>
.pd-gallery {
  min-width: 0;
}
.pd-gallery-stage,
.pd-gallery-placeholder {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 1.1;
  padding: clamp(24px, 3vw, 48px);
  border: 1px solid #e6e0d7;
  border-radius: 7px;
  background: #f2eee7;
  overflow: hidden;
}
.pd-gallery-stage {
  cursor: zoom-in;
}
.pd-gallery-main-image {
  width: 100%;
  height: 100%;
  min-height: 0;
  object-fit: contain;
  mix-blend-mode: multiply;
  animation: pd-gallery-reveal 200ms ease-out;
}
.pd-gallery-zoom-hint {
  position: absolute;
  inset-inline-end: 18px;
  inset-block-end: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 6px 12px;
  border: 1px solid #ded5c6;
  border-radius: 4px;
  background: #fffdf9ed;
  color: #79644d;
  font-size: 11px;
}
.pd-gallery-stage:hover .pd-gallery-zoom-hint {
  background: #fff;
  border-color: #a67c52;
}
.pd-gallery-thumbnails {
  display: flex;
  gap: 10px;
  padding-block-start: 14px;
  overflow-x: auto;
}
.pd-gallery-thumbnail {
  width: 84px;
  height: 84px;
  flex-shrink: 0;
  padding: 5px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: #f3efe8;
}
.pd-gallery-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
}
.pd-gallery-thumbnail.is-active {
  border-color: var(--color-bronze);
  box-shadow: inset 0 0 0 1px var(--color-bronze);
}
.pd-gallery-image-note {
  margin-block-start: 12px;
  color: var(--text-secondary);
  font-size: 10px;
  line-height: 1.9;
}
.pd-gallery-placeholder {
  gap: 12px;
  align-content: center;
  color: var(--text-secondary);
  font-size: 13px;
}
.pd-lightbox {
  position: fixed;
  inset: 0;
  width: min(calc(100% - 64px), 1200px);
  height: min(calc(100dvh - 64px), 960px);
  max-width: none;
  max-height: none;
  margin: auto;
  padding: 0;
  border: 1px solid #ddd4c6;
  border-radius: 7px;
  color: var(--text-primary);
  background: #f7f4ed;
  overflow: hidden;
}
.pd-lightbox::backdrop {
  background: #171c1cdd;
  backdrop-filter: blur(5px);
}
.pd-lightbox-inner {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.pd-lightbox-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
  padding: 17px 24px;
  border-block-end: 1px solid #e2dcd2;
  background: #fffaf5;
}
.pd-lightbox-header p {
  margin-block-end: 3px;
  color: #88755e;
  font-size: 10px;
}
.pd-lightbox-header h2 {
  font-size: 16px;
  font-weight: 550;
}
.pd-lightbox-viewport {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
}
.pd-lightbox-canvas {
  position: relative;
  min-width: 100%;
  min-height: 100%;
}
.pd-lightbox-canvas img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  padding: 24px;
  object-fit: contain;
  mix-blend-mode: multiply;
}
.pd-lightbox-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 10px 20px;
  flex-shrink: 0;
  padding: 10px 20px;
  border-block-start: 1px solid #e2dcd2;
  background: #fffaf5;
}
.pd-lightbox-zoom,
.pd-lightbox-navigation {
  display: flex;
  align-items: center;
  gap: 3px;
}
.pd-lightbox-zoom button:disabled {
  opacity: 0.3;
}
.pd-lightbox-percentage {
  min-width: 48px;
  color: #76583b;
  font-size: 12px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.pd-lightbox-navigation span {
  min-width: 48px;
  color: var(--text-secondary);
  text-align: center;
  font-size: 12px;
}
.pd-lightbox-keyboard-note {
  color: var(--text-secondary);
  font-size: 10px;
}
@keyframes pd-gallery-reveal {
  from {
    opacity: 0.65;
  }
  to {
    opacity: 1;
  }
}
@media (max-width: 767px) {
  .pd-gallery-stage,
  .pd-gallery-placeholder {
    aspect-ratio: 1.1;
    padding: 25px;
  }
  .pd-gallery-zoom-hint {
    inset-inline-end: 12px;
    inset-block-end: 12px;
    min-height: 36px;
    padding: 5px 9px;
    font-size: 10px;
  }
  .pd-gallery-image-note {
    font-size: 10px;
  }
  .pd-gallery-thumbnail {
    width: 72px;
    height: 72px;
  }
  .pd-lightbox {
    width: 100%;
    height: 100dvh;
    border: 0;
    border-radius: 0;
  }
  .pd-lightbox-header {
    padding: calc(14px + env(safe-area-inset-top)) 16px 14px;
    gap: 12px;
  }
  .pd-lightbox-header h2 {
    font-size: 14px;
  }
  .pd-lightbox-canvas img {
    padding: 16px;
  }
  .pd-lightbox-footer {
    justify-content: center;
    padding: 10px 12px calc(12px + env(safe-area-inset-bottom));
  }
  .pd-lightbox-keyboard-note {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .pd-gallery-main-image {
    animation: none;
  }
}
</style>
