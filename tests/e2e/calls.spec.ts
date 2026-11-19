import { test, expect, type Page } from '@playwright/test'
import { recordings } from './content'

const featured = recordings.filter((r) => r.featured)
const rest = recordings.length - featured.length
const coldCalling = recordings.filter((r) => r.group === 'Cold calling').length

const audioSrc = (page: Page) =>
  page.evaluate(
    () => (document.getElementById('player-audio') as HTMLAudioElement).src,
  )

const track = (page: Page, id: string) =>
  page.locator(`[data-track-id="${id}"]`)

test('no audio is requested before the first play', async ({ page }) => {
  const audioRequests: string[] = []
  page.on('request', (r) => {
    if (/\/audio\//.test(r.url())) audioRequests.push(r.url())
  })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  expect(audioRequests).toEqual([])
})

test('home lists every non-featured track plus the featured self introduction tagged Recorded early 2025', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('#calls [data-track-id]')).toHaveCount(rest)
  const card = page.locator('#calls [data-now-playing]')
  await expect(card).toHaveAttribute('aria-live', 'polite')
  await expect(card.locator('[data-np-title]')).toHaveText('Self introduction')
  await expect(card.locator('[data-np-note]')).toHaveText('Recorded early 2025')
})

test('only one track plays at a time', async ({ page }) => {
  await page.goto('/')
  await track(page, '2a-customer-call').click()
  await expect(track(page, '2a-customer-call')).toHaveAttribute(
    'aria-label',
    /^Pause /,
  )
  await track(page, '2a-client-call').click()
  await expect(track(page, '2a-client-call')).toHaveAttribute(
    'aria-label',
    /^Pause /,
  )
  expect(await audioSrc(page)).toMatch(/2a-client-call\.mp3$/)
  await expect(track(page, '2a-customer-call')).toHaveAttribute(
    'aria-label',
    /^Play /,
  )
  await expect(page.locator('[data-np-title]')).toHaveText(
    '2A Construction · Client call',
  )
})

test('filter Cold calling shows only the Cold calling tracks', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Cold calling', exact: true }).click()
  await expect(page.locator('#calls li[data-group]:not([hidden])')).toHaveCount(
    coldCalling,
  )
  await expect(
    page.getByRole('button', { name: 'Cold calling', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: new RegExp(`^All ${rest}`) }).click()
  await expect(page.locator('#calls li[data-group]:not([hidden])')).toHaveCount(
    rest,
  )
})

test('nav play control plays self-introduction.mp3 and shows pause', async ({
  page,
}) => {
  await page.goto('/')
  const chip = page.locator('header [data-play-featured]').first()
  await chip.click()
  await expect(chip).toHaveAttribute('aria-label', /pause self introduction/)
  expect(await audioSrc(page)).toMatch(/self-introduction\.mp3$/)
  await chip.click()
  await expect(chip).toHaveAttribute('aria-label', /play self introduction/)
})

test('nav play control mirrors any playing track and pauses it', async ({
  page,
}) => {
  await page.goto('/')
  const chip = page.locator('header [data-play-featured]').first()
  await expect(chip.locator('[data-icon="play"]')).toBeVisible()
  await track(page, '2a-customer-call').click()
  await expect(chip.locator('[data-icon="pause"]')).toBeVisible()
  await expect(chip.locator('[data-icon="play"]')).toBeHidden()
  await expect(chip).toHaveAttribute(
    'aria-label',
    /^Hear me · \d+:\d{2}, pause 2A Construction · Customer call$/,
  )
  await chip.click()
  await expect(track(page, '2a-customer-call')).toHaveAttribute(
    'aria-label',
    /^Play /,
  )
  expect(await audioSrc(page)).toMatch(/2a-customer-call\.mp3$/)
  await expect(chip.locator('[data-icon="play"]')).toBeVisible()
  await expect(chip).toHaveAttribute('aria-label', /play self introduction$/)
  await chip.click()
  expect(await audioSrc(page)).toMatch(/self-introduction\.mp3$/)
  await expect(chip).toHaveAttribute('aria-label', /pause self introduction$/)
})

