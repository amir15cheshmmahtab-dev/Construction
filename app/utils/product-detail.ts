import { catalogProducts } from '../data/catalog.ts'
import type { CatalogProduct } from '../types/catalog.ts'
import type {
  ProductDescriptionSection,
  ProductDetail,
  ProductOrdering,
  ProductSpecificationGroup,
  ProductVariantGroup,
  QuantityValidation,
} from '../types/product-detail.ts'
import { normalizeCatalogText } from './catalog.ts'

const specificationLabels: Record<string, string> = {
  cementType: 'نوع سیمان',
  packageWeight: 'وزن بسته‌بندی',
  diameter: 'قطر میلگرد',
  grade: 'گرید فولاد',
  length: 'طول شاخه',
  dimensions: 'ابعاد',
  finish: 'پرداخت سطح',
  material: 'جنس',
  installation: 'نوع نصب',
  color: 'رنگ',
  toolType: 'نوع ابزار',
  powerSource: 'منبع تغذیه',
  application: 'کاربرد ثبت‌شده',
  voltage: 'ولتاژ',
  wattage: 'توان',
  opening: 'نوع بازشو',
  basins: 'تعداد لگن',
  lightType: 'نوع چراغ',
  supply: 'نوع عرضه',
}

const quantityNumber = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 3 })

export function formatProductQuantity(quantity: number): string {
  return quantityNumber.format(quantity)
}

interface SpecificationGroupDefinition {
  id: string
  title: string
  keys: string[]
}

const categorySpecificationGroups: Record<string, SpecificationGroupDefinition[]> = {
  cement: [
    { id: 'material', title: 'نوع و جنس', keys: ['cementType', 'material', 'color'] },
    { id: 'sizing', title: 'بسته‌بندی و ابعاد', keys: ['packageWeight', 'dimensions', 'supply'] },
  ],
  rebar: [
    { id: 'steel', title: 'مشخصات مقطع فولادی', keys: ['diameter', 'grade', 'material'] },
    { id: 'sizing', title: 'ابعاد و طول', keys: ['dimensions', 'length'] },
  ],
  stone: [
    { id: 'material', title: 'جنس و سطح', keys: ['material', 'finish', 'color'] },
    { id: 'sizing', title: 'ابعاد محصول', keys: ['dimensions'] },
  ],
  bathroom: [
    { id: 'installation', title: 'نصب و ساختار', keys: ['installation', 'basins', 'material'] },
    { id: 'appearance', title: 'پرداخت و رنگ', keys: ['finish', 'color', 'dimensions'] },
  ],
  lighting: [
    {
      id: 'lighting',
      title: 'مشخصات روشنایی',
      keys: ['lightType', 'material', 'color', 'powerSource', 'wattage'],
    },
  ],
  doors: [
    { id: 'structure', title: 'جنس و بازشو', keys: ['material', 'opening'] },
    { id: 'sizing', title: 'ابعاد محصول', keys: ['dimensions'] },
  ],
  tools: [
    { id: 'tool', title: 'نوع ابزار و کاربرد', keys: ['toolType', 'application'] },
    { id: 'power', title: 'تغذیه و توان', keys: ['powerSource', 'voltage', 'wattage'] },
  ],
}

function getSpecificationGroups(product: CatalogProduct): ProductSpecificationGroup[] {
  const used = new Set<string>()
  const groups = (categorySpecificationGroups[product.categoryId] ?? []).flatMap((group) => {
    const items = group.keys.flatMap((key) => {
      const value = product.specifications[key]
      if (!value?.trim()) return []
      used.add(key)
      return [{ key, label: specificationLabels[key] ?? key, value }]
    })
    return items.length ? [{ id: group.id, title: group.title, items }] : []
  })
  const other = Object.entries(product.specifications).flatMap(([key, value]) =>
    value.trim() && !used.has(key) ? [{ key, label: specificationLabels[key] ?? key, value }] : [],
  )
  if (other.length) groups.push({ id: 'other', title: 'سایر مشخصات ثبت‌شده', items: other })
  groups.push({
    id: 'sale',
    title: 'واحد عرضه',
    items: [{ key: 'unitOfSale', label: 'واحد فروش', value: product.unit }],
  })
  return groups
}

