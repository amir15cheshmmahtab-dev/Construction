import tailwindcss from '@tailwindcss/vite'
import { brand } from './app/data/brand'
import { catalogProducts } from './app/data/catalog'

export default defineNuxtConfig({
  // Stable baseline recommended by Nuxt's current Tailwind 4 installation guide.
  compatibilityDate: '2025-07-15',
  ssr: true,
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@peterbud/nuxt-query', '@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: { siteUrl: '' },
  },
  nitro: {
    prerender: {
      routes: ['/products', ...catalogProducts.map((product) => `/products/${product.slug}`)],
      failOnError: true,
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'fa', dir: 'rtl' },
      title: `${brand.name} | ${brand.tagline}`,
      meta: [
        { name: 'theme-color', content: '#F7F6F2' },
        {
          name: 'description',
          content: `${brand.name}؛ تجربه‌ای تازه برای انتخاب مصالح، تجهیزات ساختمانی و ایده‌های بازسازی در تهران.`,
        },
      ],
    },
  },
  typescript: { strict: true },
  vite: { plugins: [tailwindcss()] },
  nuxtQuery: {
    autoImports: false,
    devtools: false,
    // The module creates a QueryClient for each SSR request, dehydrates after
    // rendering, and hydrates before mounting. Do not add a singleton client.
    queryClientOptions: {
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          retry: false,
          refetchOnWindowFocus: false,
        },
      },
    },
  },
})
