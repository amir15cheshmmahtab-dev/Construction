import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { catalogProducts } from '../app/data/catalog.ts'

const outputDirectory = resolve(import.meta.dirname, '../.output/public')
const baseSegment = (process.env.NUXT_APP_BASE_URL ?? '/Construction/').replace(/^\/+|\/+$/g, '')
const baseURL = baseSegment ? `/${baseSegment}/` : '/'
const origin = new URL(
  process.env.NUXT_PUBLIC_SITE_URL || 'https://amir15cheshmmahtab-dev.github.io',
).origin
const publicURL = (path) => new URL(`${baseURL}${path.replace(/^\//, '')}`, origin).href
const errors = []
const fileChecks = new Map()
const assets = new Set()

async function fileExists(path) {
  if (!fileChecks.has(path)) {
    fileChecks.set(
      path,
      stat(resolve(outputDirectory, path))
        .then((entry) => entry.isFile())
        .catch(() => false),
    )
  }
  return fileChecks.get(path)
}

function decodeAttribute(value) {
  return value
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
}

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((match) => [
      match[1].toLowerCase(),
      decodeAttribute(match[2] ?? match[3]),
    ]),
  )
}

async function verifyAsset(reference, page) {
  if (!reference || /^(?:#|data:|blob:|mailto:|tel:)/i.test(reference)) return
  let url
  try {
    url = new URL(reference, publicURL(page.route))
  } catch {
    errors.push(`${page.file}: invalid asset URL ${reference}`)
    return
  }
  if (url.origin !== origin) return
  const isAsset = /\/(?:images|fonts|_nuxt)\//.test(url.pathname) || /\.svg$/i.test(url.pathname)
  if (!isAsset) return
  if (!url.pathname.startsWith(baseURL)) {
    errors.push(`${page.file}: asset is outside ${baseURL}: ${reference}`)
    return
  }
  const relativePath = decodeURIComponent(url.pathname.slice(baseURL.length))
  assets.add(relativePath)
  if (!(await fileExists(relativePath))) {
    errors.push(`${page.file}: missing asset ${reference} (expected ${relativePath})`)
  }
}

const pages = [
  { file: 'index.html', route: '/', image: '/images/hero/residence.webp' },
  { file: 'products/index.html', route: '/products', canonical: true },
  { file: '404.html', route: '/404' },
  ...catalogProducts.map((product) => ({
    file: `products/${product.slug}/index.html`,
    route: `/products/${product.slug}`,
    canonical: true,
    image: product.image,
    product: true,
  })),
]

if (!(await fileExists('.nojekyll'))) errors.push('Missing .nojekyll in .output/public')

for (const page of pages) {
  if (!(await fileExists(page.file))) {
    errors.push(`Missing prerendered page .output/public/${page.file}`)
    continue
  }
  const html = await readFile(resolve(outputDirectory, page.file), 'utf8')
  const tags = [...html.matchAll(/<([a-z][\w:-]*)\b[^>]*>/gi)].map((match) => ({
    name: match[1].toLowerCase(),
    attrs: attributes(match[0]),
  }))
  const canonical = tags.find(
    (tag) => tag.name === 'link' && tag.attrs.rel?.split(/\s+/).includes('canonical'),
  )?.attrs.href
  const meta = (property) =>
    tags.find((tag) => tag.name === 'meta' && tag.attrs.property === property)?.attrs.content
  if (page.canonical && canonical !== publicURL(page.route)) {
    errors.push(`${page.file}: canonical must be ${publicURL(page.route)}; got ${canonical}`)
  }
  if (page.image && meta('og:image') !== publicURL(page.image)) {
    errors.push(`${page.file}: og:image must be ${publicURL(page.image)}; got ${meta('og:image')}`)
  }
  if (page.product && meta('og:url') !== publicURL(page.route)) {
    errors.push(`${page.file}: og:url must be ${publicURL(page.route)}; got ${meta('og:url')}`)
  }
  for (const { attrs } of tags) {
    for (const attribute of ['src', 'href']) {
      if (attrs[attribute]) await verifyAsset(attrs[attribute], page)
    }
    if (attrs.srcset) {
      for (const candidate of attrs.srcset.split(',')) {
        await verifyAsset(candidate.trim().split(/\s+/)[0], page)
      }
    }
  }
}

if (errors.length) {
  throw new Error(
    `GitHub Pages verification failed (${errors.length} problems):\n${errors
      .slice(0, 20)
      .map((message) => `- ${message}`)
      .join('\n')}${errors.length > 20 ? '\n- Further problems omitted.' : ''}`,
  )
}

console.log(
  `GitHub Pages verified: ${pages.length} HTML pages, ${catalogProducts.length} products, ${assets.size} assets; ${origin}${baseURL}`,
)
