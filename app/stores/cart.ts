import { defineStore } from 'pinia'
import { catalogProducts } from '../data/catalog.ts'
import type { AddDemoCartItem, AddDemoCartResult, DemoCartItem } from '../types/product-detail.ts'
import {
  getProductDetail,
  getProductOrdering,
  validateProductQuantity,
} from '../utils/product-detail.ts'

/** In-session demonstration only: no persistence, checkout, reservation or orders. */
export const useCartStore = defineStore('demo-cart', {
  state: (): { items: DemoCartItem[] } => ({ items: [] }),
  getters: {
    // Count SKU lines, never sum incomparable quantities such as kilograms and bags.
    itemCount: (state): number => state.items.length,
  },
  actions: {
    addItem(input: AddDemoCartItem): AddDemoCartResult {
      const base = catalogProducts.find((entry) => entry.id === input.productId)
      if (!base)
        return { success: false, code: 'product', message: 'این محصول در فهرست نمایشی پیدا نشد.' }
      let product = base
      if (input.variantId !== undefined && input.variantId !== null) {
        const option = getProductDetail(base).variants?.options.find(
          (entry) => entry.id === input.variantId,
        )
        const selected = option
          ? catalogProducts.find((entry) => entry.id === option.productId)
          : undefined
        if (!selected)
          return {
            success: false,
            code: 'variant',
            message: 'گزینه انتخاب‌شده متعلق به این محصول نیست.',
          }
        product = selected
      }
      if (product.availability === 'unavailable')
        return {
          success: false,
          code: 'unavailable',
          message: 'این محصول در فهرست نمایشی ناموجود است.',
        }
      if (product.priceRial === null)
        return {
          success: false,
          code: 'price',
          message: 'این محصول به استعلام قیمت نیاز دارد؛ به سبد نمایشی اضافه نشد.',
        }
      const ordering = getProductOrdering(product)
      const quantity = validateProductQuantity(input.quantity, ordering)
      if (!quantity.valid) return { success: false, code: 'quantity', message: quantity.message }
      const existing = this.items.find((entry) => entry.key === product.id)
      const previous = existing ? validateProductQuantity(existing.quantity, ordering) : null
      if (previous && !previous.valid)
        return { success: false, code: 'quantity', message: 'مقدار قبلی سبد نمایشی معتبر نیست.' }
      const mergedQuantity =
        ((previous?.valid ? previous.scaled : 0) + quantity.scaled) / ordering.scale
      const merged = validateProductQuantity(mergedQuantity, ordering)
      if (!merged.valid) return { success: false, code: 'quantity', message: merged.message }
      if (existing) {
        existing.quantity = merged.quantity
        return { success: true, item: { ...existing }, merged: true }
      }
      const item: DemoCartItem = {
        key: product.id,
        productId: product.id,
        slug: product.slug,
        variantId: getProductDetail(product).variants ? product.id : null,
        name: product.name,
        unit: product.unit,
        priceRial: product.priceRial,
        quantity: merged.quantity,
      }
      this.items.push(item)
      return { success: true, item: { ...item }, merged: false }
    },
  },
})
