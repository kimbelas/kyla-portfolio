import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import { parse } from 'yaml'
import { z } from 'astro/zod'
import {
  clientSchema,
  experienceSchema,
  expertiseSchema,
  faqSchema,
  metricSchema,
  portfolioSchema,
  profileSchema,
  recordingSchema,
  reviewSchema,
} from '../../src/content/schemas'
import { categoryCounts } from '../../src/lib/collections'

const root = resolve(import.meta.dirname, '../..')
const contentDir = join(root, 'src/content')
const image = () => z.string()

const load = (name: string): unknown[] =>
  parse(readFileSync(join(contentDir, `${name}.yaml`), 'utf8'))
const check = <T extends z.ZodType>(name: string, schema: T): z.infer<T>[] =>
  load(name).map((row) => schema.parse(row))

const profile = check('profile', profileSchema)
const metrics = check('metrics', metricSchema)
const expertise = check('expertise', expertiseSchema)
const experience = check('experience', experienceSchema)
const clients = check('clients', clientSchema)
const recordings = check('recordings', recordingSchema)
const portfolio = check('portfolio', portfolioSchema(image))
const reviews = check('reviews', reviewSchema(image))
const faq = check('faq', faqSchema)

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) =>
    statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)],
  )

const imageExists = (yamlRel: string) =>
  existsSync(resolve(contentDir, yamlRel))
const quoteOf = (id: string) => reviews.find((r) => r.id === id)?.quote ?? ''

describe('content integrity', () => {
  test('profile is a single entry with required facts', () => {
    expect(profile).toHaveLength(1)
    expect(profile[0].id).toBe('kyla')
    expect(profile[0].stats.map((s) => s.value)).toEqual([
      '6+',
      '10.29%',
      '5-12',
      '20%',
    ])
    expect(profile[0].rotating).toHaveLength(6)
    expect(profile[0].moreWork).toHaveLength(3)
    expect(profile[0].contact.heading).toBeTruthy()
  })

  test('metrics, expertise, experience and clients are populated', () => {
    for (const list of [metrics, expertise, experience, clients])
      expect(list.length).toBeGreaterThan(0)
  })

  test('portfolio category counts add up to the whole collection', () => {
    const { all, ...byCategory } = categoryCounts(portfolio)
    expect(all).toBe(portfolio.length)
    expect(all).toBeGreaterThan(0)
    expect(Object.values(byCategory).reduce((a, b) => a + b, 0)).toBe(all)
  })

  test('exactly one featured recording: self-introduction, note Recorded early 2025', () => {
    const featured = recordings.filter((r) => r.featured)
    expect(featured).toHaveLength(1)
    expect(featured[0].id).toBe('self-introduction')
    expect(featured[0].note).toBe('Recorded early 2025')
    expect(featured[0].durationSec).toBe(102)
  })

  test('no recording has an id or title matching /contenu/i', () => {
    expect(recordings.length).toBeGreaterThan(1)
    for (const r of recordings) {
      expect(r.id).not.toMatch(/contenu/i)
      expect(r.title).not.toMatch(/contenu/i)
    }
  })

  test('every recording file exists in public/audio', () => {
    for (const r of recordings)
      expect(existsSync(join(root, 'public/audio', r.file)), r.file).toBe(true)
  })

  test('every portfolio and review image exists under src/assets/images', () => {
    for (const p of portfolio) {
      expect(p.image).toMatch(/^\.\.\/assets\/images\//)
      expect(imageExists(p.image), p.image).toBe(true)
    }
    for (const r of reviews) {
      expect(r.image).toMatch(/^\.\.\/assets\/images\//)
      expect(imageExists(r.image), r.image).toBe(true)
    }
  })

  test('home has 1 feature (Tracy Scuteri) and 3 cards (Mayra J., Agency lead, Josie A.)', () => {
    expect(
      reviews.filter((r) => r.home === 'feature').map((r) => r.name),
    ).toEqual(['Tracy Scuteri'])
    expect(
      reviews
        .filter((r) => r.home === 'card')
        .map((r) => r.name)
        .sort(),
    ).toEqual(['Agency lead', 'Josie A.', 'Mayra J.'])
  })

  test('faq entries carry an explicit approved flag', () => {
    for (const f of faq) expect(typeof f.approved).toBe('boolean')
  })

  test('ids are unique within each collection', () => {
    for (const name of [
      'profile',
      'metrics',
      'expertise',
      'experience',
      'clients',
      'recordings',
      'portfolio',
      'reviews',
      'faq',
    ]) {
      const ids = (load(name) as { id: string }[]).map((r) => r.id)
      expect(new Set(ids).size, name).toBe(ids.length)
    }
  })

  test('no en or em dash anywhere in src/content', () => {
    const allYamlText = walk(contentDir)
      .map((f) => readFileSync(f, 'utf8'))
      .join('\n')
    expect(allYamlText).not.toMatch(
      new RegExp(
        `[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`,
      ),
    )
  })

  test('quotes are verbatim', () => {
    expect(quoteOf('sanjeshni')).toContain(
      'A special thank you to Kayla, who was our main point of contact',
    )
    expect(quoteOf('tracy')).toBe(
      'I had the exterior of my home painted to include the trim, gutters and door stained. The job was done efficiently and professionally. I made a couple changes mid-way and they adapted nicely. Art and Kyla are a pleasure to work with.',
    )
  })

  test('portfolio homeOrder values are unique positions from 1 to 9', () => {
    const orders = portfolio
      .filter((p) => p.homeOrder !== undefined)
      .map((p) => p.homeOrder as number)
    expect(orders.length).toBeGreaterThan(0)
    expect(new Set(orders).size).toBe(orders.length)
    for (const o of orders) expect(o >= 1 && o <= 9, String(o)).toBe(true)
  })
})

describe('schema refinements', () => {
  const base = { id: 'r', title: 't', image: 'x', source: 'google' as const }
  test('home requires quote, name, context', () => {
    expect(
      reviewSchema(image).safeParse({ ...base, home: 'card' }).success,
    ).toBe(false)
    expect(
      reviewSchema(image).safeParse({
        ...base,
        home: 'card',
        quote: 'q',
        name: 'n',
        context: 'c',
      }).success,
    ).toBe(true)
  })
  test('excerpt must be a substring of quote', () => {
    expect(
      reviewSchema(image).safeParse({
        ...base,
        quote: 'hello world',
        excerpt: 'lo wor',
      }).success,
    ).toBe(true)
    expect(
      reviewSchema(image).safeParse({
        ...base,
        quote: 'hello world',
        excerpt: 'nope',
      }).success,
    ).toBe(false)
  })
  test('faq question must end with ?', () => {
    expect(
      faqSchema.safeParse({
        id: 'a',
        question: 'Hi',
        answer: 'x',
        approved: false,
      }).success,
    ).toBe(false)
  })
})
