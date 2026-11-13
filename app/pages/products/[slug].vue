<script setup lang="ts">
import { ArrowRight, ChevronLeft, Heart, MapPin } from 'lucide-vue-next'
import { brand } from '~/data/brand'
import { catalogCategories } from '~/data/catalog-filters'
import { catalogRepository } from '~/repositories/catalog'
import {
  getProductDetail,
  getRelatedProducts,
  validateProductQuantity,
  formatProductQuantity,
} from '~/utils/product-detail'
import { getCatalogReturnPath, shouldResetProductScroll } from '~/utils/product-navigation'
import { useUiStore } from '~/stores/ui'
import { useCartStore } from '~/stores/cart'

definePageMeta({
  key: (route) => String(route.params.slug),
  productDetail: true,
  scrollToTop: (to, from) => shouldResetProductScroll(to.params.slug, from.params.slug),
})
const route = useRoute()
const ui = useUiStore()
const cart = useCartStore()
const foundProduct = catalogRepository.getProductBySlug(String(route.params.slug))
if (!foundProduct)
  throw createError({
    statusCode: 404,
    statusMessage: 'Product not found',
    message: 'محصولی با این نشانی در فهرست سیوان وجود ندارد.',
  })
const product = foundProduct
const detail = getProductDetail(product)
const category = catalogCategories.find((entry) => entry.id === product.categoryId)!
const subcategory = category.subcategories.find((entry) => entry.id === product.subcategoryId)!
const quantity = ref(formatProductQuantity(detail.ordering.minimum))
const validQuantity = computed(() => validateProductQuantity(quantity.value, detail.ordering))
const returnTo = computed(() => getCatalogReturnPath(route.query.from))
const related = getRelatedProducts(product)
const keyFacts = detail.specifications
  .filter((group) => group.id !== 'sale')
  .flatMap((group) => group.items)
  .slice(0, 4)
const siteUrl = useSiteUrl()
const canonical = siteUrl(`/products/${product.slug}`)
const image = siteUrl(product.image)
useSeoMeta({
  title: `${product.name} | ${brand.name}`,
  description: `${product.name}؛ ${product.spec}. مشاهده مشخصات، واحد فروش و اطلاعات خرید نمونه در سیوان.`,
  ogTitle: `${product.name} | ${brand.name}`,
  ogDescription: product.description,
  ogType: 'website',
  ogLocale: 'fa_IR',
  ogUrl: canonical,
  ogImage: image,
  ogImageAlt: product.imageAlt,
  ogImageWidth: 640,
  ogImageHeight: 640,
  twitterCard: 'summary_large_image',
})
useHead({
  link: [{ rel: 'canonical', href: canonical }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'خانه', item: siteUrl('/') },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'محصولات',
            item: siteUrl('/products'),
          },
          { '@type': 'ListItem', position: 3, name: product.name, item: canonical },
        ],
      }).replaceAll('<', '\\u003c'),
    },
  ],
})
async function selectVariant(slug: string) {
  if (!detail.variants?.options.some((option) => option.slug === slug) || slug === product.slug)
    return
  await navigateTo({ path: `/products/${slug}`, query: { from: returnTo.value } })
  await nextTick()
  document
    .querySelector<HTMLButtonElement>('.detail-variant-options [aria-pressed="true"]')
    ?.focus({ preventScroll: true })
}
function purchase() {
  if (product.availability === 'unavailable') return
  if (!validQuantity.value.valid) {
    ui.notify(validQuantity.value.message)
    return
  }
  if (product.priceRial === null) {
    ui.notify(
      `استعلام ${formatProductQuantity(validQuantity.value.quantity)} ${product.unit} از ${product.name}؛ ارسال درخواست واقعی در این نسخه فعال نیست.`,
    )
    return
  }
  const result = cart.addItem({
    productId: product.id,
    variantId: detail.variants?.selectedId,
    quantity: quantity.value,
  })
  ui.notify(
    result.success
      ? `${product.name} به سبد نمونهٔ محلی اضافه شد؛ مقدار این قلم در سبد: ${formatProductQuantity(result.item.quantity)} ${product.unit}. سفارش واقعی ثبت نشده است.`
      : result.message,
  )
}
</script>

