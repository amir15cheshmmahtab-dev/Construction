# سیوان — Construction materials marketplace

A Persian, RTL, server-rendered Nuxt 4 homepage for a premium construction materials marketplace. This is **phase 1: frontend foundation and homepage only**. The working name and tagline live in `app/data/brand.ts`; the logo is a reusable presentation component.

## Run locally

Use Node **22.19+ (22.x)**, **24.11+ (24.x)**, or **26+**, with npm.

```sh
npm ci
npm run dev
```

Open the local address printed by Nuxt (normally `http://localhost:3000`).

```sh
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run preview
```

`postinstall` runs `nuxt prepare`, which generates the application TypeScript and ESLint configurations. Commit `package-lock.json` and use `npm ci` for reproducible installs. `npm run format` applies Prettier formatting.

## Stack and compatibility

Direct dependencies are pinned in `package.json`: Nuxt 4.5.2, Vue 3.5.44, Tailwind CSS 4.3.3, Pinia 4.1.0 with `@pinia/nuxt` 1.0.3, TanStack Vue Query 5.105.0 with `@peterbud/nuxt-query` 1.12.0, and Lucide Vue icons. Development checks use TypeScript, vue-tsc, Nuxt ESLint, ESLint, and Prettier.

Nuxt 4.5.2 is a stable release compatible with the workspace's Node 24.14.0 runtime. The latest Nuxt 4.6.3 available when this project was created requires Node 24.15.0 or newer on the 24.x line. Nuxt Query's published SSR integration explicitly tests Nuxt 4.5.2 and TanStack Query 5. Update Node and recheck integrations before upgrading Nuxt.

The ESLint module is pinned to 1.15.2, with an `eslint-plugin-regexp` 3.1.0 override inside its supported major range, because newer transitive parser releases require Node 24.15.0. Lucide's `lucide-vue-next` package has been renamed upstream to `@lucide/vue`; the existing Vue-compatible import is retained consistently throughout this phase.

Tailwind uses its official **v4 Vite plugin**, `@tailwindcss/vite`, and the CSS-first theme in `app/assets/css/main.css`. There is no Tailwind v3 configuration or obsolete Nuxt Tailwind module. Strict TypeScript is enabled in `nuxt.config.ts`; the root `tsconfig.json` references Nuxt 4's generated app/server/shared/node projects.

## Architecture

```text
app/
  app.vue                         application root
  assets/css/                     theme tokens, typography, reduced motion
  components/
    home/                         feature sections and product cards
    layout/                       header, footer and mobile navigation
    shared/                       reusable brand, search and feedback
    ui/                           small presentation primitives
  composables/useHomepageData.ts  query boundary and SSR prefetch
  data/                          separate typed homepage fixtures
  layouts/default.vue            shared page frame
  pages/index.vue                homepage composition and page metadata
  repositories/homepage.ts       mock adapter behind repository interface
  stores/ui.ts                   request-safe Pinia UI state
  types/marketplace.ts           domain and presentation data contracts
  utils/format.ts                Persian number and toman formatting
public/
  fonts/                         local Vazirmatn variable font and OFL
  images/                        independent optimized local assets
nuxt.config.ts                   modules, SSR, metadata and Vite integration
```

Presentation receives typed data rather than importing fixtures into every card. `app/data/home.ts` aggregates separate navigation, categories, projects, products and services modules. Replace `HomepageRepository.getHomepage()` with a real API adapter in a later phase; presentation components need no change.

The repository returns copied fixtures without making network requests or introducing fake API endpoints. `useHomepageData()` uses a stable query key and awaits `suspense()` with `onServerPrefetch`. The `@peterbud/nuxt-query` module creates a **fresh QueryClient per SSR request**, dehydrates completed queries after rendering, and hydrates the browser cache before components mount. No module-level QueryClient or additional hydration plugin is used. A five-minute `staleTime` avoids immediately refetching hydrated data. Homepage fixtures are also exported for stable presentation fallbacks.

Pinia's official Nuxt module serializes and hydrates UI state. `useUiStore()` holds menu visibility, Tehran location preference, individual/business preference, local visual favorites and temporary feedback. It implements no purchasing logic and stores no server data. Preferences are session-memory state; no persistent storage is added in this phase.

## Persian content, currency and imagery

The document uses `lang="fa"` and `dir="rtl"`, local Persian typography, logical spacing and safe-area padding for mobile navigation. English labels and product model names should use appropriate direction handling when mixed with Persian text.

**Every product and price is illustrative.** `Product.priceRial` is always an integer in Iranian rials or `null`; `formatToman()` is the only conversion to toman (rials ÷ 10), and returns a Persian amount without a currency suffix. `formatNumber()` formats other counts. Unknown availability is explicitly modeled as `unknown`; no supplier identities, origin, warranty, stock, certifications or fulfillment promises are fabricated. Manufacturer information must be verified before it is published.

