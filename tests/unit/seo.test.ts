import { expect, test } from 'vitest'
import { buildMeta } from '../../src/lib/seo'

const site = new URL('https://example.com')

test('home title and canonical', () => {
  const m = buildMeta({ description: 'x'.repeat(80), path: '/', site })
  expect(m.title).toBe(
    'Kyla Belas · Executive Virtual Assistant and Project Manager',
  )
  expect(m.canonical).toBe('https://example.com/')
  expect(m.image.url).toBe('https://example.com/og/default.png')
  expect(m.image.alt).toBe(
    'Kyla Belas, executive virtual assistant and project manager',
  )
  expect(m.noindex).toBe(false)
})

test('subpage title', () => {
  expect(
    buildMeta({
      title: 'Portfolio',
      description: 'x'.repeat(80),
      path: '/work/',
      site,
    }).title,
  ).toBe('Portfolio · Kyla Belas')
})

test('rejects descriptions outside 50..160 chars', () => {
  expect(() => buildMeta({ description: 'short', path: '/', site })).toThrow()
  expect(() =>
    buildMeta({ description: 'x'.repeat(161), path: '/', site }),
  ).toThrow()
})

test('noindex passes through', () => {
  expect(
    buildMeta({
      description: 'x'.repeat(80),
      path: '/404.html',
      site,
      noindex: true,
    }).noindex,
  ).toBe(true)
})
