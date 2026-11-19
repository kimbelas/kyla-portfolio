import { test, expect } from '@playwright/test'

const ROTATING = [
  'Construction Operations',
  'Project Management',
  'Executive Assistance',
  'Sales & Lead Generation',
  'Marketing & Social Media',
  'Business Operations',
]

test('single h1 with the headline', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toHaveText(
    'I keep projects, people & pipelines moving.',
  )
})

test('rotating word list is readable as text', async ({ page }) => {
  await page.goto('/')
  const list = page.locator('[data-rotating-list]')
  await expect(list).toHaveCount(1)
  const text = (await list.textContent()) ?? ''
  for (const value of ROTATING) expect(text).toContain(value)
  await expect(
    page.locator('[data-rotating] [aria-hidden="true"]'),
  ).toHaveCount(1)
  await expect(page.locator('[data-rotating-word]')).toHaveCount(6)
})

test('portrait is the LCP candidate', async ({ page }) => {
  await page.goto('/')
  const img = page.getByRole('img', { name: 'Portrait of Kyla Belas' })
  await expect(img).toHaveAttribute('fetchpriority', 'high')
  await expect(img).not.toHaveAttribute('loading', 'lazy')
})

test('highlights show $253.81K and the self-intro tile', async ({ page }) => {
  await page.goto('/')
  const highlights = page.getByRole('region', { name: 'Highlights' })
  await expect(highlights.getByText('$253.81K')).toBeVisible()
  await expect(highlights.getByText('Self introduction')).toBeVisible()
  await expect(highlights.getByText('Recorded early 2025')).toBeVisible()
  const play = highlights.locator('a[data-play-featured]')
  await expect(play).toHaveAttribute('href', '#calls')
  await expect(play).toHaveAccessibleName('Play Self introduction')
  const bars = highlights.locator('progress')
  await expect(bars).toHaveCount(2)
  await expect(bars.nth(0)).toHaveAttribute('aria-label', 'July 2025')
  await expect(bars.nth(1)).toHaveAttribute('aria-label', 'July 2026')
  await expect(bars.nth(1)).toHaveAttribute('value', '253.81')
  await expect(bars.nth(1)).toHaveAttribute('max', '253.81')
  await expect(bars.nth(0)).toHaveAttribute('value', '28.91')
})

test('stats strip shows 6+, 10.29%, 5-12, 20%', async ({ page }) => {
  await page.goto('/')
  const stats = page.getByRole('region', { name: 'In numbers' })
  for (const v of ['6+', '10.29%', '5-12', '20%'])
    await expect(stats.getByText(v, { exact: true })).toBeVisible()
})

test('expertise renders 6 cards with italic numerals 01..06', async ({
  page,
}) => {
  await page.goto('/')
  const cards = page.locator('#expertise article')
  await expect(cards).toHaveCount(6)
  for (let i = 0; i < 6; i++) {
    const numeral = cards.nth(i).locator('[data-numeral]')
    await expect(numeral).toHaveText(`0${i + 1}`)
    expect(await numeral.evaluate((el) => getComputedStyle(el).fontStyle)).toBe(
      'italic',
    )
  }
})

test('reduced motion stops the rotating word', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const name = await page
    .locator('[data-rotating-word]')
    .first()
    .evaluate((el) => getComputedStyle(el).animationName)
  expect(name).toBe('none')
})

test('home JSON-LD has WebSite, ProfilePage and Person', async ({ page }) => {
  await page.goto('/')
  const types = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) =>
      els.map((e) => JSON.parse(e.textContent ?? '')['@type']),
    )
  expect(types).toEqual(
    expect.arrayContaining(['WebSite', 'ProfilePage', 'Person']),
  )
})

test('anchors clear the sticky nav', async ({ page }) => {
  await page.goto('/')
  for (const id of ['top', 'about', 'expertise']) {
    const mt = await page
      .locator(`#${id}`)
      .evaluate((el) => parseFloat(getComputedStyle(el).scrollMarginTop))
    expect(mt).toBeGreaterThanOrEqual(96)
  }
})
