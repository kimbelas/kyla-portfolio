import type { z } from 'astro/zod'
import type { profileSchema, recordingSchema } from '../content/schemas'
import { isoDuration } from './collections'

type Profile = z.infer<typeof profileSchema>
type Recording = Pick<
  z.infer<typeof recordingSchema>,
  'id' | 'title' | 'file' | 'durationSec' | 'summary' | 'transcript'
>

const CONTEXT = 'https://schema.org'
const personId = (site: URL) => `${new URL('/', site).href}#kyla`
const abs = (path: string, site: URL) => new URL(path, site).href

export function personSchema(profile: Profile, site: URL, imageUrl: string) {
  return {
    '@context': CONTEXT,
    '@type': 'Person',
    '@id': personId(site),
    name: profile.name,
    jobTitle: profile.title,
    url: abs('/', site),
    image: imageUrl,
    email: `mailto:${profile.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.location.locality,
      addressRegion: profile.location.region,
      addressCountry: profile.location.country,
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: profile.education.school,
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
  }
}

export function websiteSchema(site: URL) {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    name: 'Kyla Belas',
    url: abs('/', site),
    inLanguage: 'en',
    publisher: { '@id': personId(site) },
  }
}

export function profilePageSchema(site: URL) {
  return {
    '@context': CONTEXT,
    '@type': 'ProfilePage',
    url: abs('/', site),
    mainEntity: { '@id': personId(site) },
  }
}

export function audioObjectSchema(rec: Recording, site: URL) {
  return {
    '@context': CONTEXT,
    '@type': 'AudioObject',
    name: rec.title,
    ...(rec.summary ? { description: rec.summary } : {}),
    contentUrl: abs(`/audio/${rec.file}`, site),
    duration: isoDuration(rec.durationSec),
    encodingFormat: 'audio/mpeg',
    inLanguage: 'en',
    creator: { '@id': personId(site) },
    ...(rec.transcript ? { transcript: rec.transcript } : {}),
  }
}

export function itemListSchema(
  items: { name: string; imageUrl: string }[],
  site: URL,
  path: string,
) {
  return {
    '@context': CONTEXT,
    '@type': 'ItemList',
    url: abs(path, site),
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'ImageObject',
        name: item.name,
        contentUrl: item.imageUrl,
        creator: { '@id': personId(site) },
      },
    })),
  }
}

export function breadcrumbSchema(
  trail: { name: string; path: string }[],
  site: URL,
) {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: abs(crumb.path, site),
    })),
  }
}

export function faqPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': CONTEXT,
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

/** FAQPage JSON-LD for the approved entries, or nothing when none is approved. */
export function faqJsonLd(
  faqs: { question: string; answer: string; approved: boolean }[],
) {
  const approved = faqs.filter((f) => f.approved)
  return approved.length > 0 ? [faqPageSchema(approved)] : []
}

const ESCAPES: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (c) => ESCAPES[c])
}