<template>
  <article class="detail-page detail-container">
    <div class="detail-topline">
      <nav class="detail-breadcrumb" aria-label="مسیر محصول">
        <NuxtLink to="/">خانه</NuxtLink><ChevronLeft :size="12" aria-hidden="true" />
        <NuxtLink :to="returnTo">محصولات</NuxtLink><ChevronLeft :size="12" aria-hidden="true" />
        <NuxtLink :to="{ path: '/products', query: { category: product.categoryId } }">{{
          category.name
        }}</NuxtLink
        ><ChevronLeft :size="12" aria-hidden="true" />
        <NuxtLink
          :to="{
            path: '/products',
            query: { category: product.categoryId, subcategory: product.subcategoryId },
          }"
          >{{ subcategory.name }}</NuxtLink
        >
      </nav>
      <NuxtLink class="detail-back-link" :to="returnTo"
        ><ArrowRight :size="16" aria-hidden="true" />بازگشت به محصولات</NuxtLink
      >
    </div>
    <div class="detail-main">
      <ProductDetailProductGallery :images="detail.images" :product-name="product.name" />
      <div class="detail-overview">
        <div class="detail-product-context">
          <NuxtLink
            :to="{
              path: '/products',
              query: { category: product.categoryId, subcategory: product.subcategoryId },
            }"
            >{{ subcategory.name }}</NuxtLink
          ><span v-if="product.brand">برند {{ product.brand }}</span>
        </div>
        <div class="detail-title-row">
          <h1>{{ product.name }}</h1>
          <button
            class="detail-favorite"
            :class="{ 'is-favorite': ui.favoriteIds.includes(product.id) }"
            type="button"
            :aria-pressed="ui.favoriteIds.includes(product.id)"
            :aria-label="`${ui.favoriteIds.includes(product.id) ? 'حذف از' : 'افزودن به'} علاقه‌مندی‌ها: ${product.name}`"
            @click="ui.toggleFavorite(product.id)"
          >
            <Heart :size="23" :stroke-width="1.5" aria-hidden="true" />
          </button>
        </div>
        <p class="detail-short-description">{{ product.description }}</p>
        <p class="detail-product-code">
          کد محصول <bdi>{{ product.code }}</bdi>
        </p>
        <dl class="detail-key-facts">
          <div v-for="fact in keyFacts" :key="fact.key">
            <dt>{{ fact.label }}</dt>
            <dd>{{ fact.value }}</dd>
          </div>
        </dl>
        <ProductDetailProductPurchasePanel
          v-model:quantity="quantity"
          :detail="detail"
          @select-variant="selectVariant"
          @purchase="purchase"
        />
        <div class="detail-delivery-preview">
          <MapPin :size="18" aria-hidden="true" />
          <p>
            مقصد پروژه: <strong>{{ ui.location }}</strong
            ><span>هزینه و شرایط حمل با توجه به مقدار، مقصد و نوع محصول نیازمند تأیید است.</span>
          </p>
        </div>
      </div>
    </div>
    <p class="detail-demo-note">
      نسخهٔ نمایشی سیوان · تصاویر، نمایش عمومی نوع محصول‌اند؛ قیمت، مشخصات و موجودی نمونه‌اند.
    </p>
    <ProductDetailProductInformationSections :detail="detail" />
    <section v-if="related.length" class="detail-related" aria-labelledby="detail-related-title">
      <div class="detail-section-heading">
        <div>
          <p class="eyebrow" dir="ltr">COMPLETE YOUR PROJECT</p>
          <h2 id="detail-related-title">برای ادامهٔ همین پروژه</h2>
          <p>محصولات مرتبط از {{ category.name }}</p>
        </div>
        <NuxtLink :to="{ path: '/products', query: { category: product.categoryId } }"
          >همهٔ این دسته<ChevronLeft :size="16" aria-hidden="true"
        /></NuxtLink>
      </div>
      <ProductsProductGrid :products="related" />
    </section>
    <ProductDetailProductPurchaseBar
      :product="product"
      :quantity="
        validQuantity.valid ? formatProductQuantity(validQuantity.quantity) : 'مقدار نامعتبر'
      "
      :disabled="product.availability === 'unavailable' || !validQuantity.valid"
      @purchase="purchase"
    />
  </article>
</template>

<style src="~/assets/css/catalog.css"></style>
<style src="~/assets/css/product-detail.css"></style>
