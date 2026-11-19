import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { resolveSite } from './scripts/site-url.mjs'

const site = resolveSite({
  command: process.argv.includes('build') ? 'build' : 'dev',
  root: process.cwd(),
})

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'never' },
  integrations: [
    sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/404') }),
  ],
  vite: { plugins: [tailwindcss()] },
})