/** These are UI demonstration increments, never verified supplier minimum orders. */
export function getProductOrdering(product: CatalogProduct): ProductOrdering {
  const fractional = ['تن', 'کیلوگرم', 'مترمربع', 'متر مربع', 'متر'].includes(product.unit)
  const minimum = product.unit === 'تن' ? 0.5 : 1
  return {
    unit: product.unit,
    minimum,
    step: fractional ? 0.5 : 1,
    maximum: 1_000_000,
    precision: fractional ? 1 : 0,
    scale: fractional ? 10 : 1,
    note: 'حداقل و گام مقدار، فقط قواعد نمایشی این رابط هستند؛ حداقل سفارش واقعی و شرایط فروش باید تأیید شوند.',
  }
}

function getVariantGroup(
  product: CatalogProduct,
  products: readonly CatalogProduct[],
): ProductVariantGroup | null {
  let id: ProductVariantGroup['id']
  let label: string
  let keys: readonly string[]
  if (product.categoryId === 'rebar' && product.subcategoryId === 'rebar') {
    id = 'rebar-diameter'
    label = 'قطر میلگرد'
    keys = ['rebar-10', 'rebar-12', 'rebar-14', 'rebar-16', 'rebar-18', 'rebar-20']
  } else if (product.categoryId === 'cement' && product.subcategoryId === 'block') {
    id = 'concrete-block-width'
    label = 'عرض بلوک'
    keys = ['block-concrete-15', 'block-concrete-20']
  } else return null
  // Explicit fixture-family membership avoids turning unrelated brands/materials into variants.
  if (!keys.includes(product.slug)) return null
  const options = keys.flatMap((slug) => {
    const variant = products.find(
      (entry) =>
        entry.slug === slug &&
        entry.categoryId === product.categoryId &&
        entry.subcategoryId === product.subcategoryId &&
        entry.brand === product.brand &&
        entry.unit === product.unit,
    )
    if (!variant) return []
    const value =
      id === 'rebar-diameter'
        ? variant.specifications.diameter
        : variant.specifications.dimensions?.split(' × ').at(-1)
    if (!value) return []
    return [
      {
        id: variant.id,
        productId: variant.id,
        slug: variant.slug,
        label: value,
        value,
        priceRial: variant.priceRial,
        availability: variant.availability,
      },
    ]
  })
  return options.length > 1
    ? {
        id,
        label,
        selectedId: product.id,
        options,
        note: 'این گزینه‌ها اقلام مستقلِ همین فهرست نمایشی‌اند؛ با انتخاب هر گزینه، مشخصات و قیمت همان قلم نمایش داده می‌شود.',
      }
    : null
}

