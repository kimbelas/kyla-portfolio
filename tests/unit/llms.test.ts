import { expect, test } from 'vitest'
import { buildLlmsTxt, buildRobotsTxt } from '../../src/lib/llms'

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
