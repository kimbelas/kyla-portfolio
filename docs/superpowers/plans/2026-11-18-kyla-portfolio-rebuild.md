# Kyla Belas Portfolio Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Kyla Belas's portfolio as a static, crawlable, secure Astro site in design D with navbar option 1.

**Architecture:** Astro static output renders every page to plain HTML from YAML content collections validated by Zod. Four small vanilla TypeScript modules add the interactive behavior (menu, audio player, lightbox, contact form) on top of markup that already works without JavaScript. A post-build script hashes inline scripts into a strict CSP and writes `dist/_headers`.

**Tech Stack:** Node 22 LTS, Astro (latest stable major at install, version pinned by the lockfile), TypeScript strict, Tailwind CSS v4 (`@tailwindcss/vite`), `@astrojs/sitemap`, Fontsource fonts, Vitest + jsdom, Playwright + `@axe-core/playwright`, Lighthouse CI, Formspree.

**Spec:** `docs/superpowers/specs/2026-11-18-kyla-portfolio-rebuild-design.md` (read it first; tokens, navbar breakpoints, page list and content rules live there).

## Global Constraints

- Output is static (`output: 'static'`, `trailingSlash: 'always'`, `build.format: 'directory'`, `build.inlineStylesheets: 'never'`).
- No UI framework runtime ships to the browser. No `framer-motion`, no React.
- No third-party network requests except `https://formspree.io` (form submit). Fonts are self-hosted.
- No `style="..."` attributes and no inline `<style>` in built HTML (CSP has no `unsafe-inline`). Dynamic widths use `<progress>`, `<meter>`, `<input type="range">` or SVG attributes.
- Design tokens, fonts and breakpoints exactly as in the spec tables.
- Site copy, docs, comments and commit messages never contain an en dash (U+2013) or em dash (U+2014); ranges use a hyphen.
- Testimonial quotes are verbatim; any shortened version is a contiguous substring of the full quote.
- No invented facts. FAQ entries render only with `approved: true`.
- Never add the Contenu recording or the two excluded review screenshots.
- Accessibility: WCAG 2.2 AA, zero axe violations, targets at least 44 px, `prefers-reduced-motion` honored.
- Budgets: Lighthouse mobile performance at least 0.9, accessibility at least 0.95, best practices at least 0.95, SEO 1.0; home page JavaScript at most 30 KB transferred.
- Commits: one line, imperative mood, at most 72 characters, no body, no trailers, no AI attribution.
- `SITE_URL` is required for `astro build`; production value `https://kyla-belas.pages.dev/`. `PUBLIC_FORMSPREE_ID` is optional.
- Host is Cloudflare Pages; `dist/_headers` uses the Cloudflare Pages `_headers` format.
- Icons and logo are hand-written inline SVG (no icon library): stroke icons 24x24 viewBox, `stroke="currentColor"`, `aria-hidden="true"` when decorative.

## Review Focus

1. A visitor taps track A, then track B before A has loaded: only B plays, and A's late `playing` event must not flip the UI back to A. Test in Task 7 (`ignores events from a superseded track`).
2. The phone menu is open and the viewport grows past 1100 px (rotation, window resize): the menu closes and page scroll unlocks. Test in Task 5 (`closes when viewport becomes desktop`).
3. A 320 px wide screen with the longest titles (for example "Phase 2 · Owner connection script"): no horizontal scroll on any page. Test in Task 4 (`no horizontal overflow at 320px`), with each later task adding its pages to the shared list.
4. JavaScript disabled or a script fails to load: every section is readable, category links work, portfolio items open the image, the contact form still submits. Tests in Task 8 (`works without JavaScript`) and Task 10 (`submits without JavaScript`).
5. Content that contains `</script>`, quotes or U+2028 reaches JSON-LD: the page markup stays intact. Test in Task 3 (`serializeJsonLd escapes markup-breaking characters`).

---

### Task 1: Scaffold Astro, tooling and git

**Files:**
- Move: `src/`, `index.html`, `vite.config.js`, `README.md` to `legacy/` (reference only, deleted in Task 13); delete `dist/`
- Create: `package.json` (replaces the old one), `astro.config.mjs`, `tsconfig.json`, `.nvmrc`, `.gitignore`, `.prettierrc`, `eslint.config.js`, `vitest.config.ts`, `playwright.config.ts`, `src/pages/index.astro`, `tests/unit/smoke.test.ts`, `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Produces: npm scripts `dev`, `build` (`astro build && node scripts/build-headers.mjs`, the script is added in Task 12, so until then `astro build`), `preview`, `test` (`vitest run`), `test:e2e` (`playwright test`), `lint` (`eslint . && prettier --check .`), `check` (`astro check`), `og` (Task 11).
- Produces: Playwright projects `desktop` (Chromium 1440x900), `mobile` (Chromium 390x844, `isMobile: true`), `mobile-webkit` (WebKit 390x844); `webServer` runs `npm run build && npm run preview` with `SITE_URL=http://localhost:4321`.
- Produces: `vitest.config.ts` built with `getViteConfig` from `astro/config` (so `astro/container` and `astro:content` work in unit tests), environment `node`, jsdom per file via `// @vitest-environment jsdom`.

- [ ] **Step 1:** `git init`, set `.gitignore` to `node_modules/`, `dist/`, `.astro/`, `.env*`, `*.zip`, `test-results/`, `playwright-report/`, `.lighthouseci/`. `.nvmrc` = `22`.
- [ ] **Step 2: Write the failing tests**

```ts
// tests/unit/smoke.test.ts
test('vitest runs', () => expect(1 + 1).toBe(2))
// tests/e2e/smoke.spec.ts
test('home responds with html lang en', async ({ page }) => {
  const res = await page.goto('/')
  expect(res?.status()).toBe(200)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})
```

