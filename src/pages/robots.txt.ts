import type { APIRoute } from 'astro'
import { buildRobotsTxt } from '../lib/llms'

export const GET: APIRoute = ({ site }) =>
  new Response(buildRobotsTxt(site!), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
