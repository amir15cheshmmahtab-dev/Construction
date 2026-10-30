import type { Project } from '~/types/marketplace'

export const projects: Project[] = [
  {
    id: 'house',
    name: 'ساخت ساختمان از صفر',
    description: 'از اولین پی تا آخرین جزئیات',
    image: '/images/projects/house.webp',
  },
  {
    id: 'kitchen',
    name: 'بازسازی آشپزخانه',
    description: 'قلب خانه را دوباره بسازید',
    image: '/images/projects/kitchen.webp',
  },
  {
    id: 'bathroom',
    name: 'بازسازی حمام',
    description: 'جایی برای آرامش هر روز',
    image: '/images/projects/bathroom.webp',
  },
  {
    id: 'living',
    name: 'بازسازی منزل',
    description: 'نگاهی تازه به فضای زندگی',
    image: '/images/projects/living.webp',
  },
]
