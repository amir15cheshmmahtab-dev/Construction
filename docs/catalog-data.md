# Product discovery fixtures — phase 3

`app/data/catalog.ts` contains 48 deterministic demonstration records across the seven existing homepage category IDs. They extend the existing homepage product type without changing its fixtures. `catalogRepository.getProducts()` returns a deep copy synchronously, so SSR does not issue artificial network requests for local data.

Every amount is a **mock integer in Iranian rials**. Price bounds and URL `min`/`max` are in **toman**; filtering converts those bounds to rials once. The existing centralized `formatToman` remains the display boundary. Null prices require an inquiry. Availability states and publication dates are simulated, not verified inventory or commercial offers. These records must be replaced before commerce is enabled.

Unbranded records are explicitly illustrative product variants, including ordinary dimensions, packaging, finish and material. No fabricated manufacturer names, supplier affiliations, warranties, origin claims or certifications appear. In particular, rebar grade is intentionally absent because no particular SKU/grade has been verified; the configuration therefore does not show an invented grade filter.

## Verified brand/model identity

Only three tool records have a non-null brand. The primary sources below establish product identity and the limited basic facts used in each fixture. They do **not** establish Sivan inventory, distribution authorization, local prices, commercial relationships or bundled accessories. Prices (where present) and stock remain mock. Checked 2026-10-30.

| Fixture          | Verified fields used                                                   | Manufacturer source                                                                                                    |
| ---------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Bosch GSB 18V-50 | Brand/model; cordless 18 V; drilling, impact drilling and screwdriving | [Bosch Professional product page](https://www.bosch-professional.com/om/en/products/gsb-18v-50-06019H51L0)             |
| Ronix 2113       | Brand/model; corded drill; 350 W; wood/metal drilling                  | [Ronix manufacturer product page](https://ronixtools.com/en/product/electric-corded-drill-10mm-350w-vega-series-2113/) |
| Makita DHP484    | Brand/model; cordless hammer drill; 18 V; drilling and screwdriving    | [Makita UK official product sheet](https://www.makitauk.com/data/sr/productinfo/generated/dhp484_2.pdf)                |

All product imagery is unbranded, locally stored category photography. A branded drill card uses the shared generic drill illustration, **not an exact model photograph**, and its alt text says so. Other variants may also share a representative category image. Model appearance, finish and dimensions must be checked against real supplied imagery before publication as a live offer. No image implies brand endorsement.

The taxonomy includes the requested future subcategories even when this representative sample currently has no item in them. Selecting an empty subcategory produces the honest empty-results state. The 48-item sample is not a claim to represent every possible subcategory or manufacturer.

## Data-driven filtering and URL contract

`app/data/catalog-filters.ts` exposes category/subcategory labels, verified brand options and technical filter groups. Technical options are derived only from the selected category/subcategory's actual record values; there are no global irrelevant specification controls. Brand means product brand, never a marketplace supplier.

`app/utils/catalog.ts` is framework-independent. Filters combine with AND; selections within one brand, availability or specification group use OR. Search normalizes Persian/Arabic digits, Arabic yeh/kaf, diacritics and word joiners. It searches product names, descriptions, codes, slugs, brand, category/subcategory and specification values. Sorting is stable; unpriced products remain last in both price directions. Pagination clamps stale pages after filtering and returns at least one page for an empty result.

Applied state uses fresh canonical URL keys: `category`, `subcategory`, `search`, `sort`, `min`, `max`, `brands`, `availability`, `spec.<key>`, `page` and `pageSize`. Comma-separated multi-values are sorted and deduplicated. Defaults, unknown keys, invalid taxonomy, unverified brands and irrelevant specification values are omitted. The legacy example `category=tiles` resolves to the `stone` category and `ceramic` subcategory; `category=rebar` selects the existing iron category. Page sizes are 12/24/48; query page numbers are capped at 10,000 and real result pagination clamps them further. Search is capped at 140 characters. Reversed price bounds are retained so the UI can explain the invalid range; they are never silently swapped.

The route composable owns page reset on an applied filter/search/sort change, browser history and mobile drawer application. Pure utilities never mutate incoming collections or filters. Drawer drafts must remain separate until Apply; URL parsing always creates fresh state so Back/Forward restores the saved applied state.

Run the dependency-free behavioral suite with:

```sh
node --test tests/catalog.test.mjs
```
