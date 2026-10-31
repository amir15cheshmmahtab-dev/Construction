# Product detail adapter and local demonstration cart — phase 4

The dynamic detail domain reuses the existing 48 records in `app/data/catalog.ts`. No second product database, network API or backend was added. `catalogRepository.getProductBySlug(slug)` performs an exact lookup and returns a deep copy; unknown, modified or legacy guessed slugs do not fall back to another product.

`getProductDetail(product, products?)` derives the gallery, labeled specification groups, description sections, demonstration quantity rules and optional explicit SKU family from that same record. `getRelatedProducts` uses actual same-category records, excludes the current SKU and prefers complementary subcategories. Related products are not fabricated accessories or unrelated random promotions.

## Specifications and descriptions

Category-specific group definitions provide Persian labels and presentation order. The values come only from the current product's `specifications` record; the unit-of-sale row comes from its existing `unit`. Empty rows are omitted. Unknown future keys appear in a separate group rather than being discarded. No grade, thickness, package coverage, certification, warranty, origin or manufacturer identity is invented to fill gaps.

The four description sections reuse the existing explicit mock introduction, explain the category's demonstration comparison context, summarize recorded values and identify information requiring confirmation before a real purchase. They do not turn illustrative dimensions, finishes, stock or pricing into verified commercial claims. Existing official provenance for the three tool models remains in [catalog-data.md](./catalog-data.md).

The gallery currently has one genuine existing image per product. No duplicated angles, different crops masquerading as angles or synthetic brand model photos were added. Images remain category illustrations; branded tool image alt text continues to disclose that the image is not an exact model photograph.

## Explicit variants

Two fixture families have variant selectors:

- The six existing `rebar-10`/`12`/`14`/`16`/`18`/`20` SKU records, labeled by their recorded diameter.
- The two existing `block-concrete-15`/`20` SKU records, labeled by the width from their recorded dimensions.

Family membership is explicit, requires matching category, subcategory, brand and sale unit, and resolves to the selected existing SKU's slug, price and stock. Other products do not receive arbitrary sibling/brand variants. Missing records are omitted. A group with fewer than two valid members is not displayed. No option is a fabricated new product.

## Demonstration quantity rules

These are **interface demonstration rules, not verified minimum order quantities or supplier sales conditions**. Bags, pieces, pairs and sets use a minimum/step of 1. Weight, area and length units allow half-unit steps; the illustrative minimum is 0.5 for tonnes and 1 for the other units. A 1,000,000-unit safety cap bounds local input; it is not available stock, a supplier limit or a commercial promise.

Quantity parsing accepts Persian/Arabic digits, decimal point `.`/`٫` and properly grouped thousands. It rejects malformed grouping, signs, scientific notation, nonnumeric suffixes, nonfinite numbers, off-step amounts and values outside the demonstration bounds. Trailing decimal zeroes are accepted. Stepping and cart merging use integer-scaled amounts rather than repeated floating-point addition. Quantity display uses `formatProductQuantity`, separate from the existing integer count and rial-to-toman price formatters. Line totals remain integer rials; invalid or unpriced amounts produce no total.

## Local cart boundary

`useCartStore` is a lightweight **in-session demonstration** Pinia store. It has no persistence, checkout, payments, order creation, inventory reservation or supplier fulfillment logic. State belongs to each Pinia instance and is not a shared server singleton.

`addItem({ productId, variantId?, quantity })` resolves only an existing product/explicit family option. It rejects unavailable products, missing prices, unrelated variants and invalid quantities. Unknown availability may enter the local demonstration basket but remains unverified; adding it is never an inventory confirmation. Repeated additions of the same selected SKU merge into one line, including additions from listing cards and detail variants. The canonical key is the selected SKU ID. Failed additions do not change existing quantities.

Cart items contain selected SKU identity, name, unit, mock rial price and quantity. `itemCount` counts distinct SKU lines, **not** an invalid sum of kilograms, bags, pieces and square metres. UI confirmation must explicitly identify this as a demonstration basket and must never claim a real order was placed.

Run the new behavior tests with:

```sh
node --test --test-isolation=none tests/product-detail.test.mjs tests/cart.test.mjs
```