test('Start here play button shows the pause icon while the intro plays', async ({
  page,
}) => {
  await page.goto('/')
  const button = page.locator(
    'main section[aria-label="Highlights"] [data-play-featured]',
  )
  await expect(button.locator('[data-icon="play"]')).toBeVisible()
  await expect(button.locator('[data-icon="pause"]')).toBeHidden()
  await button.click()
  expect(await audioSrc(page)).toMatch(/self-introduction\.mp3$/)
  await expect(button).toHaveAttribute('aria-label', /^Pause /)
  await expect(button.locator('[data-icon="pause"]')).toBeVisible()
  await expect(button.locator('[data-icon="play"]')).toBeHidden()
})

test('menu play control starts the intro and closes the menu', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.locator('[data-menu-toggle]').click()
  await page.locator('[data-menu-card] [data-play-featured]').click()
  await expect(page.locator('details[data-menu]')).not.toHaveAttribute('open')
  expect(await audioSrc(page)).toMatch(/self-introduction\.mp3$/)
  await expect(page.locator('[data-menu-toggle]')).toBeFocused()
})

test('failed audio shows an error and resets the button', async ({
  page,
  browserName,
}) => {
  await page.route('**/audio/seller-script.mp3', (route) =>
    route.fulfill({ status: 404, body: 'missing' }),
  )
  await page.goto('/')
  await track(page, 'seller-script').click()
  if (browserName === 'webkit') {
    // Playwright's WebKit does not route media element requests, so the 404
    // never reaches the page. Raise the element's error event instead.
    await page.evaluate(() =>
      document
        .getElementById('player-audio')!
        .dispatchEvent(new Event('error')),
    )
  }
  await expect(
    page.getByText('Couldn’t load this call. Try again.'),
  ).toBeVisible()
  await expect(track(page, 'seller-script')).toHaveAttribute(
    'aria-label',
    /^Play /,
  )
})

test('/calls lists every recording and emits one AudioObject each', async ({
  page,
}) => {
  await page.goto('/calls/')
  await expect(page).toHaveTitle('Call recordings · Kyla Belas')
  await expect(page.locator('article')).toHaveCount(recordings.length)
  await expect(page.locator('article h2').first()).toHaveText(
    'Self introduction',
  )
  const types = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((nodes) =>
      nodes.map((n) => JSON.parse(n.textContent ?? '{}')['@type']),
    )
  expect(types.filter((t) => t === 'AudioObject')).toHaveLength(
    recordings.length,
  )
  expect(types).toContain('BreadcrumbList')
})

test('/calls has a play button and an MP3 link for every recording', async ({
  page,
}) => {
  await page.goto('/calls/')
  for (const r of recordings) {
    const article = page.locator('article', {
      has: page.getByRole('heading', { name: r.title, exact: true }),
    })
    await expect(
      article.locator(`button[data-track-id="${r.id}"]`),
    ).toHaveAttribute('aria-label', `Play ${r.title}`)
    await expect(article.locator(`a[href="/audio/${r.file}"]`)).toBeVisible()
  }
  const last = recordings[recordings.length - 1]!
  const button = page.locator(`button[data-track-id="${last.id}"]`)
  await button.click()
  await expect(button).toHaveAttribute('aria-label', `Pause ${last.title}`)
  expect(await audioSrc(page)).toMatch(new RegExp(`/audio/${last.file}$`))
  await button.click()
  await expect(button).toHaveAttribute('aria-label', `Play ${last.title}`)
})

test('home links to the /calls page', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.locator('#calls').getByRole('link', { name: 'All call recordings' }),
  ).toHaveAttribute('href', '/calls/')
})

test.describe('/calls without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('every recording is reachable as an MP3 link', async ({ page }) => {
    await page.goto('/calls/')
    await expect(page.locator('article a[href^="/audio/"]')).toHaveCount(
      recordings.length,
    )
  })
})

test('More recordings on Drive link points to the recordings folder', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('link', { name: /More recordings on Drive/ }),
  ).toHaveAttribute(
    'href',
    'https://drive.google.com/drive/folders/1P1dFI5vCiM5kfRlWG6_Zy8m7kxywGWHp',
  )
})
