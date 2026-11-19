import type { APIRoute } from 'astro'
import { getCollection, getEntry } from 'astro:content'
import { categoryCounts } from '../lib/collections'
import { buildLlmsTxt, llmsPages } from '../lib/llms'

export const GET: APIRoute = async ({ site }) => {
  const profile = (await getEntry('profile', 'kyla'))!.data
  const pages = llmsPages({
    title: profile.title,
    recordingsIntro: profile.recordingsIntro.intro,
    counts: categoryCounts(
      (await getCollection('portfolio')).map((p) => p.data),
    ),
    recordings: (await getCollection('recordings')).map((r) => r.data),
  })
  return new Response(buildLlmsTxt({ site: site!, profile, pages }), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
