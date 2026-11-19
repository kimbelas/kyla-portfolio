export type Category = 'architecture' | 'construction' | 'marketing' | 'growth'

export const CATEGORY_LABELS: Record<Category, string> = {
  architecture: 'Architecture',
  construction: '2A Construction',
  marketing: 'Marketing',
  growth: 'Business records',
}

export function categoryCounts(
  items: { category: Category }[],
): Record<Category | 'all', number> {
  const counts: Record<Category | 'all', number> = {
    all: items.length,
    marketing: 0,
    construction: 0,
    growth: 0,
    architecture: 0,
  }
  for (const item of items) counts[item.category] += 1
  return counts
}

export function orderRecordings<T extends { featured: boolean }>(
  items: T[],
): T[] {
  return [
    ...items.filter((i) => i.featured),
    ...items.filter((i) => !i.featured),
  ]
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function isoDuration(sec: number): string {
  return `PT${Math.floor(sec / 60)}M${sec % 60}S`
}

export function homePortfolio<T extends { homeOrder?: number }>(
  items: T[],
): T[] {
  return items
    .filter((i): i is T & { homeOrder: number } => i.homeOrder !== undefined)
    .sort((a, b) => a.homeOrder - b.homeOrder)
    .slice(0, 9)
}

const MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')

/** Sort key for a period string: the latest "Mon YYYY" or "YYYY" it mentions. */
function latestMonth(period: string): number {
  let best = 0
  for (const m of period.matchAll(
    /(?:\b([A-Z][a-z]{2}) )?\b((?:19|20)\d{2})\b/g,
  )) {
    const month = m[1] ? MONTHS.indexOf(m[1]) : 11
    best = Math.max(best, Number(m[2]) * 12 + Math.max(month, 0))
  }
  return best
}

export function orderExperience<T extends { period: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => latestMonth(b.period) - latestMonth(a.period),
  )
}
