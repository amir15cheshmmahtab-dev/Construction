<script setup lang="ts">
import { brand } from '~/data/brand'
import { catalogCategories } from '~/data/catalog-filters'
const catalog = useProductCatalog()
const filterDrawerOpen = ref(false)
const siteUrl = useSiteUrl()
const canonical = siteUrl('/products')

useSeoMeta({
  title: `تمام محصولات ساختمانی | ${brand.name}`,
  description:
    'انتخاب مصالح، آهن‌آلات، سنگ و سرامیک، تجهیزات بهداشتی، روشنایی، در و پنجره و ابزار؛ با جستجو و فیلتر مشخصات در سیوان.',
  ogTitle: `تمام محصولات ساختمانی | ${brand.name}`,
  ogDescription: 'محصول مناسب پروژهٔ خود را با مقایسهٔ مشخصات و فیلترهای دقیق پیدا کنید.',
  ogType: 'website',
  ogLocale: 'fa_IR',
})
useHead({ link: [{ rel: 'canonical', href: canonical }] })
</script>

<template>
  <div class="catalog-page catalog-container">
    <ProductsProductListingHeader
      v-model:search="catalog.searchInput.value"
      :count="catalog.results.value.total"
      :total="catalog.totalProducts"
      @submit="catalog.submitSearch"
      @clear="catalog.clearSearch"
    />
    <ProductsProductCategoryNav
      :model-value="catalog.state.value.filters.category"
      :categories="catalogCategories"
      @update:model-value="catalog.selectCategory"
    />
    <div class="catalog-layout">
      <ProductsProductFilterSidebar
        :model-value="catalog.state.value.filters"
        @update:model-value="catalog.applyFilters"
        @clear="catalog.clearAll"
      />
      <section id="catalog-results" class="catalog-results" aria-labelledby="catalog-results-title">
        <ProductsProductListingToolbar
          :count="catalog.results.value.total"
          :sort="catalog.state.value.sort"
          :filter-count="catalog.filterCount.value"
          :filters-open="filterDrawerOpen"
          @update:sort="catalog.setSort"
          @open-filters="filterDrawerOpen = true"
        />
        <ProductsActiveFilterChips
          :filters="catalog.state.value.filters"
          :search="catalog.state.value.search"
          @update:filters="catalog.applyFilters"
          @remove-search="catalog.clearSearch"
          @clear="catalog.clearAll"
        />
        <ProductsProductGrid
          v-if="catalog.results.value.total"
          :products="catalog.results.value.items"
        />
        <ProductsProductEmptyState v-else @reset="catalog.clearAll" />
        <ProductsProductPagination
          :page="catalog.results.value.page"
          :total-pages="catalog.results.value.totalPages"
          :page-size="catalog.results.value.pageSize"
          :total="catalog.results.value.total"
          @update:page="catalog.setPage"
          @update:page-size="catalog.setPageSize"
        />
      </section>
    </div>
    <ProductsProductFilterDrawer
      v-model:open="filterDrawerOpen"
      :model-value="catalog.state.value.filters"
      @apply="catalog.applyFilters"
    />
  </div>
</template>

<style src="~/assets/css/catalog.css"></style>
