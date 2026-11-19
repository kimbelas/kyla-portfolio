import { expect, test } from '@playwright/test'
import { PAGES } from './pages'

const SITE_URL = 'http://localhost:4321'
const INDEXABLE = PAGES.filter((p) => p !== '/404.html')

async function head(page: import('@playwright/test').Page, path: string) {
  await page.goto(path)
  return {
    title: await page.title(),
    h1: await page.locator('h1').count(),
    description: await page
      .locator('meta[name="description"]')
      .getAttribute('content'),
    canonical: await page.locator('link[rel="canonical"]').getAttribute('href'),
    ogImage: await page
      .locator('meta[property="og:image"]')
      .getAttribute('content'),
  }
}

test('titles are unique across pages', async ({ page }) => {
  const titles: string[] = []
  for (const path of INDEXABLE) titles.push((await head(page, path)).title)
  expect(new Set(titles).size).toBe(titles.length)
})

for (const path of INDEXABLE) {
  test(`seo basics ${path}`, async ({ page }) => {
    const h = await head(page, path)
    expect(h.h1).toBe(1)
    expect(h.description!.length).toBeGreaterThanOrEqual(50)
    expect(h.description!.length).toBeLessThanOrEqual(160)
    expect(h.canonical).toBe(new URL(path, SITE_URL).href)
    expect(h.ogImage).toBe(`${SITE_URL}/og/default.png`)
  })

  test(`json-ld parses ${path}`, async ({ page }) => {
    await page.goto(path)
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents()
    for (const raw of blocks) {
      const data = JSON.parse(raw)
      expect(data['@context']).toBe('https://schema.org')
    }
  })
}

test('sitemap lists every indexable page and not the 404', async ({
  request,
}) => {
  const index = await request.get('/sitemap-index.xml')
  expect(index.status()).toBe(200)
  const sitemapUrl = (await index.text()).match(/<loc>([^<]+)<\/loc>/)![1]
  const res = await request.get(new URL(sitemapUrl).pathname)
  const locs = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => m[1],
  )
  for (const path of INDEXABLE)
    expect(locs).toContain(new URL(path, SITE_URL).href)
  expect(locs.some((l) => l.includes('404'))).toBe(false)
})

test('robots.txt and llms.txt are served', async ({ request }) => {
  const robots = await request.get('/robots.txt')
  expect(await robots.text()).toContain(
    `Sitemap: ${SITE_URL}/sitemap-index.xml`,
  )
  const llms = await request.get('/llms.txt')
  expect(await llms.text()).toMatch(/^# Kyla Belas\n\n> /)
})
