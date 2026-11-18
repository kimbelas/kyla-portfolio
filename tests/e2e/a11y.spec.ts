import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { PAGES } from './pages'

for (const path of PAGES) {
  test(`axe clean: ${path}`, async ({ page }) => {
    await page.goto(path)
    const r = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(r.violations).toEqual([])
  })
}
