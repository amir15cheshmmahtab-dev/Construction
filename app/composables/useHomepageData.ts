import { useQuery } from '@tanstack/vue-query'
import { onServerPrefetch } from 'vue'
import { homepageRepository } from '~/repositories/homepage'

export function useHomepageData() {
  const query = useQuery({
    queryKey: ['homepage', 'mock-v1'],
    queryFn: () => homepageRepository.getHomepage(),
  })

  // Await the repository during SSR so nuxt-query includes it in its payload.
  onServerPrefetch(() => query.suspense())

  return query
}
