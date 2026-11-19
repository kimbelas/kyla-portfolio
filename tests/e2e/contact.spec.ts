import { test, expect, type Page } from '@playwright/test'

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
}

async function mockFormspree(
  page: Page,
  status: number,
  delayMs = 0,
): Promise<{ posts: number }> {
  const counter = { posts: 0 }
  await page.route('https://formspree.io/**', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: CORS })
    }
    counter.posts += 1
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs))
    await route.fulfill({
      status,
      headers: CORS,
      contentType: 'application/json',
      body: JSON.stringify(status === 200 ? { ok: true } : { error: 'x' }),
    })
  })
  return counter
}

async function fill(page: Page) {
  const form = page.locator('#contact form')
  await form.locator('[name=name]').fill('Ann Lee')
  await form.locator('[name=email]').fill('ann@example.com')
  await form
    .locator('[name=message]')
    .fill('Hello Kyla, I would like to talk about a project.')
  return form
}

test('success message after Formspree 200', async ({ page }) => {
  await mockFormspree(page, 200)
  await page.goto('/')
  const form = await fill(page)
  await form.getByRole('button', { name: 'Send message' }).click()
  await expect(form.getByRole('status')).toHaveText(
    'Thank you! Your message is on its way. I’ll get back to you soon.',
  )
})

test('error message after Formspree 429', async ({ page }) => {
  await mockFormspree(page, 429)
  await page.goto('/')
  const form = await fill(page)
  await form.getByRole('button', { name: 'Send message' }).click()
  await expect(form.getByRole('status')).toHaveText(
    'The message couldn’t be sent. Please try again, or email kylabelasss@gmail.com directly.',
  )
})

test('double click sends one request', async ({ page }) => {
  const counter = await mockFormspree(page, 200, 400)
  await page.goto('/')
  const form = await fill(page)
  const send = form.getByRole('button', { name: 'Send message' })
  await send.dblclick()
  await expect(form.getByRole('status')).toContainText('Thank you!')
  expect(counter.posts).toBe(1)
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('form action and method are present and required fields are enforced', async ({
    page,
  }) => {
    await page.goto('/')
    const form = page.locator('#contact form')
    await expect(form).toHaveAttribute('method', 'post')
    await expect(form).toHaveAttribute(
      'action',
      'https://formspree.io/f/test123',
    )
    for (const n of ['name', 'email', 'message']) {
      await expect(form.locator(`[name=${n}]`)).toHaveAttribute('required', '')
    }
    const blocked = await form.evaluate((f) =>
      (f as HTMLFormElement).checkValidity(),
    )
    expect(blocked).toBe(false)
  })
})

test('email row copy button copies the address', async ({
  page,
  context,
  browserName,
}) => {
  if (browserName === 'chromium') {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  await page.goto('/')
  await page.getByRole('button', { name: 'Copy email address' }).click()
  await expect(page.locator('#contact [data-copy-status]')).toHaveText('Copied')
  if (browserName === 'chromium') {
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'kylabelasss@gmail.com',
    )
  }
})