- [ ] **Step 3:** Run `npm test` and `npx playwright test tests/e2e/smoke.spec.ts`. Expected: FAIL (no Astro project yet).
- [ ] **Step 4:** Install Astro, `@astrojs/sitemap`, `@astrojs/check`, `typescript`, `tailwindcss`, `@tailwindcss/vite`, `vitest`, `jsdom`, `@playwright/test`, `@axe-core/playwright`, `eslint`, `eslint-plugin-astro`, `typescript-eslint`, `prettier`, `prettier-plugin-astro`, `yaml`. `tsconfig.json` extends `astro/tsconfigs/strict`. In `astro.config.mjs` read `process.env.SITE_URL`; when `process.argv` includes `build` and it is unset, throw `new Error('SITE_URL is required for builds')`. Register sitemap integration and the Tailwind Vite plugin. Minimal `src/pages/index.astro` with `<html lang="en">`.
- [ ] **Step 5:** Run `npm test`, `npx playwright test tests/e2e/smoke.spec.ts`, and `npx astro build` without `SITE_URL`. Expected: both tests PASS; the bare build exits non-zero with `SITE_URL is required for builds`.
- [ ] **Step 6: Commit** `git add -A && git commit -m "Scaffold Astro site with test and lint tooling"`

---

### Task 2: Content collections, schemas and migrated content

**Files:**
- Create: `src/content/schemas.ts`, `src/content.config.ts`, `src/content/{profile,metrics,expertise,experience,clients,recordings,portfolio,reviews,faq}.yaml`, `src/lib/collections.ts`, `tests/unit/content-integrity.test.ts`, `tests/unit/collections.test.ts`
- Move: `public/images/**` to `src/assets/images/**` (same subfolders). `public/audio/` stays.

