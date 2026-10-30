import type { HomepageData } from '~/types/marketplace'
import { categories } from './categories'
import { navigation } from './navigation'
import { products } from './products'
import { projects } from './projects'
import { services } from './services'

export { brand } from './brand'
export { categories, navigation, products, projects, services }

export const homepageData: HomepageData = {
  navigation,
  categories,
  projects,
  products,
  services,
}
