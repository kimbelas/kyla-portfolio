import { z } from 'astro/zod'

const id = z.string().min(1)

export const profileSchema = z.object({
  id,
  name: z.string(),
  firstName: z.string(),
  title: z.string(),
  location: z.object({
    locality: z.string(),
    region: z.string(),
    country: z.string(),
  }),
  email: z.string().email(),
  eyebrow: z.string(),
  headline: z.object({ lead: z.string(), emphasis: z.string() }),
  rotating: z.array(z.string()).length(6),
  intro: z.string(),
  badges: z.array(z.object({ label: z.string(), sub: z.string() })),
  education: z.object({
    degree: z.string(),
    school: z.string(),
    years: z.string(),
  }),
  about: z.object({
    heading: z.string(),
    paragraphs: z.array(z.string()).min(1),
  }),
  pullQuote: z.string(),
  journey: z.array(z.object({ year: z.string(), text: z.string() })),
  stats: z.array(z.object({ value: z.string(), label: z.string() })).length(4),
  niches: z.array(z.string()),
  skills: z.array(z.string()),
  tools: z.array(
    z.object({
      group: z.string(),
      items: z.array(
        z.object({ name: z.string(), note: z.string().optional() }),
      ),
    }),
  ),
  recordingsIntro: z.object({ heading: z.string(), intro: z.string() }),
  growth: z.object({ heading: z.string(), note: z.string() }),
  moreWork: z.array(
    z.object({ label: z.string(), sub: z.string(), href: z.string().url() }),
  ),
  contact: z.object({ heading: z.string(), text: z.string() }),
  links: z.object({
    linkedin: z.string().url(),
    upwork: z.string().url(),
    onlinejobs: z.string().url(),
    drive: z.string().url(),
    recordings: z.string().url(),
    videos: z.string().url(),
    socialImages: z.string().url(),
    reviews: z.string().url(),
  }),
  upwork: z.object({ job: z.string(), rating: z.number(), period: z.string() }),
})

export const metricSchema = z.object({
  id,
  label: z.string(),
  before: z.number(),
  after: z.number(),
  prefix: z.string().default(''),
  suffix: z.string().default(''),
  decimals: z.number().int().min(0).default(0),
})

export const expertiseSchema = z.object({
  id,
  title: z.string(),
  summary: z.string(),
  points: z.array(z.string()).min(1),
})

export const experienceSchema = z.object({
  id,
  role: z.string(),
  company: z.string(),
  place: z.string(),
  period: z.string(),
  industry: z.string(),
  highlights: z.array(z.string()).min(1),
})

export const clientSchema = z.object({
  id,
  name: z.string(),
  place: z.string(),
  role: z.string(),
  work: z.string(),
})

export const recordingSchema = z.object({
  id,
  title: z.string(),
  group: z.enum([
    'Introduction',
    'Construction',
    'Appointment setting',
    'Cold calling',
    'Real estate',
  ]),
  file: z.string().regex(/^[a-z0-9-]+\.mp3$/),
  durationSec: z.number().int().positive(),
  featured: z.boolean().default(false),
  note: z.string().optional(),
  summary: z.string().optional(),
  transcript: z.string().optional(),
})

export const portfolioSchema = <I extends z.ZodType>(image: () => I) =>
  z.object({
    id,
    title: z.string(),
    category: z.enum(['marketing', 'construction', 'growth', 'architecture']),
    tag: z.string(),
    image: image(),
    alt: z.string().min(10),
    homeOrder: z.number().int().min(1).max(9).optional(),
  })

export const reviewSchema = <I extends z.ZodType>(image: () => I) =>
  z
    .object({
      id,
      title: z.string(),
      image: image(),
      source: z.enum(['google', 'customer', 'client', 'upwork']),
      quote: z.string().optional(),
      excerpt: z.string().optional(),
      name: z.string().optional(),
      context: z.string().optional(),
      stars: z.number().int().min(1).max(5).optional(),
      home: z.enum(['feature', 'card']).optional(),
    })
    .superRefine((r, ctx) => {
      if (r.home && !(r.quote && r.name && r.context)) {
        ctx.addIssue({
          code: 'custom',
          message: 'home reviews need quote, name and context',
          path: ['home'],
        })
      }
      if (r.excerpt && !(r.quote && r.quote.includes(r.excerpt))) {
        ctx.addIssue({
          code: 'custom',
          message: 'excerpt must be a substring of quote',
          path: ['excerpt'],
        })
      }
    })

export const faqSchema = z.object({
  id,
  question: z.string().endsWith('?'),
  answer: z.string(),
  approved: z.boolean(),
})
