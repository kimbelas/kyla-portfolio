import { CATEGORY_LABELS, type Category } from './collections'

type LlmsProfile = {
  intro: string
  email: string
  links: { linkedin: string; upwork: string; onlinejobs: string }
}

export function buildRobotsTxt(site: URL): string {
  const agents = [
    '*',
    'GPTBot',
    'ClaudeBot',
    'PerplexityBot',
    'Google-Extended',
  ]
  const blocks = agents.map((a) => `User-agent: ${a}\nAllow: /`)
  return `${blocks.join('\n\n')}\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n`
}

export function buildLlmsTxt(input: {
  site: URL
  profile: LlmsProfile
  pages: { title: string; path: string; summary: string }[]
}): string {
  const { site, profile, pages } = input
  const pageLines = pages.map(
    (p) => `- [${p.title}](${new URL(p.path, site).href}): ${p.summary}`,
  )
  const profiles = [
    ['LinkedIn', profile.links.linkedin],
    ['Upwork', profile.links.upwork],
    ['OnlineJobs.ph', profile.links.onlinejobs],
  ].map(([label, href]) => `- [${label}](${href})`)
  return (
    [
      '# Kyla Belas',
      `> ${profile.intro}`,
      `## Pages\n\n${pageLines.join('\n')}`,
      `## Profiles\n\n${profiles.join('\n')}`,
      `## Contact\n\n- Email: ${profile.email}`,
    ].join('\n\n') + '\n'
  )
}

type LlmsPage = { title: string; path: string; summary: string }

const firstSentence = (text: string) =>
  text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text

/** The page list for llms.txt, with every count and phrase taken from content. */
export function llmsPages(input: {
  title: string
  recordingsIntro: string
  counts: Record<Category | 'all', number>
  recordings: { title: string; featured: boolean }[]
}): LlmsPage[] {
  const { title, recordingsIntro, counts, recordings } = input
  const featured = recordings.find((r) => r.featured)
  const calls = recordings.length - (featured ? 1 : 0)
  const callsText = `${calls} call recording${calls === 1 ? '' : 's'}`
  const featuredText = featured ? ` plus a ${featured.title.toLowerCase()}` : ''
  return [
    {
      title: 'Home',
      path: '/',
      summary: `${title}. Experience, reviews, tools and contact.`,
    },
    {
      title: 'Portfolio',
      path: '/work/',
      summary: `All ${counts.all} pieces of work. Each category has its own page, listed below.`,
    },
    ...(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(
      ([key, label]) => ({
        title: label,
        path: `/work/${key}/`,
        summary: `${counts[key]} ${label} pieces.`,
      }),
    ),
    {
      title: 'Call recordings',
      path: '/calls/',
      summary: `${callsText}${featuredText}. ${firstSentence(recordingsIntro)}`,
    },
  ]
}
