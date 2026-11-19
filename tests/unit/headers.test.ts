import { createHash } from 'node:crypto'
import { expect, test } from 'vitest'
import {
  collectInlineHashes,
  findInlineStyles,
  renderHeaders,
} from '../../scripts/build-headers.mjs'

const hash = (s: string) =>
  `'sha256-${createHash('sha256').update(s, 'utf8').digest('base64')}'`

test('hashes inline scripts and skips data blocks', () => {
  const h = collectInlineHashes(
    '<script>a()</script><script type="application/ld+json">{}</script><script type="application/json" id="t">[]</script><script src="/x.js"></script>',
  )
  expect(h).toEqual([hash('a()')])
})

test('hashes module and text/javascript scripts, sorted and de-duplicated', () => {
  const h = collectInlineHashes(
    '<script type="module">b()</script><script type="text/javascript">a()</script><script>a()</script>',
  )
  expect(h).toEqual([hash('a()'), hash('b()')].sort())
})

test('hashes the exact UTF-8 text', () => {
  const h = collectInlineHashes('<script type="module">x("é")</script>')
  expect(h).toEqual([hash('x("é")')])
})

test('finds style attributes and style elements', () => {
  expect(findInlineStyles('<p class="a">x</p><script>s()</script>')).toEqual([])
  expect(findInlineStyles('<p style="color:red">x</p>')).toHaveLength(1)
  expect(findInlineStyles('<style>p{}</style>')).toHaveLength(1)
  expect(
    findInlineStyles('<p style="a:b"></p><style media="x">p{}</style>'),
  ).toHaveLength(2)
})

test('renderHeaders matches the exact template', () => {
  const out = renderHeaders(["'sha256-AAA='", "'sha256-BBB='"])
  expect(out).toBe(`/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'sha256-AAA=' 'sha256-BBB='; style-src 'self'; img-src 'self' data:; font-src 'self'; media-src 'self'; connect-src 'self' https://formspree.io; form-action 'self' https://formspree.io mailto:; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests
  Strict-Transport-Security: max-age=63072000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin
  X-Frame-Options: DENY
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
/audio/*
  Cache-Control: public, max-age=604800
`)
})
