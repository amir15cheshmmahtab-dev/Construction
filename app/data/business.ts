interface BusinessAction {
  id: 'supplier' | 'buyer'
  label: string
  notice: string
}

interface BusinessPromotion {
  image: {
    src: string
    widths: number[]
    alt: string
    width: number
    height: number
  }
  eyebrow: string
  headline: readonly [string, string]
  description: string
  availabilityNote: string
  actions: BusinessAction[]
}

export const businessPromotion: BusinessPromotion = {
  // Public assets are runtime URLs, not imports for Vite's asset pipeline.
  image: {
    src: '/images/business/partnership.webp',
    widths: [640, 960, 1920],
    alt: 'همکاری نمایندگان تأمین‌کننده مصالح و شرکت ساختمانی در جلسه بررسی نمونه‌های مصالح و نقشه پروژه',
    width: 1920,
    height: 686,
  },
  eyebrow: 'BUSINESS PARTNERSHIPS',
  headline: ['از فروش محصولات شما', 'تا تأمین پروژه‌های بزرگ'],
  description:
    'برای تولیدکنندگان و تأمین‌کنندگان، فرصتی برای عرضه محصولات؛ برای شرکت‌های ساختمانی، مسیری برای خرید عمده مصالح پروژه‌ها.',
  availabilityNote: 'مسیرهای همکاری سازمانی به‌زودی فعال می‌شوند.',
  actions: [
    {
      id: 'supplier',
      label: 'همکاری برای فروش محصولات',
      notice:
        'مسیر همکاری تولیدکنندگان و تأمین‌کنندگان برای عرضه محصولات در حال آماده‌سازی است؛ فرم ثبت درخواست هنوز فعال نیست.',
    },
    {
      id: 'buyer',
      label: 'همکاری برای خرید عمده',
      notice:
        'مسیر همکاری شرکت‌های ساختمانی برای خرید عمده در حال آماده‌سازی است؛ ثبت درخواست و استعلام واقعی هنوز فعال نیست.',
    },
  ],
}
