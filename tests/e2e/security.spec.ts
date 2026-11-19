import { readFileSync } from 'node:fs'
import { test, expect, type Page } from '@playwright/test'
import { PAGES } from './pages'

// Parse the global "/*" block of dist/_headers so the tests run under the real policy.
function globalHeaders(): Record<string, string> {
  const lines = readFileSync('dist/_headers', 'utf8').split('\n')
  const start = lines.indexOf('/*')
  const out: Record<string, string> = {}
  for (const line of lines.slice(start + 1)) {
    if (!line.startsWith('  ')) break
    const i = line.indexOf(':')
    out[line.slice(2, i).trim()] = line.slice(i + 1).trim()
  }
  // The test server is plain http: WebKit would upgrade every subresource to https
  // and fail to load it, so drop that one directive here (the unit test covers it).
  const csp = 'Content-Security-Policy'
  out[csp] = out[csp].replace(/;\s*upgrade-insecure-requests/, '')
  return out
}

async function enforce(page: Page): Promise<string[]> {
  const headers = globalHeaders()
  const violations: string[] = []
  page.on('console', (m) => {
    if (/Content Security Policy/i.test(m.text())) violations.push(m.text())
  })
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      console.error(
        `Content Security Policy violation: ${e.violatedDirective} ${e.blockedURI}`,
      )
    })
  })
  await page.route('http://localhost:4321/**', async (route) => {
    const res = await route.fetch()
    await route.fulfill({
      response: res,
      headers: { ...res.headers(), ...headers },
    })
  })
  return violations
}

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' })
})

for (const path of PAGES) {
  test(`no CSP violations: ${path}`, async ({ page }) => {
    const violations = await enforce(page)
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    expect(violations).toEqual([])
  })
}

test('the policy actually applies to the page', async ({ page }) => {
  const violations = await enforce(page)
  await page.goto('/')
  await page.evaluate(() => {
    const s = document.createElement('script')
    s.textContent = 'window.__ranInline = true'
    document.head.append(s)
  })
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { __ranInline?: boolean }).__ranInline === true,
      ),
    )
    .toBe(false)
  await expect.poll(() => violations.length).toBeGreaterThan(0)
})

test('menu, player, lightbox and contact work under the CSP', async ({
  page,
}) => {
  const violations = await enforce(page)
  await page.route('https://formspree.io/**', async (route) => {
    const cors = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
    }
    if (route.request().method() === 'OPTIONS')
      return route.fulfill({ status: 204, headers: cors })
    await route.fulfill({
      status: 200,
      headers: cors,
      contentType: 'application/json',
      body: '{"ok":true}',
    })
  })

  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const toggle = page.locator('[data-menu-toggle]')
  if (await toggle.isVisible()) {
    await toggle.click()
    await expect(page.locator('html')).toHaveAttribute('data-menu-open', '')
    await toggle.click()
    await expect(page.locator('html')).not.toHaveAttribute('data-menu-open', '')
  }

  const chip = page.locator('header [data-play-featured]').first()
  await chip.click()
  await expect(chip).toHaveAttribute('aria-label', /pause self introduction/)
  await chip.click()

  const form = page.locator('#contact form')
  await form.locator('[name=name]').fill('Ann Lee')
  await form.locator('[name=email]').fill('ann@example.com')
  await form
    .locator('[name=message]')
    .fill('Hello Kyla, I would like to talk about a project.')
  await form.getByRole('button', { name: 'Send message' }).click()
  await expect(form.getByRole('status')).toContainText('Thank you')

  await page.goto('/work/')
  await page.waitForLoadState('networkidle')
  await page.locator('a[data-lightbox]').first().click()
  await expect(page.locator('dialog[data-lightbox-dialog]')).toBeVisible()

  expect(violations).toEqual([])
})

test('the player reads #track-data under the CSP', async ({ page }) => {
  const violations = await enforce(page)
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.locator('#calls [data-track-id]').nth(1).click()
  await expect
    .poll(() =>
      page.evaluate(
        () => (document.getElementById('player-audio') as HTMLAudioElement).src,
      ),
    )
    .toMatch(/\/audio\/.+\.mp3$/)
  await expect(page.locator('#calls [data-track-id]').nth(1)).toHaveAttribute(
    'aria-label',
    /^Pause /,
  )
  expect(violations).toEqual([])
})

test('external links opened in a new tab carry noopener noreferrer', async ({
  page,
}) => {
  for (const path of PAGES) {
    await page.goto(path)
    const rels = await page
      .locator('a[target="_blank"]')
      .evaluateAll((as) => as.map((a) => a.getAttribute('rel') ?? ''))
    for (const rel of rels) {
      expect(rel).toContain('noopener')
      expect(rel).toContain('noreferrer')
    }
  }
})