const categoryCopy: Record<string, { uses: string; considerations: string }> = {
  cement: {
    uses: 'این نمونه برای بررسی مصالح پایه و مقایسه نوع، بسته‌بندی یا ابعاد ثبت‌شده در مسیر انتخاب اقلام پروژه ارائه شده است. کاربرد نهایی و مقدار مصرف به اطلاعات فنی تأییدشده نیاز دارد.',
    considerations:
      'پیش از خرید، نوع و مقدار موردنیاز، وضعیت بسته‌بندی، شرایط نگهداری و روش تخلیه را با اطلاعات واقعی کالا تطبیق دهید. این صفحه شرایط انبارش یا تحویل مشخصی را تضمین نمی‌کند.',
  },
  rebar: {
    uses: 'این رکورد برای بررسی مقاطع فولادی و مقایسه قطر، ابعاد یا طول ثبت‌شده در فهرست پروژه است. داده نمایشی جایگزین مشخصات فنی و تأیید مهندس پروژه نیست.',
    considerations:
      'پیش از خرید، قطر یا مقطع، طول، گرید تأییدشده و مدارک محصول را با نیاز پروژه تطبیق دهید. گرید فولاد در داده فعلی تأیید نشده و در جدول نمایش داده نمی‌شود؛ شرایط حمل و تخلیه نیز باید جداگانه تأیید شود.',
  },
  stone: {
    uses: 'این نمونه برای مقایسه گزینه‌های سنگ و پوشش سرامیکی پروژه است. مناسب‌بودن برای کف، دیوار یا فضای بیرونی در داده فعلی تأیید نشده است.',
    considerations:
      'ابعاد، پرداخت سطح و جنس ثبت‌شده را بررسی کنید. ضخامت، پوشش هر بسته، محل نصب مناسب و هماهنگی رنگ و بافت باید پیش از خرید واقعی تأیید شوند؛ این موارد در داده فعلی تکمیل نشده‌اند.',
  },
  bathroom: {
    uses: 'این نمونه برای بررسی تجهیزات بهداشتی و مقایسه نوع نصب، رنگ و مشخصات موجود در فهرست است. سازگاری با محل نصب و اتصالات باید جداگانه بررسی شود.',
    considerations:
      'پیش از خرید واقعی، ابعاد محل نصب، جنس بدنه، جزئیات اتصال و روش نگهداری مورد تأیید سازنده را دریافت کنید. داده نمایشی شامل تأییدیه جنس، ضمانت یا اقلام همراه نیست.',
  },
  lighting: {
    uses: 'این نمونه برای بررسی گزینه‌های روشنایی و هماهنگی فرم و رنگ با فضای پروژه است. مقدار روشنایی، توان و جزئیات نصب فقط در صورت وجود داده تأییدشده قابل اتکا خواهند بود.',
    considerations:
      'ابعاد محل نصب، منبع نور، توان، اتصالات و شرایط نصب را پیش از خرید واقعی تأیید کنید. این صفحه شدت نور، لامپ همراه یا ویژگی ایمنی تأییدشده‌ای را ادعا نمی‌کند.',
  },
  doors: {
    uses: 'این نمونه برای مقایسه گزینه‌های در و پنجره بر اساس جنس، ابعاد و نوع بازشوی ثبت‌شده ارائه شده است. اندازه‌برداری محل نصب و سازگاری یراق‌آلات باید تأیید شود.',
    considerations:
      'ابعاد نهایی، جهت بازشو، جزئیات نصب، یراق‌آلات و شرایط حمل را پیش از خرید واقعی مشخص کنید. هیچ عملکرد عایق، مقاومت یا خدمت نصب تأییدشده‌ای در داده فعلی ادعا نشده است.',
  },
  tools: {
    uses: 'کاربرد ثبت‌شده این ابزار در جدول مشخصات آمده است؛ این رکورد برای مقایسه نوع ابزار و منبع تغذیه ارائه می‌شود. اطلاعات سازگاری و روش استفاده باید با راهنمای مدل واقعی تطبیق داده شود.',
    considerations:
      'مدل، منبع تغذیه، لوازم همراه و مدارک فنی را پیش از خرید واقعی بررسی کنید. تصویر، نمایش عمومی گروه ابزار است و عکس دقیق مدل برند نیست؛ باتری، شارژر، ضمانت یا موجودی واقعی از این تصویر قابل استنباط نیست.',
  },
}

function getDescriptionSections(
  product: CatalogProduct,
  specifications: ProductSpecificationGroup[],
): ProductDescriptionSection[] {
  const copy = categoryCopy[product.categoryId] ?? {
    uses: 'این رکورد برای بررسی و مقایسه محصول در فهرست نمایشی سیوان ارائه شده است.',
    considerations: 'مشخصات، قیمت، موجودی و شرایط تحویل پیش از هر خرید واقعی باید تأیید شوند.',
  }
  const characteristics = specifications
    .flatMap((group) => group.items)
    .filter((item) => item.key !== 'unitOfSale')
    .map((item) => `${item.label}: ${item.value}`)
  return [
    { id: 'introduction', title: 'معرفی محصول', paragraphs: [product.description] },
    { id: 'uses', title: 'کاربرد و انتخاب', paragraphs: [copy.uses] },
    {
      id: 'characteristics',
      title: 'ویژگی‌های ثبت‌شده',
      paragraphs: [characteristics.join('؛ ') || 'مشخصات تکمیلی این نمونه هنوز ثبت نشده است.'],
    },
    {
      id: 'considerations',
      title: 'نکات پیش از خرید',
      paragraphs: [
        copy.considerations,
        'قیمت، موجودی، مشخصات نمونه و قواعد مقدار در این صفحه نمایشی‌اند و پیشنهاد فروش یا تأیید سفارش واقعی محسوب نمی‌شوند.',
      ],
    },
  ]
}

