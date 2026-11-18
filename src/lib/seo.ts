export type Meta = {
  title: string
  description: string
  canonical: string
  image: { url: string; width: 1200; height: 630; alt: string }
  type: 'website' | 'profile'
  noindex: boolean
}

const HOME_TITLE =
  'Kyla Belas · Executive Virtual Assistant and Project Manager'
const DEFAULT_IMAGE_PATH = '/og/default.png'
const DEFAULT_IMAGE_ALT =
  'Kyla Belas, executive virtual assistant and project manager'

export function buildMeta(input: {
  title?: string
  description: string
  path: string
  site: URL
  noindex?: boolean
}): Meta {
  const { title, description, path, site, noindex = false } = input
  if (description.length < 50 || description.length > 160) {
    throw new Error(
      `Meta description must be 50-160 characters, got ${description.length}`,
    )
  }
  return {
    title: title ? `${title} · Kyla Belas` : HOME_TITLE,
    description,
    canonical: new URL(path, site).href,
    image: {
      url: new URL(DEFAULT_IMAGE_PATH, site).href,
      width: 1200,
      height: 630,
      alt: DEFAULT_IMAGE_ALT,
    },
    type: path === '/' ? 'profile' : 'website',
    noindex,
  }
}
