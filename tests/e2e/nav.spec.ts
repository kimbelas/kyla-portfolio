import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const LABELS = [
  '01About',
  '02Expertise',
  '03Calls',
  '04Work',
  '05Experience',
  '06Kind words',
]

const isDesktop = (page: { viewportSize(): { width: number } | null }) =>
  (page.viewportSize()?.width ?? 0) > 1100

test('desktop shows six numbered links and hides the menu button', async ({
  page,
}) => {
  test.skip(!isDesktop(page), 'desktop only')
  await page.goto('/')
  const links = page.getByRole('navigation', { name: 'Main' }).getByRole('link')
  await expect(links).toHaveCount(6)
  const texts = (await links.allTextContents()).map((t) =>
    t.replace(/\s+/g, ''),
  )
  expect(texts).toEqual(LABELS.map((l) => l.replace(/\s+/g, '')))
  await expect(page.locator('[data-menu-toggle]')).toBeHidden()
  await expect(page.getByText('Hear me · 1:42')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Let’s talk' })).toBeVisible()
})

test('phone shows wordmark, play and menu buttons only', async ({ page }) => {
  test.skip(isDesktop(page), 'phone only')
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Kyla Belas' })).toBeVisible()
  await expect(
    page.getByRole('link', { name: /Hear me · 1:42, play self introduction/ }),
  ).toBeVisible()
  await expect(page.locator('[data-menu-toggle]')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden()
  await expect(page.getByText('Hear me · 1:42')).toBeHidden()
  await expect(
    page.locator('header').getByRole('link', { name: 'Let’s talk' }),
  ).toBeHidden()
})

test('open menu lists 6 links, Let’s talk, LinkedIn, Upwork, OnlineJobs.ph', async ({
  page,
}) => {
  test.skip(isDesktop(page), 'phone only')
  await page.goto('/')
  await page.getByRole('button', { name: 'Open menu' }).click()
  const card = page.locator('[data-menu-card]')
  await expect(
    card.getByRole('navigation', { name: 'Menu' }).getByRole('link'),
  ).toHaveCount(6)
  await expect(card.getByRole('link', { name: 'Let’s talk' })).toBeVisible()
  for (const name of ['LinkedIn', 'Upwork', 'OnlineJobs.ph']) {
    const link = card.getByRole('link', { name })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  }
  await expect(card.locator('[data-play-featured]')).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-menu-open', '')
})

test('axe clean with the menu open', async ({ page }) => {
  test.skip(isDesktop(page), 'phone only')
  await page.goto('/')
  await page.locator('[data-menu-toggle]').click()
  const r = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(r.violations).toEqual([])
})

test('Escape closes the open menu and returns focus', async ({ page }) => {
  test.skip(isDesktop(page), 'phone only')
  await page.goto('/')
  const toggle = page.locator('[data-menu-toggle]')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(toggle).toBeFocused()
  await expect(page.locator('[data-menu-card]')).toBeHidden()
})

test('resizing to desktop while open closes the menu and unlocks scroll', async ({
  page,
}) => {
  test.skip(isDesktop(page), 'phone only')
  await page.goto('/')
  const toggle = page.locator('[data-menu-toggle]')
  await toggle.click()
  await expect(page.locator('html')).toHaveAttribute('data-menu-open', '')
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(page.locator('html')).not.toHaveAttribute('data-menu-open', '')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).overflow,
    ),
  ).not.toBe('hidden')
})

test.skip('active link follows scroll', async () => {
  // Needs the real home sections (Task 6 adds this e2e). Covered in jsdom by
  // tests/unit/menu.test.ts for now.
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('nav works without JavaScript', async ({ page }) => {
    await page.goto('/')
    const header = page.locator('header')
    await expect(
      header.locator('a[href^="#"], a[href^="/#"]').first(),
    ).toBeAttached()
    await expect(page.locator('[data-nav-links] a')).toHaveCount(6)
    if (!isDesktop(page)) {
      const summary = page.locator('[data-menu-toggle]')
      await expect(summary).toBeVisible()
      await expect(summary).toHaveAccessibleName('Menu')
      const box = await summary.boundingBox()
      expect(box!.width).toBeGreaterThanOrEqual(44)
      expect(box!.height).toBeGreaterThanOrEqual(44)
      await summary.click()
      await expect(
        page
          .locator('[data-menu-card]')
          .getByRole('link', { name: 'LinkedIn' }),
      ).toBeVisible()
    }
  })
})
