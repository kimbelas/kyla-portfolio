import type { APIRoute } from 'astro'
import { getCollection, getEntry } from 'astro:content'
import { CATEGORY_LABELS, categoryCounts } from '../lib/collections'
import { buildLlmsTxt } from '../lib/llms'

export const GET: APIRoute = async ({ site }) => {
  const profile = (await getEntry('profile', 'kyla'))!.data
  const counts = categoryCounts(
    (await getCollection('portfolio')).map((p) => p.data),
  )
  const recordings = (await getCollection('recordings')).length
  const pages = [
    {
      title: 'Home',
      path: '/',
      summary: `${profile.title}: experience, reviews, tools and contact.`,
    },
    {
      title: 'Portfolio',
      path: '/work/',
      summary: `All ${counts.all} pieces of work, filterable by category.`,
    },
    ...Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
      title: label,
      path: `/work/${key}/`,
      summary: `${counts[key as keyof typeof CATEGORY_LABELS]} ${label} pieces.`,
    })),
    {
      title: 'Call recordings',
      path: '/calls/',
      summary: `${recordings} real call recordings with homeowners, sellers and agents.`,
    },
  ]
  return new Response(buildLlmsTxt({ site: site!, profile, pages }), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