**Interfaces:**
- Produces schema factories (take Astro's `image` helper so tests can pass `() => z.string()`): `profileSchema`, `metricSchema`, `expertiseSchema`, `experienceSchema`, `clientSchema`, `recordingSchema`, `portfolioSchema(image)`, `reviewSchema(image)`, `faqSchema`.
- Field contracts:
  - recording: `id`, `title`, `group` in `['Introduction','Construction','Appointment setting','Cold calling','Real estate']`, `file` matching `/^[a-z0-9-]+\.mp3$/`, `durationSec` positive int, `featured` (default false), `note?`, `summary?`, `transcript?`
  - portfolio: `id`, `title`, `category` in `['marketing','construction','growth','architecture']`, `tag`, `image`, `alt` (min 10 chars), `homeOrder?` (int 1 to 9)
  - review: `id`, `title`, `image`, `source` in `['google','customer','client','upwork']`, `quote?`, `excerpt?`, `name?`, `context?`, `stars?` (1 to 5), `home` in `['feature','card']` optional. Refinements: `home` requires `quote`, `name`, `context`; `excerpt` must be a substring of `quote`.
  - faq: `id`, `question` (ends with `?`), `answer`, `approved` boolean.
  - profile (single entry `kyla`): name, firstName, title, location `{ locality: 'Pampanga', region: 'Pampanga', country: 'PH' }`, email, headline `{ lead: 'I keep projects, people & pipelines', emphasis: 'moving.' }`, rotating (6 strings), intro, education `{ degree, school, years: '2020 - 2025' }`, about (paragraphs), pullQuote `'Challenges are what keep me going.'`, journey, stats (4 items: `6+`, `10.29%`, `5-12`, `20%` with labels from the D board), niches, skills, tools (groups), links (all `z.string().url()`), upwork `{ job: 'Appointment Setter', rating: 4.6, period: 'Jun 29 - Jul 9, 2023' }`.
- Produces in `src/lib/collections.ts`: `categoryCounts(items: { category: Category }[]): Record<Category | 'all', number>`, `orderRecordings<T extends { featured: boolean }>(items: T[]): T[]`, `formatDuration(sec: number): string`, `isoDuration(sec: number): string`, `homePortfolio<T extends { homeOrder?: number }>(items: T[]): T[]`, type `Category`, constant `CATEGORY_LABELS: Record<Category, string>` = `{ architecture: 'Architecture', construction: '2A Construction', marketing: 'Marketing', growth: 'Business records' }`.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/unit/collections.test.ts
test('formatDuration', () => {
  expect(formatDuration(102)).toBe('1:42'); expect(formatDuration(63)).toBe('1:03'); expect(formatDuration(631)).toBe('10:31')
})
test('isoDuration', () => { expect(isoDuration(102)).toBe('PT1M42S'); expect(isoDuration(60)).toBe('PT1M0S') })
test('orderRecordings puts featured first, keeps file order otherwise', ...)
test('homePortfolio returns items with homeOrder sorted ascending, max 9', ...)

// tests/unit/content-integrity.test.ts (parses the YAML with `yaml`, validates with the schemas)
test('portfolio has 38 pieces split 20/7/2/9', () =>
  expect(categoryCounts(portfolio)).toEqual({ all: 38, marketing: 20, construction: 7, growth: 2, architecture: 9 }))
test('exactly one featured recording: self-introduction, note Recorded early 2025', ...)
test('12 recordings, none with id or title matching /contenu/i', ...)
test('every recording file exists in public/audio', ...)
test('every portfolio and review image exists under src/assets/images', ...)
test('13 reviews; home has 1 feature (Tracy Scuteri) and 3 cards (Mayra J., Agency lead, Josie A.)', ...)
test('ids are unique within each collection', ...)
test('no en or em dash anywhere in src/content', () =>
  expect(allYamlText).not.toMatch(/[\u2013\u2014]/))
test('quotes are verbatim', () => {
  expect(quoteOf('sanjeshni')).toContain('A special thank you to Kayla, who was our main point of contact')
  expect(quoteOf('tracy')).toBe('I had the exterior of my home painted to include the trim, gutters and door stained. The job was done efficiently and professionally. I made a couple changes mid-way and they adapted nicely. Art and Kyla are a pleasure to work with.')
})
test('nine portfolio items have homeOrder 1..9 with no gaps', ...)
```

- [ ] **Step 2:** Run `npx vitest run tests/unit`. Expected: FAIL (modules and YAML missing).
- [ ] **Step 3:** Write the schemas, helpers and `content.config.ts` (one `file()` loader per YAML). Migrate every value from `legacy/src/data/content.js` into the YAML files, replacing en dashes with hyphens and converting each `period` and range. Copy quotes character for character. `homeOrder` follows the D board order: primary-bedroom, kitchen-remodel-promo, remodel-perspective, beauty-before-after, kitchen-01, seattle-plan, home-addition, first-year-record, living. Write `alt` text describing each image. Draft 5 FAQ entries from existing facts only (what Kyla does, industries, tools, location, how to hire), all `approved: false`.
- [ ] **Step 4:** Run `npx vitest run tests/unit` and `SITE_URL=http://localhost:4321 npx astro build`. Expected: PASS; build succeeds (Astro validates `image()` paths).
- [ ] **Step 5: Commit** `git add -A && git commit -m "Move site content into validated YAML collections"`

---

### Task 3: SEO metadata and JSON-LD builders

**Files:**
- Create: `src/lib/seo.ts`, `src/lib/jsonld.ts`, `src/components/seo/Seo.astro`, `src/components/seo/JsonLd.astro`, `tests/unit/seo.test.ts`, `tests/unit/jsonld.test.ts`

**Interfaces:**
- Consumes: profile, recording, portfolio and faq types from Task 2.
- Produces:
  - `type Meta = { title: string; description: string; canonical: string; image: { url: string; width: 1200; height: 630; alt: string }; type: 'website' | 'profile'; noindex: boolean }`
  - `buildMeta(input: { title?: string; description: string; path: string; site: URL; noindex?: boolean }): Meta`; default image `/og/default.png`, alt `Kyla Belas, executive virtual assistant and project manager`.
  - `personSchema(profile, site: URL, imageUrl: string)`, `websiteSchema(site: URL)`, `profilePageSchema(site: URL)`, `audioObjectSchema(rec, site: URL)`, `itemListSchema(items: { name: string; imageUrl: string }[], site: URL, path: string)`, `breadcrumbSchema(trail: { name: string; path: string }[], site: URL)`, `faqPageSchema(faqs: { question: string; answer: string }[])`, `serializeJsonLd(data: unknown): string`. Person `@id` is `${site}#kyla`; other schemas reference it.
  - `<Seo meta={Meta} />` renders title, description, canonical, `og:*`, `twitter:card=summary_large_image`, robots `noindex` when set. `<JsonLd data={object} />` renders `<script type="application/ld+json">`.

- [ ] **Step 1: Write the failing tests**

```ts
const site = new URL('https://example.com')
test('home title and canonical', () => {
  const m = buildMeta({ description: 'x'.repeat(80), path: '/', site })
  expect(m.title).toBe('Kyla Belas · Executive Virtual Assistant and Project Manager')
  expect(m.canonical).toBe('https://example.com/')
  expect(m.image.url).toBe('https://example.com/og/default.png')
})
test('subpage title', () => expect(buildMeta({ title: 'Portfolio', description: 'x'.repeat(80), path: '/work/', site }).title).toBe('Portfolio · Kyla Belas'))
test('rejects descriptions outside 50..160 chars', () => { expect(() => buildMeta({ description: 'short', path: '/', site })).toThrow(); expect(() => buildMeta({ description: 'x'.repeat(161), path: '/', site })).toThrow() })
test('person schema', () => {
  const p = personSchema(profile, site, 'https://example.com/kyla.jpg')
  expect(p).toMatchObject({ '@type': 'Person', '@id': 'https://example.com/#kyla', name: 'Kyla Belas',
    address: { '@type': 'PostalAddress', addressLocality: 'Pampanga', addressCountry: 'PH' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Holy Angel University' },
    sameAs: [profile.links.linkedin, profile.links.upwork, profile.links.onlinejobs] })
})
test('audio object', () => expect(audioObjectSchema({ id: 'self-introduction', title: 'Self introduction', file: 'self-introduction.mp3', durationSec: 102 }, site))
  .toMatchObject({ '@type': 'AudioObject', contentUrl: 'https://example.com/audio/self-introduction.mp3', duration: 'PT1M42S', encodingFormat: 'audio/mpeg', creator: { '@id': 'https://example.com/#kyla' } }))
test('serializeJsonLd escapes markup-breaking characters', () => {
  const out = serializeJsonLd({ q: '</script><b>"&\u2028' })
  expect(out).not.toContain('</script>'); expect(out).toContain('\\u003c/script\\u003e'); expect(out).toContain('\\u0026'); expect(out).toContain('\\u2028')
  expect(JSON.parse(out)).toEqual({ q: '</script><b>"&\u2028' })
})
test('faqPageSchema maps question and answer', ...)
test('breadcrumbSchema positions start at 1 with absolute URLs', ...)
```

- [ ] **Step 2:** Run `npx vitest run tests/unit/seo.test.ts tests/unit/jsonld.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement the builders and the two components. `serializeJsonLd` = `JSON.stringify` then replace `<`, `>`, `&`, U+2028, U+2029 with `\u` escapes.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Add SEO meta and JSON-LD builders"`

---

### Task 4: Tokens, fonts, base layout, 404 and the page-wide checks

**Files:**
- Create: `src/styles/global.css` (Tailwind import + `@theme` tokens + base + reduced motion), `src/layouts/BaseLayout.astro`, `src/components/Footer.astro`, `src/pages/404.astro`, `src/components/icons/Icon.astro`, `src/components/brand/Monogram.astro`, `public/favicon.svg`, `tests/e2e/pages.ts`, `tests/e2e/layout.spec.ts`, `tests/e2e/a11y.spec.ts`
- Modify: `src/pages/index.astro` (use the layout)

**Interfaces:**
- Consumes: `buildMeta`, `<Seo>`, `<JsonLd>` (Task 3).
- Produces: `<BaseLayout meta={Meta} jsonLd={object[]}>` with a "Skip to content" link, `<main id="main">`, footer, the single global `<audio id="player-audio" preload="none">` (used by Task 7), and a `nav` slot filled in Task 5.
- Produces: `tests/e2e/pages.ts` exporting `PAGES: string[]` (starts as `['/', '/404/']`); later tasks append their paths.
- Produces: `<Icon name="play" | "pause" | "menu" | "close" | "arrow-up-right" | "headphones" | "mail" | "copy" | "check" | "chevron-left" | "chevron-right" | "star" size?={number} label?={string} />` (inline SVG; `label` set means `role="img"` + `aria-label`, otherwise `aria-hidden="true"`). `<Monogram size?={number} />`: "KB" monogram in a thin rose circle, used in the footer and as `public/favicon.svg` (rose `#8E4A57` on blush `#FBE6E4`), linked from the layout as `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`.
- Tailwind theme names: `--color-ivory`, `--color-paper`, `--color-blush`, `--color-petal`, `--color-champagne`, `--color-rose`, `--color-rose-strong`, `--color-ink`, `--color-ink-soft`, `--color-muted`, `--color-muted-warm`, `--color-line`, `--color-rule`, `--color-surface-dark`, `--color-on-dark-muted`, `--color-bar-before`, `--color-toolkit-label`; `--font-display`, `--font-body`, `--font-script`. Hex values from the spec.

- [ ] **Step 1: Write the failing tests**

```ts
// layout.spec.ts
test('tokens and fonts', async ({ page }) => {
  await page.goto('/')
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(251, 246, 241)')
  expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toContain('Manrope')
})
test('no third-party requests on load', async ({ page }) => {
  const hosts = new Set<string>(); page.on('request', r => hosts.add(new URL(r.url()).host))
  await page.goto('/'); await page.waitForLoadState('networkidle')
  expect([...hosts]).toEqual(['localhost:4321'])
})
test('skip link is the first focusable element', ...)   // Tab once -> focused text 'Skip to content'
test('404 is noindex', ...)                             // meta[name=robots] content 'noindex'
for (const path of PAGES) test(`no horizontal overflow at 320px: ${path}`, async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 }); await page.goto(path)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
})
// a11y.spec.ts
for (const path of PAGES) test(`axe clean: ${path}`, async ({ page }) => {
  await page.goto(path)
  const r = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()
  expect(r.violations).toEqual([])
})
```

- [ ] **Step 2:** Run `npx playwright test tests/e2e/layout.spec.ts tests/e2e/a11y.spec.ts`. Expected: FAIL.
- [ ] **Step 3:** Install `@fontsource-variable/bodoni-moda`, `@fontsource-variable/manrope`, `@fontsource/mrs-saint-delafield`; import them in `global.css` (latin subset only). Write tokens, base styles (body ivory, ink text, Manrope 16px/1.6), focus ring `2px solid var(--color-rose)` offset 3px, and `@media (prefers-reduced-motion: reduce)` setting transition and animation durations to 0. Build the layout, footer (wordmark, title line, year) and 404 page.
- [ ] **Step 4:** Run the same command. Expected: PASS on all three projects.
- [ ] **Step 5: Commit** `git commit -m "Add design tokens, self-hosted fonts and base layout"`

---

### Task 5: Navbar option 1 and the mobile menu

**Files:**
- Create: `src/components/nav/Nav.astro`, `src/components/nav/MenuCard.astro`, `src/scripts/menu.ts`, `src/scripts/active-section.ts`, `tests/unit/menu.test.ts`, `tests/e2e/nav.spec.ts`
- Modify: `src/layouts/BaseLayout.astro` (render `<Nav>`)

**Interfaces:**
- Consumes: profile links (Task 2).
- Produces: `NAV_ITEMS` in `Nav.astro`: `[['01','About','about'],['02','Expertise','expertise'],['03','Calls','calls'],['04','Work','work'],['05','Experience','experience'],['06','Kind words','words']]`; hrefs are `#id` on `/` and `/#id` elsewhere.
- Produces: `initMenu(root: HTMLElement, mq?: MediaQueryList): () => void`, `initActiveSection(links: HTMLAnchorElement[]): () => void`.
- Produces: the play control `<a href="/#calls" data-play-featured>` (chip on desktop with label `Hear me · 1:42`, round button on phones); Task 7 attaches playback to `[data-play-featured]`.
- Breakpoints from the spec: links visible above 1100 px; chip label and "Let's talk" hidden at 640 px and below.

- [ ] **Step 1: Write the failing tests**

```ts
// menu.test.ts (jsdom)
test('toggle opens: aria-expanded true, card visible, first link focused, html[data-menu-open]', ...)
test('Escape closes and returns focus to the toggle', ...)
test('clicking a menu link closes the menu', ...)
test('Tab from the last item wraps to the close button', ...)
test('closes when viewport becomes desktop', () => {  // fake MediaQueryList dispatching change {matches: true}
  open(); mq.dispatch(true)
  expect(toggle.getAttribute('aria-expanded')).toBe('false'); expect(document.documentElement.hasAttribute('data-menu-open')).toBe(false)
})
// nav.spec.ts
test('desktop shows six numbered links and hides the menu button', ...)       // project desktop
test('phone shows wordmark, play and menu buttons only', ...)                 // project mobile
test('open menu lists 6 links, Let’s talk, LinkedIn, Upwork, OnlineJobs.ph', ...)
test('active link follows scroll', ...)  // scroll #calls into view -> link '03 Calls' has aria-current="true"
test('nav works without JavaScript', ...) // javaScriptEnabled: false: links are plain anchors, menu card reachable via <details> fallback
```

- [ ] **Step 2:** Run `npx vitest run tests/unit/menu.test.ts && npx playwright test tests/e2e/nav.spec.ts`. Expected: FAIL.
- [ ] **Step 3:** Build the markup from the D board and the Navbar board. No-JS fallback: the menu is a `<details>` with a `<summary>` styled as the menu button; `initMenu` upgrades it (prevents native toggle, manages `aria-expanded`, focus trap, Escape, scroll lock via `html[data-menu-open]`, closes on `mq` `(min-width: 1101px)` change). `initActiveSection` uses `IntersectionObserver` with `rootMargin: '-45% 0px -50% 0px'`.
- [ ] **Step 4:** Run the same commands, then `npx playwright test tests/e2e/a11y.spec.ts`. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Add pill navbar with accessible mobile menu"`

---

### Task 6: Home sections Hero, Highlights, Stats, About, Expertise

**Files:**
- Create: `src/components/ui/SectionHead.astro`, `src/components/home/{Hero,Highlights,Stats,About,Expertise}.astro`, `tests/e2e/home-top.spec.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: profile, metrics, expertise (Task 2); `buildMeta`, `personSchema`, `websiteSchema`, `profilePageSchema` (Task 3).
- Produces: `<SectionHead number?="01" eyebrow="About" title="From blueprints to" emphasis="business operations" id?="about-title" />` rendering an `h2` with the emphasis in italic Bodoni; used by every later section.
- Home `meta.description`: `Kyla Belas is an architecture-trained executive virtual assistant and project manager in Pampanga, Philippines, running construction operations, sales and marketing.` Home JSON-LD: website, profile page, person.

- [ ] **Step 1: Write the failing tests**

```ts
test('single h1 with the headline', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toHaveText('I keep projects, people & pipelines moving.')
})
test('rotating word list is readable as text', ...)    // visually hidden text lists all 6 rotating values
test('portrait is the LCP candidate', ...)             // img alt 'Portrait of Kyla Belas' has fetchpriority=high and no loading=lazy
test('highlights show $253.81K and the self-intro tile', ...)
test('stats strip shows 6+, 10.29%, 5-12, 20%', ...)
test('expertise renders 6 cards with italic numerals 01..06', ...)
test('reduced motion stops the rotating word', ...)    // emulateMedia reducedMotion 'reduce' -> animation-name 'none'
test('home JSON-LD has WebSite, ProfilePage and Person', ...)
```

- [ ] **Step 2:** Run `npx playwright test tests/e2e/home-top.spec.ts`. Expected: FAIL.
- [ ] **Step 3:** Build the sections from the D board. The revenue bars are two `<progress>` elements (`value` 28.91 and 253.81, `max` 253.81) with accessible labels "July 2025" and "July 2026". Portrait uses `<Picture formats={['avif','webp']} widths={[360,480,720]} sizes="(max-width: 640px) 90vw, 30vw" loading="eager" fetchpriority="high">`. Rotating word: CSS keyframes over 6 stacked spans, `aria-hidden`, with a visually hidden sentence listing all six.
- [ ] **Step 4:** Run the spec plus `layout.spec.ts` and `a11y.spec.ts`. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Build hero, highlights, stats, about and expertise"`

