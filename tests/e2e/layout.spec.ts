import { test, expect } from '@playwright/test'
import { PAGES } from './pages'

test('tokens and fonts', async ({ page }) => {
  await page.goto('/')
  expect(
    await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
  ).toBe('rgb(251, 246, 241)')
  expect(
    await page.evaluate(() => getComputedStyle(document.body).fontFamily),
  ).toContain('Manrope')
})

test('no third-party requests on load', async ({ page }) => {
  const hosts = new Set<string>()
  page.on('request', (r) => hosts.add(new URL(r.url()).host))
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  expect([...hosts]).toEqual(['localhost:4321'])
})

test('skip link is the first focusable element', async ({
  page,
  browserName,
}) => {
  test.skip(browserName === 'webkit', 'WebKit does not Tab to links by default')
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.locator(':focus')).toHaveText('Skip to content')
})

test('404 is noindex', async ({ page }) => {
  await page.goto('/404.html')
  await expect(page.locator('meta[name=robots]')).toHaveAttribute(
    'content',
    'noindex',
  )
})

for (const path of PAGES) {
  test(`no horizontal overflow at 320px: ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 })
    await page.goto(path)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(320)
  })
}
