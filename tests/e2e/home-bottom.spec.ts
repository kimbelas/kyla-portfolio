import { test, expect } from '@playwright/test'
import { clients, experience, faq, reviews } from './content'

const shots = reviews.length
const seeAll = new RegExp(`See all ${shots} original screenshots`)

test('growth cards show $253.81K, 10.29%, $636.01K with their July 2025 values', async ({
  page,
}) => {
  await page.goto('/')
  const exp = page.locator('#experience')
  for (const v of ['$253.81K', '10.29%', '$636.01K']) {
    await expect(exp).toContainText(v)
  }
  for (const v of ['$28.91K', '4.81%', '$532.91K']) {
    await expect(exp).toContainText(`from ${v} in July 2025`)
  }
})

test('experience lists every role, newest first, starting with Sharks Capital | 2A Construction LLC', async ({
  page,
}) => {
  await page.goto('/')
  const roles = page.locator('#experience [data-role]')
  await expect(roles).toHaveCount(experience.length)
  await expect(roles.first()).toContainText(
    'Sharks Capital | 2A Construction LLC',
  )
  await expect(page.locator('#experience [data-client]')).toHaveCount(
    clients.length,
  )
})

test('feature quote is Tracy Scuteri, verbatim', async ({ page }) => {
  await page.goto('/')
  const quote = page.locator('#words [data-feature] blockquote')
  await expect(quote).toHaveText(
    '\u201cI had the exterior of my home painted to include the trim, gutters and door stained. The job was done efficiently and professionally. I made a couple changes mid-way and they adapted nicely. Art and Kyla are a pleasure to work with.\u201d',
  )
  await expect(page.locator('#words [data-feature]')).toContainText(
    'Tracy Scuteri',
  )
  await expect(page.locator('#words')).toContainText('4.6 out of 5')
  await expect(page.locator('#words')).toContainText('Jun 29 - Jul 9, 2023')
})

test('three review cards: Mayra J., Agency lead, Josie A.', async ({
  page,
}) => {
  await page.goto('/')
  const cards = page.locator('#words [data-review-card]')
  await expect(cards).toHaveCount(3)
  const texts = await cards.allTextContents()
  const names = ['Mayra J.', 'Agency lead', 'Josie A.']
  names.forEach((n, i) => expect(texts[i]).toContain(n))
})

test('screenshot archive opens with every screenshot', async ({ page }) => {
  await page.goto('/')
  await page.getByText(seeAll).click()
  await page.locator('#words [data-archive] a').first().click()
  const dialog = page.locator('dialog[data-lightbox-dialog]')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('[data-lightbox-count]')).toHaveText(
    `1 / ${shots}`,
  )
  await expect(dialog.locator('img')).toHaveAttribute(
    'alt',
    /^Review screenshot: \S/,
  )
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('FAQ section and FAQPage JSON-LD appear only for approved entries', async ({
  page,
}) => {
  await page.goto('/')
  const html = await page.content()
  for (const f of faq.filter((e) => !e.approved)) {
    expect(html).not.toContain(f.question)
  }
  const approved = faq.filter((e) => e.approved)
  for (const f of approved) {
    await expect(page.locator('#faq')).toContainText(f.question)
  }
  await expect(page.locator('#faq')).toHaveCount(approved.length > 0 ? 1 : 0)
  expect(html.includes('"FAQPage"')).toBe(approved.length > 0)
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('all screenshot links are reachable', async ({ page }) => {
    await page.goto('/')
    await page.getByText(seeAll).click()
    const links = page.locator('#words [data-archive] a')
    await expect(links).toHaveCount(shots)
    for (const l of await links.all()) await expect(l).toBeVisible()
  })
})
