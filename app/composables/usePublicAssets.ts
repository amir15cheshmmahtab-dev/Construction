export function usePublicAssets() {
  const baseURL = useRuntimeConfig().app.baseURL.replace(/\/$/, '')

  function publicAsset(path: string) {
    return `${baseURL}/${path.replace(/^\//, '')}`
  }

  function imageSrcset(path: string, widths: number[]) {
    return widths
      .map((width, index) => {
        const source =
          index === widths.length - 1 ? path : path.replace(/\.webp$/, `-${width}.webp`)
        return `${publicAsset(source)} ${width}w`
      })
      .join(', ')
  }

  return { publicAsset, imageSrcset }
}
