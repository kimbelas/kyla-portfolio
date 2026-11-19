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
