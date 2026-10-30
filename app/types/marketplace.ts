export interface Brand {
  name: string
  tagline: string
  logo: string
}

export interface NavigationItem {
  label: string
  href: string
}

export interface Category {
  id: string
  name: string
  image: string
}

export interface Project {
  id: string
  name: string
  description: string
  image: string
}

export type ProductAvailability = 'available' | 'unavailable' | 'unknown'

export interface Product {
  id: string
  slug: string
  name: string
  image: string
  categoryId: string
  /** Mock amount in Iranian rials; divide by 10 only in the display formatter. */
  priceRial: number | null
  unit: string
  spec: string
  availability: ProductAvailability
  /** Publish a manufacturer only after its identity has been verified. */
  manufacturer?: string
}

export interface Service {
  id: string
  title: string
  description: string
  icon: 'Headset' | 'Layers3' | 'Truck' | 'ScanLine'
}

export interface HomepageData {
  navigation: NavigationItem[]
  categories: Category[]
  projects: Project[]
  products: Product[]
  services: Service[]
}

export type CustomerType = 'individual' | 'business'
