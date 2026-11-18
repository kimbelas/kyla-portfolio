# Kyla Belas portfolio rebuild: design spec

Date: 2026-11-18. Status: approved direction, awaiting plan review.

## Source of truth

- Visual design: canvas https://claude.ai/artifact/L3mmaWXcqnfoXWMEmeYKXp
  - Board "D · Atelier Studio (A + B)": desktop layout (1440 px).
  - Board "D · Mobile view (390 px)": phone layout, menu closed and open.
  - Board "Navbar options": option 1 "Pill with a call shortcut" is the chosen navbar.
- Content: legacy `src/data/content.js` (moved to `legacy/` by the plan), plus the assets in `public/images` and `public/audio`.

## Architecture decisions

| Decision | Choice | Why |
|---|---|---|
| Framework | Astro, static output, TypeScript strict | Real HTML per page for crawlers and answer engines; zero JS by default |
| Interactivity | Small vanilla TypeScript modules, no UI framework runtime | Four behaviors only (menu, player, lightbox, contact form); smallest JS, fewest dependencies |
| Styling | Tailwind CSS v4 with design tokens in one `@theme` file | Already in the project; tokens keep the design in one place |
| Content | Astro content collections (YAML) validated by Zod schemas | Kyla's content edits never touch components; bad data fails the build |
| Images | `astro:assets` `<Picture>` (AVIF + WebP, explicit sizes) | Core Web Vitals, no layout shift |
| Fonts | Self-hosted via Fontsource | No third-party requests, strict CSP, faster first paint |
| Contact | Formspree with honeypot, `mailto:` fallback while no ID is set | No backend to secure |
| Hosting | Cloudflare Pages (static assets, reads `dist/_headers`), production URL `https://kyla-belas.pages.dev/` | Owner decision 2026-11-18 |
| Icons and logo | Hand-written inline SVG: icon components plus a "KB" monogram logo and `favicon.svg` | Owner decision 2026-11-18; no icon library dependency |

## Pages

| Path | Purpose |
|---|---|
| `/` | Home, sections in the order below |
| `/work/` | All 38 portfolio pieces |
| `/work/{architecture,construction,marketing,growth}/` | One crawlable page per category |
| `/calls/` | Every recording with duration, optional summary and transcript |
| `/404` | Not found, `noindex` |
| `/robots.txt`, `/sitemap-index.xml`, `/llms.txt` | Crawler and answer-engine files |

Home section order: Nav, Hero, Highlights (self-intro player, year-one revenue, toolkit), Stats strip, 01 About, 02 Expertise, 03 Calls, 04 Portfolio preview (9 pieces), 05 Experience, 06 Kind words, Questions (FAQ, only approved entries), 07 Contact, Footer.

## Design tokens (exact)

| Token | Hex | Use |
|---|---|---|
| ivory | `#FBF6F1` | page background |
| paper | `#FFFDFB` | cards, nav pill |
| blush | `#FBE6E4` | hero card, soft fills |
| petal | `#F5D0D3` | calls panel, portrait card, play chip |
| champagne | `#F3E6D8` | toolkit tile, expertise cards |
| rose | `#8E4A57` | accent text, primary buttons |
| rose-strong | `#7A3646` | accent text on petal |
| ink | `#2E2326` | text, dark sections |
| ink-soft | `#3F3236` | body copy |
| muted | `#6E5A5E` | secondary text on light |
| muted-warm | `#5A474B` | secondary text on blush |
| line | `#EBD8D3` | card borders |
| rule | `#DCC2BD` | hairlines inside cards |
| surface-dark | `#3D2F33` | cards inside dark sections |
| on-dark-muted | `#CDB8BB` | secondary text on ink |
| bar-before | `#C98A95` | "before" bar in growth charts |
| toolkit-label | `#74463A` | label on champagne |

Fonts: display `Bodoni Moda` (variable, italic used for emphasis and numerals), body `Manrope`, script `Mrs Saint Delafield` (wordmark, signatures, pull quote). Radii: cards 28 px, large panels 32 px, pills 999 px. Touch targets at least 44 px.

