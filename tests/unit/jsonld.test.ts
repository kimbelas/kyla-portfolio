import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'
import { parse } from 'yaml'
import { profileSchema } from '../../src/content/schemas'
import {
  audioObjectSchema,
  breadcrumbSchema,
  faqPageSchema,
  itemListSchema,
  personSchema,
  profilePageSchema,
  serializeJsonLd,
  websiteSchema,
} from '../../src/lib/jsonld'

const site = new URL('https://example.com')
const profile = profileSchema.parse(
  parse(
    readFileSync(
      resolve(import.meta.dirname, '../../src/content/profile.yaml'),
      'utf8',
    ),
  )[0],
)

test('person schema', () => {
  const p = personSchema(profile, site, 'https://example.com/kyla.jpg')
  expect(p).toMatchObject({
    '@type': 'Person',
    '@id': 'https://example.com/#kyla',
    name: 'Kyla Belas',
    image: 'https://example.com/kyla.jpg',
    email: `mailto:${profile.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Pampanga',
      addressCountry: 'PH',
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Holy Angel University',
    },
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'degree',
      name: profile.education.degree,
    },
    knowsAbout: [...profile.skills, ...profile.niches],
    sameAs: [
      profile.links.linkedin,
      profile.links.upwork,
      profile.links.onlinejobs,
    ],
  })
})

test('website and profile page reference the person', () => {
  expect(websiteSchema(site)).toMatchObject({
    '@type': 'WebSite',
    url: 'https://example.com/',
  })
  expect(profilePageSchema(site)).toMatchObject({
    '@type': 'ProfilePage',
    mainEntity: { '@id': 'https://example.com/#kyla' },
  })
})

test('audio object', () => {
  expect(
    audioObjectSchema(
      {
        id: 'self-introduction',
        title: 'Self introduction',
        file: 'self-introduction.mp3',
        durationSec: 102,
      },
      site,
    ),
  ).toMatchObject({
    '@type': 'AudioObject',
    name: 'Self introduction',
    inLanguage: 'en',
    contentUrl: 'https://example.com/audio/self-introduction.mp3',
    duration: 'PT1M42S',
    encodingFormat: 'audio/mpeg',
    creator: { '@id': 'https://example.com/#kyla' },
  })
})

test('audio object includes transcript only when present', () => {
  const base = { id: 'a', title: 'A', file: 'a.mp3', durationSec: 5 }
  expect(audioObjectSchema(base, site)).not.toHaveProperty('transcript')
  expect(
    audioObjectSchema({ ...base, transcript: 'hello' }, site),
  ).toMatchObject({
    transcript: 'hello',
  })
})

test('itemListSchema lists images with positions', () => {
  const l = itemListSchema(
    [
      { name: 'One', imageUrl: 'https://example.com/1.jpg' },
      { name: 'Two', imageUrl: 'https://example.com/2.jpg' },
    ],
    site,
    '/work/',
  )
  expect(l).toMatchObject({
    '@type': 'ItemList',
    url: 'https://example.com/work/',
  })
  expect(l.itemListElement[1]).toMatchObject({
    '@type': 'ListItem',
    position: 2,
    item: {
      '@type': 'ImageObject',
      name: 'Two',
      contentUrl: 'https://example.com/2.jpg',
    },
  })
})

test('serializeJsonLd escapes markup-breaking characters', () => {
  const out = serializeJsonLd({ q: '</script><b>"&\u2028\u2029' })
  expect(out).not.toContain('</script>')
  expect(out).toContain('\\u003c/script\\u003e')
  expect(out).toContain('\\u0026')
  expect(out).toContain('\\u2028')
  expect(out).toContain('\\u2029')
  expect(JSON.parse(out)).toEqual({ q: '</script><b>"&\u2028\u2029' })
})

test('faqPageSchema maps question and answer', () => {
  expect(faqPageSchema([{ question: 'Why?', answer: 'Because.' }])).toEqual({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Why?',
        acceptedAnswer: { '@type': 'Answer', text: 'Because.' },
      },
    ],
  })
})

test('breadcrumbSchema positions start at 1 with absolute URLs', () => {
  const b = breadcrumbSchema(
    [
      { name: 'Home', path: '/' },
      { name: 'Portfolio', path: '/work/' },
    ],
    site,
  )
  expect(b.itemListElement).toEqual([
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://example.com/',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Portfolio',
      item: 'https://example.com/work/',
    },
  ])
})
