import { readFileSync } from 'node:fs'
import { parse } from 'yaml'

/**
 * Reads a content collection straight from its YAML file, so e2e expectations are
 * derived from the data and stay green when entries are added or approved.
 */
export const loadContent = <T>(name: string): T[] =>
  parse(readFileSync(`src/content/${name}.yaml`, 'utf8')) as T[]

export const portfolio = loadContent<{
  title: string
  category: string
  homeOrder?: number
}>('portfolio')

export const recordings = loadContent<{
  id: string
  title: string
  group: string
  file: string
  featured?: boolean
}>('recordings')

export const reviews = loadContent<{ id: string }>('reviews')

export const faq = loadContent<{ question: string; approved: boolean }>('faq')

export const experience = loadContent<{ id: string }>('experience')

export const clients = loadContent<{ id: string }>('clients')

export const countIn = (category: string) =>
  portfolio.filter((p) => p.category === category).length