export function getProductDetail(
  product: CatalogProduct,
  products: readonly CatalogProduct[] = catalogProducts,
): ProductDetail {
  const specifications = getSpecificationGroups(product)
  const images = [
    {
      id: `${product.id}-primary`,
      src: product.image,
      alt: product.imageAlt,
      width: 640,
      height: 640,
    },
  ]
  return {
    product,
    images: images.filter(
      (image, index, collection) =>
        collection.findIndex((entry) => entry.src === image.src) === index,
    ),
    specifications,
    descriptionSections: getDescriptionSections(product, specifications),
    ordering: getProductOrdering(product),
    variants: getVariantGroup(product, products),
  }
}

/** Same-category recommendations; prefer complementary subcategories, never the current SKU. */
export function getRelatedProducts(
  product: CatalogProduct,
  products: readonly CatalogProduct[] = catalogProducts,
  limit = 4,
): CatalogProduct[] {
  const count = Number.isSafeInteger(limit) ? Math.min(8, Math.max(0, limit)) : 4
  return products
    .filter((entry) => entry.categoryId === product.categoryId && entry.id !== product.id)
    .map((entry, index) => ({ entry, index }))
    .sort(
      (left, right) =>
        Number(left.entry.subcategoryId === product.subcategoryId) -
          Number(right.entry.subcategoryId === product.subcategoryId) || left.index - right.index,
    )
    .slice(0, count)
    .map(({ entry }) => entry)
}

function quantityToScaled(input: number | string, ordering: ProductOrdering): number | null {
  if (typeof input === 'number' && !Number.isFinite(input)) return null
  let text = normalizeCatalogText(String(input)).replaceAll('٫', '.')
  if (!/^(?:\d+|\d{1,3}(?:[,٬]\d{3})+)(?:\.\d+)?$/.test(text)) return null
  text = text.replace(/[,٬]/g, '')
  const [integer = '', rawFraction = ''] = text.split('.')
  const fraction = rawFraction.replace(/0+$/, '')
  if (fraction.length > ordering.precision || integer.length > 9) return null
  const scaled =
    Number(integer) * ordering.scale + Number(fraction.padEnd(ordering.precision, '0') || '0')
  return Number.isSafeInteger(scaled) ? scaled : null
}

export function validateProductQuantity(
  input: number | string,
  ordering: ProductOrdering,
): QuantityValidation {
  const scaled = quantityToScaled(input, ordering)
  if (scaled === null)
    return {
      valid: false,
      code: 'invalid',
      message: 'مقدار را با عدد معتبر و مطابق گام نمایشی وارد کنید.',
    }
  const minimum = Math.round(ordering.minimum * ordering.scale)
  const maximum = Math.round(ordering.maximum * ordering.scale)
  const step = Math.round(ordering.step * ordering.scale)
  if (scaled < minimum)
    return { valid: false, code: 'minimum', message: 'مقدار از حداقل نمایشی این محصول کمتر است.' }
  if (scaled > maximum)
    return { valid: false, code: 'maximum', message: 'مقدار از سقف نمایشی این رابط بیشتر است.' }
  if ((scaled - minimum) % step !== 0)
    return { valid: false, code: 'step', message: 'مقدار باید با گام نمایشی این واحد هماهنگ باشد.' }
  return { valid: true, quantity: scaled / ordering.scale, scaled }
}

export function stepProductQuantity(
  input: number | string,
  ordering: ProductOrdering,
  direction: 1 | -1,
): number {
  const current = validateProductQuantity(input, ordering)
  if (!current.valid) return ordering.minimum
  const scaled = Math.min(
    Math.round(ordering.maximum * ordering.scale),
    Math.max(
      Math.round(ordering.minimum * ordering.scale),
      current.scaled + direction * Math.round(ordering.step * ordering.scale),
    ),
  )
  return scaled / ordering.scale
}

export function calculateLineTotalRial(
  priceRial: number | null,
  quantity: number | string,
  ordering: ProductOrdering,
): number | null {
  const validated = validateProductQuantity(quantity, ordering)
  if (priceRial === null || !Number.isSafeInteger(priceRial) || priceRial < 0 || !validated.valid)
    return null
  const total = (priceRial * validated.scaled) / ordering.scale
  return Number.isSafeInteger(total) ? total : null
}
