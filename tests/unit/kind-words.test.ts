import { afterEach, describe, expect, test, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import KindWords from '../../src/components/home/KindWords.astro'

const flags = vi.hoisted(() => ({ dropFeature: false }))

// Same collections, optionally without the home feature review.
vi.mock('astro:content', async (importOriginal) => {
  const real = await importOriginal<typeof import('astro:content')>()
  return {
    ...real,
    getCollection: async (name: string) => {
      const entries = (await real.getCollection(
        name as 'reviews',
      )) as unknown as { data: { home?: string } }[]
      if (name !== 'reviews' || !flags.dropFeature) return entries
      return entries.map((e) =>
        e.data.home === 'feature'
          ? { ...e, data: { ...e.data, home: undefined } }
          : e,
      )
    },
  }
})

const render = async () =>
  (await AstroContainer.create()).renderToString(KindWords)
const text = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

afterEach(() => {
  flags.dropFeature = false
})

describe('KindWords', () => {
  test('shows the Upwork rating as "out of 5" text with no stars', async () => {
    const html = await render()
    expect(text(html)).toMatch(/\b4\.6 out of 5\b/)
    expect(html.match(/<svg/g) ?? []).toHaveLength(0)
  })

  test('archive links carry a descriptive lightbox title', async () => {
    const html = await render()
    const titles = [...html.matchAll(/data-lightbox-title="([^"]*)"/g)].map(
      (m) => m[1],
    )
    expect(titles.length).toBeGreaterThan(0)
    for (const t of titles) expect(t).toMatch(/^Review screenshot: \S/)
  })

  test('keeps the words-title heading when no review is the home feature', async () => {
    flags.dropFeature = true
    const html = await render()
    expect(html).not.toContain('data-feature')
    expect(html).toContain('aria-labelledby="words-title"')
    expect(html).toMatch(/<h2[^>]*id="words-title"/)
  })

  test('renders the heading once with the feature', async () => {
    const html = await render()
    expect(html).toContain('data-feature')
    expect(html.match(/id="words-title"/g)).toHaveLength(1)
  })
})