The local variable font is [Vazirmatn v33.003](https://github.com/rastikerdar/vazirmatn/releases/tag/v33.003), created by the Vazirmatn Project Authors and distributed under the SIL Open Font License 1.1. Its unmodified WOFF2 file is stored as `public/fonts/Vazirmatn-Variable.woff2`, and the full license is included in `public/fonts/OFL.txt`. It is preloaded once and uses `font-display: swap`.

The **18 active homepage photographs** were generated separately with the built-in ImageGen tool: one residence hero, seven categories, four project interiors/exteriors, five isolated products and one architectural material-showroom consultation. The **43 local WebP files**, including responsive variants and five retained variants of the previous commercial-building and handshake images, occupy approximately **2.64 MB** in `public/images/{hero,categories,projects,products,business}`. Hero variants are 640/960/1920 px wide; categories and products 320/640; projects 480/900; the active showroom image 640/960/1920. The hero has loading priority; below-fold images load lazily and use width-aware `srcset`/`sizes`.

Exact final prompts, original generation provenance, asset dimensions and individual sizes are recorded in [architecture image prompts](docs/image-prompts-architecture.md), [catalog image prompts](docs/image-prompts-catalog.md) and [the partnership banner prompt](docs/image-prompts-partnership.md). No required generation assets remain outstanding. The supplied desktop/mobile reference screenshots were used only as design references.

## Design system and responsive composition

`app/assets/css/main.css` defines semantic CSS variables and Tailwind 4 theme tokens for ivory `#F7F6F2`, cream `#F1EDE7`, charcoal `#242729`, ink `#141414`, bronze `#A67C52`, light bronze `#C29A70`, borders and muted text. Text-bearing bronze buttons use a darker action token `#8F6842` for readable white labels. Shared buttons, section headings, cards, location controls and brand presentation keep spacing, borders and behavior consistent.

The desktop header overlays the architectural hero, while mobile uses a dedicated ivory header. Categories form seven desktop columns and two deliberately arranged mobile rows (four then three). Projects scroll within their own track, products keep a two-column mobile grid with an image above readable product details, and the mobile bottom navigation includes safe-area padding. Tablet tracks scroll without widening the document. Motion is restrained and honors reduced-motion preferences, including programmatic scrolling and decorative hover transforms.

On desktop, the category, project and featured-product showcases use the full available viewport width with 24–48 px side padding. Their card images, headings, product details and action buttons scale up for large screens rather than remaining inside the 1280 px reading container. Smaller desktop product tracks retain a 170 px minimum card width and scroll horizontally when necessary.

The business promotion uses an original photograph of architecture and construction professionals reviewing stone, ceramic and metal samples in a material showroom. Desktop copy and both action buttons sit on the left, with the people on the right. Its typed content in `app/data/business.ts` addresses two audiences: suppliers selling products and construction companies buying in bulk. Each action gives its own honest placeholder notice; neither submits a real request. On tablet and mobile, the photograph sits above the copy to keep faces clear of text. Mobile buttons use the full available width. Service highlights follow in their own enlarged row, and the footer also spans the available width with larger branding and text. Favorites display a filled red heart while selected. The former decorative `01 / 03` hero indicator and its accompanying labels have been removed.

Phase 2 refines the existing surfaces and hierarchy: the search has restrained translucency, a fine highlight and soft depth; product cards use consistent warm image stages, quiet borders, restrained shadows and aligned price/action rows. Existing source rules were edited directly, and superseded responsive overrides were removed. Primary touch controls are at least 44px. The header height, section order, product data, navigation, business copy and existing interaction logic are preserved. No dependencies, backend, database or internal pages were added.

Replace the working name, tagline and `logo` path in `app/data/brand.ts`; the SVG mark and favicon share `public/brand-mark.svg`. Metadata, visible branding and messages follow that configuration. Open Graph image URLs derive from the current request origin; configure and verify a real public origin when deploying behind a proxy.

## Scope and interaction rules

The homepage presents seven material categories, four project ideas, five featured products, an architectural hero, a business section and planned service highlights. Mobile gets an actual responsive website, with no fake device bezel or status bar. Interactive controls include mobile navigation, search UI, local favorite toggles, location UI, and honest placeholder feedback for future capabilities.

**Intentionally unimplemented:** backend/database/API endpoints, authentication, actual cart/checkout/payment, product/category detail pages, project questionnaire, customer/supplier/admin/B2B dashboards, inventory, orders, delivery calculations, commissions, supplier settlements, and live support. Business content is a preview of planned services. Future buttons must never suggest that a real order or business request was submitted.

Do not publish fake contact details, manufacturer claims, endorsements, statistics or certifications. Configure a real public origin and verify commercial/legal copy before adding canonical absolute URLs, production social links or operational claims.

## Verification

Executed on **2026-10-30**, using Node 24.14.0:

| Check                           | Result                                                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run typecheck`             | Passed; strict Vue/TypeScript checks                                                                                                                         |
| `npm run lint`                  | Passed with no warnings                                                                                                                                      |
| `npm run format:check`          | Passed                                                                                                                                                       |
| `npm run build`                 | Passed; SSR Node/Nitro production output                                                                                                                     |
| Production HTTP/SSR smoke check | HTTP 200; Persian RTL document, one H1, rendered product data, query hydration payload and absolute Open Graph image                                         |
| Browser viewport checks         | 320, 390, 768, 1024 and 1440 px; no document overflow or broken images                                                                                       |
| Browser interaction checks      | Mobile drawer and Escape/focus return, location dialog, favorite toggles, search suggestions and empty state, clear/empty submit and honest cart placeholder |

The required viewports were visually inspected in Chrome, with an additional live mobile preview in the in-app browser. Image and text content below the fold were checked after lazy loading. No backend, payment, authentication or fulfillment tests apply because those features are intentionally absent. This is a frontend demonstration, not an operational marketplace.

The final production-browser result snapshot is saved in [verification.json](docs/verification.json). [Desktop preview](docs/previews/home-1440.webp), [mobile preview](docs/previews/home-390.webp) and the other tested viewport captures live in `docs/previews/`.

The updated partnership banner was checked at 320, 390, 768, 1024, 1440 and 1908 px, including left copy alignment, both action labels/notices and image framing. The [partnership verification snapshot](docs/business-partnership-verification.json), [desktop banner](docs/previews/business-partnership.webp) and [mobile banner](docs/previews/business-partnership-mobile.webp) record that pass.

Phase 2 was verified against the production build in the in-app browser at **320, 390, 430, 768, 1024, 1440 and 1908 px**. All widths had no document overflow, clipped category/product/service labels or hero CTA/search overlap. Favorites, mobile product expansion, menu Escape/focus return, location selection, search results/empty state, cart feedback and both partnership notices were exercised. TypeScript, ESLint, Prettier and the production build passed. The [Phase 2 verification record](docs/phase2-verification.json) records the final measurements. Current [desktop](docs/previews/phase2-home-1440.webp), [390px mobile](docs/previews/phase2-home-390.webp), [430px mobile](docs/previews/phase2-home-430.webp) and [tablet](docs/previews/phase2-home-768.webp) captures were reviewed from top to bottom. These full-page previews combine sequential browser viewport screenshots at their measured scroll positions; earlier preview files remain historical records.

The initial `npm audit` on 2026-10-30 reported **8 affected dependency entries: 5 low and 3 moderate; no high or critical findings**. Nuxt 4.5.2 is affected by advisories around case-variant route rules, server-island `useHeadSafe` sanitization, and a `NuxtLink` edge case when pages are disabled. This phase uses none of those affected configurations: it defines no route rules or server islands, leaves pages enabled, and uses no user-provided link destinations. Remaining low findings include transitive `deepmerge` and a development-only esbuild issue on Windows. These limitations still need upstream dependency updates before production hardening; they are not a clean audit.

Concrete upgrade path: update the runtime to **Node 24.15+** (or 22.22.3+), upgrade Nuxt to **4.6.3 or later** and Nuxt ESLint to its then-current compatible stable version, remove the regexp override, and rerun `npm audit`, typecheck, lint, production build, and SSR/browser verification. Apply any remaining low-severity dependency updates deliberately; do not use an unreviewed `npm audit fix --force`.

## Integration references

Verified against primary documentation and npm package metadata on 2026-10-30:

- [Nuxt 4 installation](https://nuxt.com/docs/4.x/getting-started/installation) and [Nuxt TypeScript](https://nuxt.com/docs/4.x/guide/concepts/typescript)
- [Official Tailwind CSS 4 Nuxt Vite integration](https://tailwindcss.com/docs/installation/framework-guides/nuxt)
- [Official Pinia Nuxt integration](https://pinia.vuejs.org/ssr/nuxt.html)
- [Nuxt Query configuration, SSR lifecycle, request isolation and compatibility](https://nuxt.com/modules/nuxt-query)
- [Nuxt Query source and documentation](https://github.com/peterbud/nuxt-query)
- [TanStack Vue Query SSR](https://tanstack.com/query/latest/docs/framework/vue/guides/ssr)
- [Nuxt ESLint flat configuration](https://eslint.nuxt.com/packages/module)
- [Vazirmatn font and SIL OFL license](https://github.com/rastikerdar/vazirmatn)
