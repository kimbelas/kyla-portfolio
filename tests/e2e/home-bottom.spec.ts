import { test, expect } from '@playwright/test'

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

test('experience lists 6 roles, newest first, starting with Sharks Capital | 2A Construction LLC', async ({
  page,
}) => {
  await page.goto('/')
  const roles = page.locator('#experience [data-role]')
  await expect(roles).toHaveCount(6)
  await expect(roles.first()).toContainText(
    'Sharks Capital | 2A Construction LLC',
  )
  await expect(page.locator('#experience [data-client]')).toHaveCount(7)
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
  await expect(page.locator('#words')).toContainText('4.6')
  await expect(page.locator('#words')).toContainText('Jun 29 - Jul 9, 2023')
})

test('three review cards: Mayra J., Agency lead, Josie A.', async ({
  page,
}) => {
  await page.goto('/')
  const cards = page.locator('#words [data-review-card]')
  await expect(cards).toHaveCount(3)
  const text = (await cards.allTextContents()).join('|')
  for (const n of ['Mayra J.', 'Agency lead', 'Josie A.']) {
    expect(text).toContain(n)
  }
})

test('screenshot archive opens with 13 images', async ({ page }) => {
  await page.goto('/')
  await page
    .getByRole('link', { name: /See all 13 original screenshots/ })
    .click()
  const dialog = page.locator('dialog[data-lightbox-dialog]')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('[data-lightbox-count]')).toHaveText('1 / 13')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('unapproved FAQ questions are absent from the HTML and no FAQPage JSON-LD is emitted', async ({
  page,
}) => {
  await page.goto('/')
  const html = await page.content()
  expect(html).not.toContain('What does Kyla do?')
  expect(html).not.toContain('Which tools does Kyla use?')
  expect(html).not.toContain('FAQPage')
  await expect(page.locator('#faq')).toHaveCount(0)
})
