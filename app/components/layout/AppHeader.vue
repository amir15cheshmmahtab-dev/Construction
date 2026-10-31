<script setup lang="ts">
import { Menu, X, ShoppingCart, UserRound, ArrowUpLeft } from 'lucide-vue-next'
import { navigation } from '~/data/home'
import { useUiStore } from '~/stores/ui'

const ui = useUiStore()
const { cart, showCart } = useDemoCartNotice()
const route = useRoute()
const destination = (href: string) =>
  href.startsWith('#') && route.path !== '/' ? `/${href}` : href
const drawer = ref<HTMLElement | null>(null)
const menuButton = ref<HTMLButtonElement | null>(null)
const feature = (label: string) => ui.notify(`بخش «${label}» در مرحله بعد در دسترس قرار می‌گیرد.`)
const isSection = (href: string) =>
  ['#products', '#projects', '#business', '#categories', '#about', '#contact'].includes(href)
const navigate = (event: MouseEvent, href: string, label: string) => {
  closeDrawer()
  if (
    (href === '/products' || (isSection(href) && route.path !== '/')) &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.altKey &&
    event.button === 0
  ) {
    event.preventDefault()
    void navigateTo(destination(href))
    return
  }
  if (href !== '/products' && !isSection(href)) {
    event.preventDefault()
    feature(label)
  }
}
const closeDrawer = () => {
  ui.closeMenu()
  menuButton.value?.focus()
}
const trapFocus = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeDrawer()
  if (event.key !== 'Tab') return
  const elements = drawer.value?.querySelectorAll<HTMLElement>('a, button')
  if (!elements?.length) return
  const first = elements[0]
  const last = elements[elements.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
watch(
  () => ui.menuOpen,
  async (open) => {
    if (!import.meta.client) return
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      await nextTick()
      drawer.value?.querySelector<HTMLElement>('button')?.focus()
    }
  },
)
onBeforeUnmount(() => {
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <header class="site-header" :class="{ 'site-header--menu-open': ui.menuOpen }">
    <div class="header-inner page-container">
      <SharedBrandLogo />
      <nav class="desktop-navigation" aria-label="ناوبری اصلی">
        <a
          v-for="item in navigation"
          :key="item.label"
          :href="destination(item.href)"
          :aria-current="
            item.href === '/products' && route.path.startsWith('/products') ? 'page' : undefined
          "
          @click="navigate($event, item.href, item.label)"
          >{{ item.label }}</a
        >
      </nav>
      <div class="header-actions">
        <SharedLocationPicker dark />
        <span class="header-divider" />
        <button
          class="account-button"
          type="button"
          aria-label="ورود و ثبت نام"
          @click="feature('حساب کاربری')"
        >
          <span>ورود / ثبت نام</span><UserRound :size="20" :stroke-width="1.4" aria-hidden="true" />
        </button>
        <span class="header-divider header-divider--last" />
        <button
          class="icon-button demo-cart-button"
          type="button"
          :aria-label="cart.itemCount ? `سبد نمونه، ${cart.itemCount} نوع محصول` : 'سبد خرید'"
          @click="showCart"
        >
          <ShoppingCart :size="21" :stroke-width="1.4" />
          <span v-if="cart.itemCount" class="demo-cart-count">{{
            cart.itemCount.toLocaleString('fa-IR')
          }}</span>
        </button>
        <button
          ref="menuButton"
          class="icon-button mobile-menu-button"
          type="button"
          aria-label="باز کردن منو"
          :aria-expanded="ui.menuOpen"
          aria-controls="mobile-drawer"
          @click="ui.toggleMenu()"
        >
          <Menu :size="25" :stroke-width="1.5" />
        </button>
      </div>
    </div>
    <Transition name="drawer">
      <div v-if="ui.menuOpen" class="drawer-overlay" @click.self="closeDrawer">
        <aside
          id="mobile-drawer"
          ref="drawer"
          class="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="فهرست اصلی"
          @keydown="trapFocus"
        >
          <div class="drawer-top">
            <SharedBrandLogo small /><button
              class="icon-button"
              type="button"
              aria-label="بستن منو"
              @click="closeDrawer"
            >
              <X :size="24" />
            </button>
          </div>
          <p class="eyebrow" dir="ltr">BUILD BETTER LIVES</p>
          <nav aria-label="فهرست موبایل">
            <a
              v-for="item in navigation"
              :key="item.label"
              :href="destination(item.href)"
              :aria-current="
                item.href === '/products' && route.path.startsWith('/products') ? 'page' : undefined
              "
              @click="navigate($event, item.href, item.label)"
              ><span>{{ item.label }}</span
              ><ArrowUpLeft :size="18" :stroke-width="1.3"
            /></a>
          </nav>
          <div class="drawer-location">
            <SharedLocationPicker />
            <p>همراه شما، از اولین آجر تا آخرین جزئیات.</p>
          </div>
        </aside>
      </div>
    </Transition>
  </header>
</template>