---

### Task 7: Audio player, Calls section and /calls page

**Files:**
- Create: `src/scripts/player.ts`, `src/scripts/player-ui.ts`, `src/components/calls/{CallsSection,TrackList,NowPlaying,Waveform}.astro`, `src/pages/calls/index.astro`, `tests/unit/player.test.ts`, `tests/e2e/calls.spec.ts`
- Modify: `src/pages/index.astro`, `src/layouts/BaseLayout.astro` (embed track data), `tests/e2e/pages.ts` (add `/calls/`)

**Interfaces:**
- Consumes: recordings, `orderRecordings`, `formatDuration`, `audioObjectSchema`, `breadcrumbSchema`; `#player-audio` (Task 4); `[data-play-featured]` (Task 5).
- Produces:
  - `type TrackData = { id: string; title: string; src: string; durationSec: number }`
  - `type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'error'`
  - `type PlayerSnapshot = { id: string; state: PlayerState; time: number; duration: number }`
  - `createPlayer(audio: HTMLAudioElement, tracks: TrackData[]): { play(id: string): Promise<void>; toggle(id?: string): Promise<void>; seek(sec: number): void; snapshot(): PlayerSnapshot; subscribe(fn: (s: PlayerSnapshot) => void): () => void }`
  - `initPlayerUI(doc: Document): void` binds `[data-track-id]` buttons, `[data-play-featured]`, `[data-seek]` range inputs (`aria-valuetext` like `0:24 of 1:42`), `[data-filter]` chips (`aria-pressed`, hides list items with `hidden`), and a `[data-now-playing]` region with `aria-live="polite"`.
  - Track data embedded once as `<script type="application/json" id="track-data">` (a data block, not executed).
