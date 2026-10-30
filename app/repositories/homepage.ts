import { homepageData } from '~/data/home'
import type { HomepageData } from '~/types/marketplace'

export interface HomepageRepository {
  getHomepage(): Promise<HomepageData>
}

// Replace this adapter with an HTTP implementation when an actual API exists.
// Return copies so the query cache cannot mutate the exported demo fixtures.
export const homepageRepository: HomepageRepository = {
  getHomepage() {
    return Promise.resolve(structuredClone(homepageData))
  },
}
