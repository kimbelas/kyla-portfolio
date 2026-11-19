import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { test, expect } from '@playwright/test'

const figures = '[data-work-grid] figure'

test('/work/ shows 38 pieces; /work/architecture/ shows 9', async ({
  page,
}) => {
  await page.goto('/work/')
  await expect(page.locator(figures)).toHaveCount(38)
  await page.goto('/work/architecture/')
  await expect(page.locator(figures)).toHaveCount(9)
  await expect(page.locator('meta[name=description]')).toHaveAttribute(
    'content',
    /9 Architecture pieces/,
  )
})

test('category links are crawlable anchors with counts', async ({ page }) => {
  await page.goto('/work/')
  const nav = page.getByRole('navigation', { name: 'Portfolio categories' })
  const expected: [string, string][] = [
    ['All work 38', '/work/'],
    ['Architecture 9', '/work/architecture/'],
    ['2A Construction 7', '/work/construction/'],
    ['Marketing 20', '/work/marketing/'],
    ['Business records 2', '/work/growth/'],
  ]
  for (const [name, href] of expected) {
    const link = nav.getByRole('link', { name })
    await expect(link).toHaveAttribute('href', href)
  }
  await expect(nav.getByRole('link', { name: 'All work 38' })).toHaveAttribute(
    'aria-current',
    'page',
  )
})

test('home preview shows 9 pieces in homeOrder and links to /work/', async ({
  page,
}) => {
  await page.goto('/')
  const items = page.locator(`#work ${figures}`)
  await expect(items).toHaveCount(9)
  const titles = await items.locator('figcaption em').allTextContents()
  const entries = parse(readFileSync('src/content/portfolio.yaml', 'utf8')) as {
    title: string
    homeOrder?: number
  }[]
  const expected = entries
    .filter((e) => e.homeOrder !== undefined)
    .sort((a, b) => a.homeOrder! - b.homeOrder!)
    .map((e) => e.title)
  expect(titles.map((s) => s.trim())).toEqual(expected)
  const link = page.getByRole('link', { name: 'See all 38 pieces' })
  await expect(link).toHaveAttribute('href', '/work/')
})

test('lightbox opens, steps, and Escape closes only the lightbox', async ({
  page,
}) => {
  await page.goto('/work/')
  const first = page.locator(`${figures} a`).first()
  await first.click()
  const dialog = page.locator('dialog[data-lightbox-dialog]')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('[data-lightbox-count]')).toHaveText('1 / 38')
  await page.keyboard.press('ArrowLeft')
  await expect(dialog.locator('[data-lightbox-count]')).toHaveText('38 / 38')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(first).toBeFocused()
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('works without JavaScript', async ({ page }) => {
    await page.goto('/work/')
    const first = page.locator(`${figures} a`).first()
    const href = await first.getAttribute('href')
    await first.click()
    await page.waitForLoadState()
    expect(new URL(page.url()).pathname).toBe(href)
    await page.goto('/work/')
    await page.getByRole('link', { name: 'Architecture 9' }).click()
    await expect(page).toHaveURL(/\/work\/architecture\/$/)
    await expect(page.locator(figures)).toHaveCount(9)
  })
})

test('images have width and height attributes', async ({ page }) => {
  await page.goto('/work/')
  const missing = await page
    .locator(`${figures} img`)
    .evaluateAll(
      (imgs) =>
        imgs.filter(
          (i) => !i.getAttribute('width') || !i.getAttribute('height'),
        ).length,
    )
  expect(missing).toBe(0)
})

test('ItemList JSON-LD has 38 entries on /work/', async ({ page }) => {
  await page.goto('/work/')
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents()
  const list = blocks
    .map((b) => JSON.parse(b))
    .flatMap((b) => (Array.isArray(b) ? b : [b]))
    .find((b) => b['@type'] === 'ItemList')
  expect(list.itemListElement).toHaveLength(38)
})
