import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi
const EXECUTABLE_TYPES = new Set(['', 'module', 'text/javascript'])

function attr(attrs, name) {
  const m = new RegExp(
    `(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    'i',
  ).exec(attrs)
  return m ? (m[1] ?? m[2] ?? m[3]).trim().toLowerCase() : null
}

/** sha256 CSP source of every inline executable script, sorted and de-duplicated. */
export function collectInlineHashes(html) {
  const hashes = new Set()
  for (const [, attrs, body] of html.matchAll(SCRIPT_RE)) {
    if (attr(attrs, 'src') !== null) continue
    if (!EXECUTABLE_TYPES.has(attr(attrs, 'type') ?? '')) continue
    const digest = createHash('sha256').update(body, 'utf8').digest('base64')
    hashes.add(`'sha256-${digest}'`)
  }
  return [...hashes].sort()
}

/** Every style attribute or style element (the CSP forbids both). */
export function findInlineStyles(html) {
  const markup = html.replace(SCRIPT_RE, '<script></script>')
  return [
    ...(markup.match(/<style[\s>]/gi) ?? []),
    ...(markup.match(/<[a-z][^>]*?\sstyle\s*=/gi) ?? []),
  ]
}

export function renderHeaders(scriptHashes) {
  const csp = [
    "default-src 'self'",
    ['script-src', "'self'", ...scriptHashes].join(' '),
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "media-src 'self'",
    "connect-src 'self' https://formspree.io",
    "form-action 'self' https://formspree.io mailto:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ')
  return `/*
  Content-Security-Policy: ${csp}
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
`
}

function walkHtml(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkHtml(path))
    else if (entry.name.endsWith('.html')) out.push(path)
  }
  return out
}

function main(dist = 'dist') {
  const hashes = new Set()
  const offenders = []
  for (const file of walkHtml(dist)) {
    const html = readFileSync(file, 'utf8')
    if (findInlineStyles(html).length) offenders.push(file)
    for (const h of collectInlineHashes(html)) hashes.add(h)
  }
  if (offenders.length) {
    console.error(
      `Inline styles are forbidden by the CSP. Found in:\n${offenders.map((f) => `  ${f}`).join('\n')}`,
    )
    process.exit(1)
  }
  writeFileSync(join(dist, '_headers'), renderHeaders([...hashes].sort()))
  console.log(`dist/_headers written with ${hashes.size} script hashes`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