## Navbar (option 1)

- Floating pill, sticky at 12 px from the top on every page.
- Desktop (wider than 1100 px): script wordmark, links `01 About, 02 Expertise, 03 Calls, 04 Work, 05 Experience, 06 Kind words` (current section highlighted in blush), play chip "Hear me · 1:42" (plays the self introduction), "Let's talk" button.
- 641 to 1100 px: links collapse into a dark round menu button; chip label and "Let's talk" stay.
- 640 px and below: wordmark, round play button, menu button.
- Menu (open): card under the pill with the six numbered links in Bodoni, a "Start here · Self introduction 1:42" player row, full-width "Let's talk", and LinkedIn, Upwork, OnlineJobs.ph buttons.

## Behavior

- Only one recording plays at a time; the nav play control mirrors the global player (pause icon while anything plays).
- Audio loads only on first play (`preload="none"`).
- Portfolio categories are real links to category pages; the lightbox is an enhancement over plain image links.
- Everything readable and navigable with JavaScript off; the form still submits.
- `prefers-reduced-motion` disables the rotating hero word and all transitions.

## SEO, AEO, GEO requirements

- Unique title, meta description (50 to 160 characters), canonical URL, Open Graph and Twitter tags on every page; one `h1` per page.
- JSON-LD: `WebSite`, `ProfilePage` + `Person` (jobTitle, address Pampanga PH, alumniOf Holy Angel University, degree credential, knowsAbout, sameAs LinkedIn/Upwork/OnlineJobs.ph), `AudioObject` per recording, `ItemList` of `CreativeWork` on portfolio pages, `BreadcrumbList` on subpages, `FAQPage` when approved FAQ entries exist.
- Answer-first copy: facts stated as plain sentences and lists, not only inside images or audio.
- `/llms.txt` generated from content; `robots.txt` allows search and AI crawlers and lists the sitemap.
- Call summaries and transcripts are optional content fields so the audio becomes readable text when Kyla supplies them.
- Static Open Graph image 1200 x 630.

## Security requirements

- Content-Security-Policy with hashes for any inline script, no `unsafe-inline`, no inline `style` attributes.
- Security headers: HSTS, nosniff, strict referrer policy, restrictive Permissions-Policy, COOP same-origin, frame denial.
- JSON-LD serialized with `<`, `>`, `&`, U+2028, U+2029 escaped.
- Contact form: honeypot, length limits, double-submit guard, only Formspree as a third-party endpoint.
- External links opened in a new tab carry `rel="noopener noreferrer"`.
- CI runs `npm audit --audit-level=high`; Dependabot keeps dependencies current.

## Maintainability requirements

- All copy, links and media references live in `src/content/*.yaml`; adding a portfolio piece or recording is one YAML entry plus the file.
- A content-integrity test fails on: unknown category, missing image or audio file, duplicate id, more than one featured recording, en or em dash in copy, testimonial excerpt that is not a verbatim substring.
- CI gates: lint, type check, unit tests, build, end-to-end tests with axe, Lighthouse budgets.

## Content rules

- Testimonial quotes stay word for word (including "Kayla" in Sanjeshni Devi's review). A shortened version is allowed only as a contiguous substring of the full quote.
- No invented facts. FAQ answers are drafted only from existing content and ship only when marked `approved: true` after Kyla's sign-off.
- Never add: the Contenu voice recording, the two excluded review screenshots (one with criticism, one with profanity).
- Date and number ranges use a hyphen (`5-12`, `2014-2018`), never an en or em dash.

## Open items (owner decisions, not blockers for building)

1. Domain: `https://kyla-belas.pages.dev/` for now (resolved; a custom domain later only changes `SITE_URL`).
2. Hosting: Cloudflare Pages (resolved).
3. Formspree form ID (`PUBLIC_FORMSPREE_ID`).
4. Kyla's personal logo: an SVG monogram stands in until she supplies one.
5. Smaller copy of Malia's call (one YAML entry once it exists).
6. Call summaries or transcripts (optional, strongest AEO gain).
7. Kyla's approval of the drafted FAQ answers.
