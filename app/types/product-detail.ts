import type { CatalogProduct } from './catalog.ts'
import type { ProductAvailability } from './marketplace.ts'

export interface ProductImage {
  id: string
  src: string
  alt: string
  width: number
  height: number
}

export interface ProductSpecification {
  key: string
  label: string
  value: string
}

export interface ProductSpecificationGroup {
  id: string
  title: string
  items: ProductSpecification[]
}

export interface ProductDescriptionSection {
  id: 'introduction' | 'uses' | 'characteristics' | 'considerations'
  title: string
  paragraphs: string[]
}

export interface ProductOrdering {
  unit: string
  minimum: number
  step: number
  maximum: number
  precision: number
  scale: number
  note: string
}

export interface ProductVariant {
  id: string
  productId: string
  slug: string
  label: string
  value: string
  priceRial: number | null
  availability: ProductAvailability
}

export interface ProductVariantGroup {
  id: 'rebar-diameter' | 'concrete-block-width'
  label: string
  selectedId: string
  options: ProductVariant[]
  note: string
}

export interface ProductDetail {
  product: CatalogProduct
  images: ProductImage[]
  specifications: ProductSpecificationGroup[]
  descriptionSections: ProductDescriptionSection[]
  ordering: ProductOrdering
  variants: ProductVariantGroup | null
}

export type QuantityValidation =
  | { valid: true; quantity: number; scaled: number }
  | { valid: false; code: 'invalid' | 'minimum' | 'maximum' | 'step'; message: string }

export interface DemoCartItem {
  key: string
  productId: string
  slug: string
  variantId: string | null
  name: string
  unit: string
  priceRial: number
  quantity: number
}

export interface AddDemoCartItem {
  productId: string
  variantId?: string | null
  quantity: string | number
}

export type AddDemoCartResult =
  | { success: true; item: DemoCartItem; merged: boolean }
  | {
      success: false
      code: 'product' | 'variant' | 'unavailable' | 'price' | 'quantity'
      message: string
    }
