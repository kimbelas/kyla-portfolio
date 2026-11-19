import { loadEnv } from 'vite'

export const DEV_SITE = 'http://localhost:4321'

/**
 * The site address for astro.config.mjs. Astro evaluates its config before it
 * loads .env, so the .env files are read here with Vite's loader. Builds must
 * have SITE_URL; every other command (dev, preview, check) falls back to the
 * local dev address.
 */
export function resolveSite({ command, root, env = process.env }) {
  const isBuild = command === 'build'
  const fromFiles = loadEnv(
    isBuild ? 'production' : 'development',
    root,
    'SITE_URL',
  )
  const site = env.SITE_URL || fromFiles.SITE_URL
  if (site) return site
  if (isBuild) throw new Error('SITE_URL is required for builds')
  return DEV_SITE
}
