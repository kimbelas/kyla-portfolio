import { describe, expect, test } from 'vitest'
import { buildLlmsTxt, buildRobotsTxt, llmsPages } from '../../src/lib/llms'

const site = new URL('https://example.com/')
const profile = {
  intro: 'An intro sentence.',
  email: 'hi@example.com',
  links: {
    linkedin: 'https://linkedin.example/kyla',
    upwork: 'https://upwork.example/kyla',
    onlinejobs: 'https://onlinejobs.example/kyla',
  },
}
const pages = [
  { title: 'Home', path: '/', summary: 'Start here.' },
  { title: 'Call recordings', path: '/calls/', summary: 'Real calls.' },
]

test('buildLlmsTxt header and sections', () => {
  const t = buildLlmsTxt({ site, profile, pages })
  expect(t.startsWith('# Kyla Belas\n\n> An intro sentence.\n\n')).toBe(true)
  expect(t).toContain('## Pages')
  expect(t).toContain(
    '- [Call recordings](https://example.com/calls/): Real calls.',
  )
  expect(t).toContain('## Profiles')
  expect(t).toContain('- [LinkedIn](https://linkedin.example/kyla)')
  expect(t).toContain('## Contact\n\n- Email: hi@example.com')
})

test('robots lists the sitemap', () => {
  const t = buildRobotsTxt(site)
  expect(t).toContain('Sitemap: https://example.com/sitemap-index.xml')
  expect(t).toContain('User-agent: GPTBot\nAllow: /')
})

describe('llmsPages', () => {
  const base = {
    title: 'Executive Virtual Assistant · Project Manager',
    recordingsIntro:
      'Real calls with homeowners and sellers. Press play on any recording.',
    counts: {
      all: 5,
      architecture: 1,
      construction: 1,
      marketing: 2,
      growth: 1,
    },
    recordings: [
      { title: 'Self introduction', featured: true },
      { title: 'Call A', featured: false },
      { title: 'Call B', featured: false },
    ],
  }
  const summary = (pages: { title: string; summary: string }[], t: string) =>
    pages.find((p) => p.title === t)!.summary

  test('counts calls apart from the featured self introduction', () => {
    expect(summary(llmsPages(base), 'Call recordings')).toBe(
      '2 call recordings plus a self introduction. Real calls with homeowners and sellers.',
    )
  })

  test('without a featured recording every entry counts as a call', () => {
    const pages = llmsPages({
      ...base,
      recordings: base.recordings.map((r) => ({ ...r, featured: false })),
    })
    expect(summary(pages, 'Call recordings')).toBe(
      '3 call recordings. Real calls with homeowners and sellers.',
    )
  })

  test('home summary has a single colon per line and portfolio names category pages', () => {
    const pages = llmsPages(base)
    const t = buildLlmsTxt({ site, profile, pages })
    for (const line of t.split('\n').filter((l) => l.startsWith('- ['))) {
      expect(line.split(': ').length, line).toBeLessThanOrEqual(2)
    }
    expect(summary(pages, 'Portfolio')).toBe(
      'All 5 pieces of work. Each category has its own page, listed below.',
    )
    expect(summary(pages, 'Marketing')).toBe('2 Marketing pieces.')
    expect(pages.map((p) => p.path)).toEqual([
      '/',
      '/work/',
      '/work/architecture/',
      '/work/construction/',
      '/work/marketing/',
      '/work/growth/',
      '/calls/',
    ])
  })
})
