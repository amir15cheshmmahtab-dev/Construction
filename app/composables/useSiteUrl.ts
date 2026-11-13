/** Build public metadata URLs for root deployments and project subdirectories. */
export function useSiteUrl() {
  const { publicAsset } = usePublicAssets()
  const origin = useRuntimeConfig().public.siteUrl || useRequestURL().origin
  return (path: string) => new URL(publicAsset(path), origin).href
}