- Waveform is decorative SVG (`aria-hidden="true"`), bar heights as `height` attributes, progress shown by a clip rectangle width attribute.

- [ ] **Step 1: Write the failing tests**

```ts
// player.test.ts (fake audio: src, currentTime, duration, paused, play(), pause(), dispatchEvent)
test('play switches source and goes loading then playing', ...)
test('playing a second track pauses the first: one audio element, one source', ...)
test('ignores events from a superseded track', async () => {
  p.play('a'); p.play('b'); audio.emitFor('a', 'playing')
  expect(p.snapshot()).toMatchObject({ id: 'b', state: 'loading' })
})
test('error event sets state error and stops', ...)
test('toggle on the current playing track pauses', ...)
test('seek clamps to 0..duration', ...)
// calls.spec.ts
test('no audio is requested before the first play', ...)        // no request matching /\/audio\//
test('home lists 11 tracks plus the featured self introduction tagged Recorded early 2025', ...)
test('only one track plays at a time', ...)                     // play track 1, then track 3 -> audio.src ends with 2a-client-call.mp3, track 1 button shows Play
test('filter Cold calling shows 4 tracks', ...)
test('nav play control plays self-introduction.mp3 and shows pause', ...)
test('failed audio shows an error and resets the button', ...)  // route /audio/seller-script.mp3 -> 404; text 'Couldn’t load this call. Try again.'
test('/calls lists every recording and emits one AudioObject each', ...)
test('More recordings on Drive link points to the recordings folder', ...)
```

