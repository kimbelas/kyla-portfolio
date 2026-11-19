# Kyla Belas portfolio

The portfolio site for Kyla Belas. It is a static site built with Astro and hosted on Cloudflare Pages at
https://kyla-belas.pages.dev/.

Almost everything you will want to change lives in plain text files in `src/content/`. You edit a file, save
it, and the next deploy shows the change. You never need to touch the page code to update copy, pictures or
recordings.

The source lives at https://github.com/kimbelas/kyla-portfolio. To get a copy:

```sh
git clone https://github.com/kimbelas/kyla-portfolio.git
cd kyla-portfolio
npm ci
```

## Pending items

These are waiting on Kyla or the owner. None of them blocks the site from going live.

- **Formspree ID.** Until it is set, the contact form opens the visitor's email app instead of sending
  through Formspree. See [Settings](#settings-the-two-environment-variables).
- **Kyla's own logo.** A "KB" monogram (`src/components/brand/Monogram.astro` and `public/favicon.svg`)
  stands in until she supplies one.
- **Smaller copy of Malia's call.** Once the file exists, add it as one recording entry (see
  [Add a recording](#add-a-recording)).
- **Call summaries or transcripts.** Optional text for each recording (`summary` and `transcript` in
  `src/content/recordings.yaml`).
- **FAQ approval.** Every FAQ answer is a draft (`approved: false`), so the FAQ section is hidden. See
  [Approve an FAQ entry](#approve-an-faq-entry).

## What you need on your computer

1. Node.js version 22 (the version is written in `.nvmrc`).
2. Run `npm ci` once in this folder to install everything.

## Edit the content files

Each file in `src/content/` is a YAML list. Every entry starts with `- id:` and the lines under it are
indented by two spaces. Keep the indentation exactly as it is, keep each `id` unique, and only change the
text after the colon. If a value contains a colon or starts with a quote, wrap it in quotes.

| File              | What it controls                                                                  |
| ----------------- | --------------------------------------------------------------------------------- |
| `profile.yaml`    | Name, headline, intro, about text, stats, skills, tools, links and section titles |
| `metrics.yaml`    | The before and after revenue bars                                                 |
| `expertise.yaml`  | The expertise cards and their bullet points                                       |
| `experience.yaml` | The work history entries                                                          |
| `clients.yaml`    | The client list                                                                   |
| `portfolio.yaml`  | Every image on the work pages                                                     |
| `recordings.yaml` | Every call recording                                                              |
| `reviews.yaml`    | Review screenshots and the quotes shown on the home page                          |
| `faq.yaml`        | FAQ questions and answers                                                         |

Rules that the build checks for you:

- Review quotes stay word for word. A shortened `excerpt` must be an exact piece of the full `quote`.
- FAQ questions end with a question mark.
- Use a plain hyphen for ranges (`2014-2018`), never a long dash.

If you break a rule, `npm run build` stops and names the file and the line to fix.

## Add a portfolio piece

1. Save the image as a `.webp` file in the folder for its category: `src/assets/images/<category>/`, for
   example `src/assets/images/marketing/summer-promo.webp`.
2. Add one entry to `src/content/portfolio.yaml`:

   ```yaml
   - id: summer-promo
     title: Summer Promotion
     category: marketing
     tag: Brucksch & Sons
     image: ../assets/images/marketing/summer-promo.webp
     alt: Social media graphic promoting a summer remodeling discount
   ```

   - `category` is one of `marketing`, `construction`, `growth` or `architecture`.
   - `alt` describes the image for screen readers (at least 10 characters).
   - Optional: `homeOrder: 1` to `9` puts the piece on the home page in that position.

The site resizes and compresses the image for you.

## Add a recording

1. Save the mp3 in `public/audio/`, using lowercase letters, numbers and hyphens only, for example
   `public/audio/malia-call.mp3`.
2. Add one entry to `src/content/recordings.yaml`:

   ```yaml
   - id: malia-call
     title: Malia call
     group: Cold calling
     file: malia-call.mp3
     durationSec: 245
   ```

   - `group` is one of `Introduction`, `Construction`, `Appointment setting`, `Cold calling` or
     `Real estate`.
   - `durationSec` is the length in seconds (4 minutes 5 seconds is `245`).
   - Optional: `featured: true` (the call the "Start here" player opens with), `note`, `summary` and
     `transcript`.

## Approve an FAQ entry

Once Kyla has read and agreed with an answer in `src/content/faq.yaml`, change that entry's
`approved: false` to `approved: true`. Only approved entries appear on the site. When at least one is
approved, the FAQ section and its search engine data appear automatically.

## Settings: the two environment variables

| Name                  | Required | Value                                                                     |
| --------------------- | -------- | ------------------------------------------------------------------------- |
| `SITE_URL`            | Builds   | `https://kyla-belas.pages.dev/` (change only if a custom domain is added) |
| `PUBLIC_FORMSPREE_ID` | No       | The form ID from Formspree (the part after `/f/` in the form's endpoint)  |

- **On your computer:** copy `.env.example` to a new file named `.env` and fill in the values. Both
  `npm run dev` and `npm run build` read `.env`. A build stops with "SITE_URL is required for builds" when
  `SITE_URL` is missing; `npm run dev` works without it and uses `http://localhost:4321` instead.
- **On Cloudflare Pages:** set them in the Pages project under Settings, Variables and Secrets (see
  [Deploy](#deploy)), then redeploy.

## Run the site on your computer

```sh
npm run dev
```

Then open http://localhost:4321/ in a browser. No `.env` is needed for this. Changes to content files show
up when you save.

## Test

```sh
npm run lint      # code style and formatting
npm run check     # type and content checks
npm test          # unit tests
npm run test:e2e  # browser tests (first time only: npx playwright install)
```

GitHub runs all of these on every push and pull request (`.github/workflows/ci.yml`), plus a Lighthouse
check of `/`, `/work/` and `/calls/` (`lighthouserc.json`). The Lighthouse budgets are: performance at
least 0.9, accessibility at least 0.95, best practices at least 0.95, SEO 1.0 and at most 30 KB of
JavaScript. To run it yourself after a build: `npx @lhci/cli autorun`.

Dependabot (`.github/dependabot.yml`) opens a pull request each week when a dependency has an update.

## Deploy

### Cloudflare Pages dashboard (automatic on every push)

In the Pages project, under Settings, Build:

| Setting                | Value                            |
| ---------------------- | -------------------------------- |
| Build command          | `npm run build`                  |
| Build output directory | `dist`                           |
| `NODE_VERSION`         | `22`                             |
| `SITE_URL`             | `https://kyla-belas.pages.dev/`  |
| `PUBLIC_FORMSPREE_ID`  | Optional, your Formspree form ID |

The build also writes `dist/_headers`, which sets the security headers Cloudflare serves with every page.

### From your computer

```sh
SITE_URL=https://kyla-belas.pages.dev/ npm run build
npx wrangler pages deploy dist
```

The project name and output folder come from `wrangler.toml`. Wrangler asks you to log in to Cloudflare
the first time.
