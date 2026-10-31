import type {
  CatalogCategory,
  CatalogFilters,
  CatalogSpecificationFilter,
} from '../types/catalog.ts'
import { catalogProducts } from './catalog.ts'

export const catalogCategories: CatalogCategory[] = [
  {
    id: 'cement',
    name: 'مصالح پایه',
    image: '/images/categories/cement.webp',
    subcategories: [
      { id: 'cement', name: 'سیمان' },
      { id: 'sand', name: 'ماسه' },
      { id: 'brick', name: 'آجر' },
      { id: 'block', name: 'بلوک ساختمانی' },
    ],
  },
  {
    id: 'rebar',
    name: 'آهن و آلات',
    image: '/images/categories/rebar.webp',
    subcategories: [
      { id: 'rebar', name: 'میلگرد' },
      { id: 'beam', name: 'تیرآهن' },
      { id: 'profile', name: 'پروفیل' },
    ],
  },
  {
    id: 'stone',
    name: 'سنگ و سرامیک',
    image: '/images/categories/stone.webp',
    subcategories: [
      { id: 'stone', name: 'سنگ ساختمانی' },
      { id: 'ceramic', name: 'سرامیک' },
      { id: 'tiles', name: 'کاشی' },
    ],
  },
  {
    id: 'bathroom',
    name: 'تأسیسات و بهداشتی',
    image: '/images/categories/bathroom.webp',
    subcategories: [
      { id: 'faucet', name: 'شیرآلات' },
      { id: 'sink', name: 'سینک' },
      { id: 'bath', name: 'تجهیزات حمام' },
      { id: 'pipes', name: 'لوله و اتصالات' },
    ],
  },
  {
    id: 'lighting',
    name: 'برق و روشنایی',
    image: '/images/categories/lighting.webp',
    subcategories: [
      { id: 'lights', name: 'چراغ' },
      { id: 'bulbs', name: 'لامپ' },
      { id: 'electrical', name: 'تجهیزات برق' },
    ],
  },
  {
    id: 'doors',
    name: 'در و پنجره',
    image: '/images/categories/doors.webp',
    subcategories: [
      { id: 'door', name: 'درب' },
      { id: 'window', name: 'پنجره' },
      { id: 'hardware', name: 'دستگیره و قفل' },
    ],
  },
  {
    id: 'tools',
    name: 'ابزارآلات',
    image: '/images/categories/tools.webp',
    subcategories: [
      { id: 'power-tools', name: 'ابزار برقی' },
      { id: 'hand-tools', name: 'ابزار دستی' },
      { id: 'workshop', name: 'تجهیزات کارگاهی' },
    ],
  },
]

const specificationLabels: Record<string, string> = {
  cementType: 'نوع سیمان',
  packageWeight: 'وزن بسته‌بندی',
  diameter: 'قطر',
  grade: 'گرید فولاد',
  length: 'طول شاخه',
  dimensions: 'ابعاد',
  finish: 'پرداخت سطح',
  material: 'جنس',
  installation: 'نوع نصب',
  color: 'رنگ',
  toolType: 'نوع ابزار',
  powerSource: 'منبع تغذیه',
  application: 'کاربرد',
  voltage: 'ولتاژ',
  wattage: 'توان',
  opening: 'نوع بازشو',
  basins: 'تعداد لگن',
  lightType: 'نوع چراغ',
  supply: 'نوع عرضه',
}

const numberAwarePersian = new Intl.Collator('fa', { numeric: true })

function productsInCategory(filters: Pick<CatalogFilters, 'category' | 'subcategory'>) {
  return catalogProducts.filter(
    (product) =>
      (!filters.category || product.categoryId === filters.category) &&
      (!filters.subcategory || product.subcategoryId === filters.subcategory),
  )
}

/** Brand means product brand, never a marketplace supplier. */
export function getCatalogBrands(
  filters?: Pick<CatalogFilters, 'category' | 'subcategory'>,
): string[] {
  const products = filters ? productsInCategory(filters) : catalogProducts
  return [
    ...new Set(
      products.map((product) => product.brand).filter((brand): brand is string => Boolean(brand)),
    ),
  ].sort(numberAwarePersian.compare)
}

/** No global technical filters; options come only from the chosen category's fixtures. */
export function getCatalogSpecificationFilters(
  filters: Pick<CatalogFilters, 'category' | 'subcategory'>,
): CatalogSpecificationFilter[] {
  if (!filters.category) return []
  const products = productsInCategory(filters)
  return Object.entries(specificationLabels).flatMap(([key, label]) => {
    const options = [
      ...new Set(
        products
          .map((product) => product.specifications[key])
          .filter((value): value is string => Boolean(value)),
      ),
    ].sort(numberAwarePersian.compare)
    return options.length ? [{ key, label, options }] : []
  })
}

export function getSpecificationFilters(
  category: string | null,
  subcategory: string | null,
): CatalogSpecificationFilter[] {
  return getCatalogSpecificationFilters({ category, subcategory })
}