- [ ] **Step 2:** Run `npx vitest run tests/unit/player.test.ts && npx playwright test tests/e2e/calls.spec.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `createPlayer` with a request token: each `play` increments it and event handlers ignore events whose token is stale. Build the section and page from the D board (petal panel, now-playing card, filter chips, numbered list) and the mobile frame 4. `/calls/` renders each recording as an `article` with `h2` title, group, duration, and `<details>` for `summary`/`transcript` when present; meta title `Call recordings`, breadcrumb Home > Call recordings.
- [ ] **Step 4:** Run the commands plus `layout.spec.ts` and `a11y.spec.ts`. Expected: PASS on all projects, including `mobile-webkit`.
- [ ] **Step 5: Commit** `git commit -m "Add single-instance audio player and call recordings"`

---

### Task 8: Portfolio preview, /work pages and lightbox

**Files:**
- Create: `src/components/work/{WorkGrid,CategoryNav,WorkPreview}.astro`, `src/scripts/lightbox.ts`, `src/pages/work/index.astro`, `src/pages/work/[category].astro`, `tests/unit/lightbox.test.ts`, `tests/e2e/work.spec.ts`
- Modify: `src/pages/index.astro`, `tests/e2e/pages.ts` (add `/work/`, `/work/architecture/`, `/work/construction/`, `/work/marketing/`, `/work/growth/`)

**Interfaces:**
- Consumes: portfolio, `categoryCounts`, `homePortfolio`, `CATEGORY_LABELS`, `itemListSchema`, `breadcrumbSchema`.
- Produces: `initLightbox(container: HTMLElement): () => void` over `a[data-lightbox]` links inside `container`, using one `<dialog>`; reused by Task 9 for review screenshots.
- `WorkGrid` props: `items`, `eagerCount` (default 0; 3 on `/work/` pages). Each item: `<figure><a href={full image URL} data-lightbox><Picture widths={[320,480,720,960]} sizes="(max-width: 640px) 50vw, (max-width: 1100px) 50vw, 33vw"/></a><figcaption>`.
- `CategoryNav` renders real links with counts (`All work 38`, `Architecture 9`, `2A Construction 7`, `Marketing 20`, `Business records 2`) and `aria-current="page"` on the current one.

- [ ] **Step 1: Write the failing tests**

```ts
// lightbox.test.ts (jsdom, HTMLDialogElement showModal polyfilled)
test('click opens dialog on the clicked item with caption "3 / 9"', ...)
test('ArrowRight and ArrowLeft wrap around', ...)
test('closing returns focus to the trigger', ...)
// work.spec.ts
test('/work/ shows 38 pieces; /work/architecture/ shows 9', ...)
test('category links are crawlable anchors with counts', ...)
test('home preview shows 9 pieces in homeOrder and links to /work/', ...)  // link text 'See all 38 pieces'
test('works without JavaScript', ...)  // javaScriptEnabled false: clicking a piece navigates to the image URL; category link loads its page
test('images have width and height attributes', ...)
test('ItemList JSON-LD has 38 entries on /work/', ...)
```

- [ ] **Step 2:** Run `npx vitest run tests/unit/lightbox.test.ts && npx playwright test tests/e2e/work.spec.ts`. Expected: FAIL.
- [ ] **Step 3:** Build from the D board (masonry via CSS `columns: 3 300px`, rounded tiles, italic Bodoni captions) and mobile frame 5 (two columns, chips scroll sideways). `getStaticPaths` returns the 4 categories. Meta descriptions per category name the category and its count.
- [ ] **Step 4:** Run the commands plus `layout.spec.ts` and `a11y.spec.ts`. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Add portfolio pages with category routes and lightbox"`

---

### Task 9: Experience, Kind words, FAQ and footer content

**Files:**
- Create: `src/components/home/{Experience,KindWords,Faq}.astro`, `tests/unit/faq.test.ts`, `tests/e2e/home-bottom.spec.ts`
- Modify: `src/pages/index.astro` (add sections and conditional `faqPageSchema`)

**Interfaces:**
- Consumes: metrics, experience, reviews, faq, profile.upwork; `initLightbox` (Task 8); `faqPageSchema` (Task 3).
- `<Faq items={FaqEntry[]} />` renders nothing when `items` is empty; otherwise `h2` "Questions, answered" and one `<details>` per entry with the question as `<summary>`. The page passes only `approved: true` entries.
- Kind words: feature quote (review with `home: 'feature'`), Upwork card (4.6, `Jun 29 - Jul 9, 2023`), the three `home: 'card'` reviews, and a button "See all 13 original screenshots" opening the lightbox over every review image.

- [ ] **Step 1: Write the failing tests**

```ts
// faq.test.ts (experimental_AstroContainer from 'astro/container')
test('renders nothing for an empty list', async () => expect((await render(Faq, { items: [] })).trim()).toBe(''))
test('renders one details per entry with the question as summary', ...)
// home-bottom.spec.ts
test('growth cards show $253.81K, 10.29%, $636.01K with their July 2025 values', ...)
test('experience lists 6 roles, newest first, starting with Sharks Capital | 2A Construction LLC', ...)
test('feature quote is Tracy Scuteri, verbatim', ...)
test('three review cards: Mayra J., Agency lead, Josie A.', ...)
test('screenshot archive opens with 13 images', ...)
test('unapproved FAQ questions are absent from the HTML and no FAQPage JSON-LD is emitted', ...)
```

