import { test, expect } from '@playwright/test'
import { countIn, portfolio } from './content'

const figures = '[data-work-grid] figure'
const all = portfolio.length
const architecture = countIn('architecture')

test('/work/ and /work/architecture/ show every piece in the YAML', async ({
  page,
}) => {
  await page.goto('/work/')
  await expect(page.locator(figures)).toHaveCount(all)
  await page.goto('/work/architecture/')
  await expect(page.locator(figures)).toHaveCount(architecture)
  await expect(page.locator('meta[name=description]')).toHaveAttribute(
    'content',
    new RegExp(`${architecture} Architecture pieces`),
  )
})

test('category links are crawlable anchors with counts', async ({ page }) => {
  await page.goto('/work/')
  const nav = page.getByRole('navigation', { name: 'Portfolio categories' })
  const expected: [string, string][] = [
    [`All work ${all}`, '/work/'],
    [`Architecture ${architecture}`, '/work/architecture/'],
    [`2A Construction ${countIn('construction')}`, '/work/construction/'],
    [`Marketing ${countIn('marketing')}`, '/work/marketing/'],
    [`Business records ${countIn('growth')}`, '/work/growth/'],
  ]
  for (const [name, href] of expected) {
    const link = nav.getByRole('link', { name })
    await expect(link).toHaveAttribute('href', href)
  }
  await expect(
    nav.getByRole('link', { name: `All work ${all}` }),
  ).toHaveAttribute('aria-current', 'page')
})

test('home preview shows the homeOrder pieces in order and links to /work/', async ({
  page,
}) => {
  await page.goto('/')
  const items = page.locator(`#work ${figures}`)
  const expected = portfolio
    .filter((e) => e.homeOrder !== undefined)
    .sort((a, b) => a.homeOrder! - b.homeOrder!)
    .slice(0, 9)
    .map((e) => e.title)
  await expect(items).toHaveCount(expected.length)
  const titles = await items.locator('figcaption em').allTextContents()
  expect(titles.map((s) => s.trim())).toEqual(expected)
  const link = page.getByRole('link', { name: `See all ${all} pieces` })
  await expect(link).toHaveAttribute('href', '/work/')
})

// The open mobile menu overlays the page and locks scroll, so a lightbox link cannot
// be clicked while it is open; the menu/lightbox Escape contract is covered by the
// unit tests (lightbox Escape is defaultPrevented, menu ignores it).
test('lightbox opens, steps with arrows, and Escape closes it and restores focus', async ({
  page,
}) => {
  await page.goto('/work/')
  const first = page.locator(`${figures} a`).first()
  await first.click()
  const dialog = page.locator('dialog[data-lightbox-dialog]')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('[data-lightbox-count]')).toHaveText(`1 / ${all}`)
  await page.keyboard.press('ArrowLeft')
  await expect(dialog.locator('[data-lightbox-count]')).toHaveText(
    `${all} / ${all}`,
  )
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
    await page
      .getByRole('link', { name: `Architecture ${architecture}` })
      .click()
    await expect(page).toHaveURL(/\/work\/architecture\/$/)
    await expect(page.locator(figures)).toHaveCount(architecture)
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

test('ItemList JSON-LD has one entry per piece on /work/', async ({ page }) => {
  await page.goto('/work/')
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents()
  const list = blocks
    .map((b) => JSON.parse(b))
    .flatMap((b) => (Array.isArray(b) ? b : [b]))
    .find((b) => b['@type'] === 'ItemList')
  expect(list.itemListElement).toHaveLength(all)
})
