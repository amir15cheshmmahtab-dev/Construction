import type { Service } from '~/types/marketplace'

// Planned service presentation; no service commitment or operational claim.
export const services: Service[] = [
  {
    id: 'support',
    title: 'پشتیبانی اختصاصی',
    description: 'همراهی در انتخاب بهتر',
    icon: 'Headset',
  },
  {
    id: 'pricing',
    title: 'قیمت‌های رقابتی',
    description: 'برای خریدهای عمده',
    icon: 'Layers3',
  },
  {
    id: 'delivery',
    title: 'برنامه‌ریزی تحویل',
    description: 'هماهنگ با زمان‌بندی پروژه',
    icon: 'Truck',
  },
  {
    id: 'quote',
    title: 'استعلام قیمت',
    description: 'بررسی نیازهای هر پروژه',
    icon: 'ScanLine',
  },
]