- [ ] **Step 2:** Run `npx vitest run tests/unit/faq.test.ts && npx playwright test tests/e2e/home-bottom.spec.ts`. Expected: FAIL.
- [ ] **Step 3:** Build from the D board (dark rounded experience card with growth cards and role rows; blush pull-quote panel; review cards) and mobile frame 6. Below the role rows, render the 7 `clients` entries as a compact list (name, place, role, one-line work) so the project-based work stays crawlable text.
- [ ] **Step 4:** Run the commands plus `layout.spec.ts` and `a11y.spec.ts`. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Add experience, testimonials and FAQ sections"`

---

### Task 10: Contact form with Formspree and mailto fallback

**Files:**
- Create: `src/components/home/Contact.astro`, `src/lib/mailto.ts`, `src/scripts/contact.ts`, `tests/unit/contact.test.ts`, `tests/e2e/contact.spec.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: profile email and links; `import.meta.env.PUBLIC_FORMSPREE_ID`.
- Produces: `buildMailto(data: { name: string; email: string; company?: string; message: string }, to: string): string`; `submitContact(form: HTMLFormElement, deps: { fetch: typeof fetch; formspreeId: string; to: string; navigate: (url: string) => void }): Promise<'sent' | 'mailto' | 'error' | 'spam' | 'invalid'>`; `initContact(form: HTMLFormElement): void`.
- Markup: `method="post"`, `action` = `https://formspree.io/f/{id}` when the ID is set, else `mailto:kylabelasss@gmail.com` with `enctype="text/plain"`. Fields: `name` (required, maxlength 100), `email` (type email, required, maxlength 254), `company` (maxlength 120), `message` (required, minlength 10, maxlength 5000), honeypot `_gotcha` (visually hidden, `tabindex="-1"`, `autocomplete="off"`). Status region `role="status"`.
- Status copy (exact): sent `Thank you! Your message is on its way. I’ll get back to you soon.`; mailto `Your email app should open with the message ready to send. If it didn’t, copy kylabelasss@gmail.com and write to me directly.`; error `The message couldn’t be sent. Please try again, or email kylabelasss@gmail.com directly.`

- [ ] **Step 1: Write the failing tests**

```ts
// contact.test.ts
test('buildMailto', () => expect(buildMailto({ name: 'Ann Lee', email: 'ann@x.com', company: 'Acme', message: 'Hi there, quick question' }, 'kylabelasss@gmail.com'))
  .toBe('mailto:kylabelasss@gmail.com?subject=Portfolio%20inquiry%20from%20Ann%20Lee%20(Acme)&body=Hi%20there%2C%20quick%20question%0A%0AAnn%20Lee%0Aann%40x.com'))
test('honeypot filled returns spam and sends nothing', ...)
test('posts JSON with Accept application/json and returns sent on 200', ...)
test('returns error on 429 and on network failure', ...)
test('a second submit while sending is ignored', ...)
test('empty formspreeId navigates to the mailto URL', ...)
// contact.spec.ts
test('success message after Formspree 200', ...)   // page.route('https://formspree.io/**', 200 {ok:true}); build with PUBLIC_FORMSPREE_ID=test123
test('error message after Formspree 429', ...)
test('double click sends one request', ...)
test('submits without JavaScript', ...)            // javaScriptEnabled false: form action/method present and required fields enforced
test('email row copy button copies the address', ...)
```

- [ ] **Step 2:** Run `npx vitest run tests/unit/contact.test.ts && npx playwright test tests/e2e/contact.spec.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement and build the section from the D board (rounded card, blush form panel, underline fields, profile pills). Playwright `webServer` env gains `PUBLIC_FORMSPREE_ID=test123`.
- [ ] **Step 4:** Run the commands plus `a11y.spec.ts`. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Add contact form with Formspree and mailto fallback"`

---

### Task 11: robots.txt, sitemap, llms.txt, Open Graph image and the SEO sweep

**Files:**
- Create: `src/pages/robots.txt.ts`, `src/pages/llms.txt.ts`, `src/lib/llms.ts`, `scripts/make-og.mjs`, `public/og/default.png` (generated, committed), `tests/unit/llms.test.ts`, `tests/unit/og.test.ts`, `tests/e2e/seo.spec.ts`

**Interfaces:**
- Consumes: all collections; `PAGES` (Task 4).
- Produces: `buildLlmsTxt(input: { site: URL; profile; pages: { title: string; path: string; summary: string }[] }): string`; `buildRobotsTxt(site: URL): string`.
- `robots.txt` (exact):

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: {site}sitemap-index.xml
```

- `llms.txt` starts `# Kyla Belas`, then a blank line, then `> ` + profile intro, then `## Pages` (Home, Portfolio, each category, Call recordings, with absolute URLs and one-line summaries), then `## Profiles` (LinkedIn, Upwork, OnlineJobs.ph), then `## Contact` with the email.
- `scripts/make-og.mjs` (devDependencies `satori`, `@resvg/resvg-js`; fonts from the Fontsource `.woff` files): 1200x630, ivory background, blush card, portrait on the right, wordmark "Kyla Belas" in Mrs Saint Delafield, line "Executive Virtual Assistant · Project Manager" in Bodoni Moda. npm script `og`.

- [ ] **Step 1: Write the failing tests**

```ts
test('buildLlmsTxt header and sections', () => {
  const t = buildLlmsTxt({ site, profile, pages })
  expect(t.startsWith('# Kyla Belas\n\n> ')).toBe(true)
  expect(t).toContain('## Pages'); expect(t).toContain('- [Call recordings](https://example.com/calls/)')
})
test('robots lists the sitemap', () => expect(buildRobotsTxt(site)).toContain('Sitemap: https://example.com/sitemap-index.xml'))
test('og image is 1200x630 png', async () => expect(await sharp('public/og/default.png').metadata()).toMatchObject({ width: 1200, height: 630, format: 'png' }))
// seo.spec.ts, over PAGES except /404/
test('titles are unique across pages', ...)
test('each page: one h1, description 50..160 chars, canonical equals SITE_URL + path, absolute og:image', ...)
test('every JSON-LD block parses and has @context https://schema.org', ...)
test('sitemap lists every indexable page and not /404/', ...)
```

