import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

const site = process.env.SITE_URL

if (process.argv.includes('build') && !site) {
  throw new Error('SITE_URL is required for builds')
}

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'never' },
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
})