- [ ] **Step 2:** Run `npx vitest run tests/unit/llms.test.ts tests/unit/og.test.ts && npx playwright test tests/e2e/seo.spec.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement the endpoints and the OG script; run `npm run og` and commit the image. Configure the sitemap integration to exclude `/404/`.
- [ ] **Step 4:** Run the same commands. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Add robots, sitemap, llms.txt and Open Graph image"`

---

### Task 12: Security headers and CSP

**Files:**
- Create: `scripts/build-headers.mjs`, `tests/unit/headers.test.ts`, `tests/e2e/security.spec.ts`
- Modify: `package.json` (`build` = `astro build && node scripts/build-headers.mjs`)

**Interfaces:**
- Produces (exported from the script for tests): `collectInlineHashes(html: string): string[]` (sha256 base64 of every inline `<script>` body whose `type` is absent, `module` or `text/javascript`; data blocks such as `application/ld+json` and `application/json` are skipped), `findInlineStyles(html: string): string[]` (any `style=` attribute or `<style>` element), `renderHeaders(scriptHashes: string[]): string`. The main function walks `dist/**/*.html`, fails the build with the file names if `findInlineStyles` finds anything, and writes `dist/_headers`.
- `dist/_headers` (exact, `{hashes}` = space-separated `'sha256-...'` values, sorted):

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' {hashes}; style-src 'self'; img-src 'self' data:; font-src 'self'; media-src 'self'; connect-src 'self' https://formspree.io; form-action 'self' https://formspree.io mailto:; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests
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
```

- [ ] **Step 1: Write the failing tests**

```ts
test('hashes inline scripts and skips data blocks', () => {
  const h = collectInlineHashes('<script>a()</script><script type="application/ld+json">{}</script><script src="/x.js"></script>')
  expect(h).toEqual([`'sha256-${createHash('sha256').update('a()').digest('base64')}'`])
})
test('finds style attributes and style elements', ...)
test('renderHeaders matches the exact template', ...)
// security.spec.ts: serves dist through page.route adding the headers parsed from dist/_headers
for (const path of PAGES) test(`no CSP violations: ${path}`, ...)  // collect console messages matching /Content Security Policy/ -> expect []
test('external links opened in a new tab carry noopener noreferrer', ...)
```

- [ ] **Step 2:** Run `npx vitest run tests/unit/headers.test.ts && npx playwright test tests/e2e/security.spec.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement the script. Fix any component that still emits a `style=` attribute.
- [ ] **Step 4:** Run `SITE_URL=http://localhost:4321 npm run build`, then both test commands. Expected: build writes `dist/_headers`; tests PASS.
- [ ] **Step 5: Commit** `git commit -m "Generate strict CSP and security headers at build"`

---

### Task 13: CI, budgets, deploy config, docs and legacy removal

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/dependabot.yml`, `lighthouserc.json`, `wrangler.toml`, `.env.example`, `README.md`
- Delete: `legacy/`

**Interfaces:**
- `ci.yml` on push and pull request, Node from `.nvmrc`: `npm ci`, `npm audit --audit-level=high`, `npm run lint`, `npm run check`, `npm test`, `npm run build` (env `SITE_URL` from a repository variable, fallback `https://kyla-belas.pages.dev/`), `npx playwright install --with-deps`, `npm run test:e2e`, `npx @lhci/cli autorun`.
- `lighthouserc.json`: `staticDistDir: ./dist`, urls `/`, `/work/`, `/calls/`; assertions `categories:performance >= 0.9`, `categories:accessibility >= 0.95`, `categories:best-practices >= 0.95`, `categories:seo >= 1`, `resource-summary:script:size <= 30000`.
- `dependabot.yml`: npm and github-actions, weekly.
- `wrangler.toml` (Cloudflare Pages): `name = "kyla-belas"`, `pages_build_output_dir = "dist"`, `compatibility_date = "2026-11-01"`. README documents the Pages dashboard build settings: build command `npm run build`, output `dist`, env `NODE_VERSION=22`, `SITE_URL=https://kyla-belas.pages.dev/`, optional `PUBLIC_FORMSPREE_ID`; and the CLI deploy `npx wrangler pages deploy dist`.
- `.env.example`: `SITE_URL=` and `PUBLIC_FORMSPREE_ID=` with one comment line each.
- `README.md`: how to edit each YAML file, add a portfolio piece (drop image in `src/assets/images/<category>/`, add one entry), add a recording (drop mp3 in `public/audio/`, add one entry, `summary`/`transcript` optional), approve an FAQ entry, set the two env vars, run, test, deploy.

- [ ] **Step 1:** Write `lighthouserc.json`, then run `SITE_URL=http://localhost:4321 npm run build && npx @lhci/cli autorun`. Expected: all assertions pass; fix regressions in the owning component if not.
- [ ] **Step 2:** Delete `legacy/`; run `npm run lint && npm run check && npm test && npm run test:e2e`. Expected: all PASS (nothing imports `legacy/`).
- [ ] **Step 3:** Write the workflow, Dependabot config, `wrangler.toml`, `.env.example` and README.
- [ ] **Step 4:** Run `npx prettier --check .` and validate the workflow with `npx action-validator .github/workflows/ci.yml` (or push to a branch and confirm the run is green). Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Add CI, Lighthouse budgets and maintainer docs"`

---

## Open items carried from the spec

Formspree ID, Kyla's own logo (SVG monogram until then), smaller Malia file, call summaries or transcripts, FAQ approval. None blocks Tasks 1 to 13; each lands later as a config value, a file swap or one YAML entry.
