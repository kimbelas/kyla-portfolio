import { describe, expect, test } from 'vitest'
import {
  categoryCounts,
  formatDuration,
  homePortfolio,
  isoDuration,
  orderRecordings,
  CATEGORY_LABELS,
} from '../../src/lib/collections'

describe('collections helpers', () => {
  test('formatDuration', () => {
    expect(formatDuration(102)).toBe('1:42')
    expect(formatDuration(63)).toBe('1:03')
    expect(formatDuration(631)).toBe('10:31')
  })

  test('isoDuration', () => {
    expect(isoDuration(102)).toBe('PT1M42S')
    expect(isoDuration(60)).toBe('PT1M0S')
  })

  test('orderRecordings puts featured first, keeps file order otherwise', () => {
    const items = [
      { id: 'a', featured: false },
      { id: 'b', featured: false },
      { id: 'c', featured: true },
      { id: 'd', featured: false },
    ]
    expect(orderRecordings(items).map((i) => i.id)).toEqual([
      'c',
      'a',
      'b',
      'd',
    ])
  })

  test('homePortfolio returns items with homeOrder sorted ascending, max 9', () => {
    const items = [
      { id: 'x' },
      { id: 'b', homeOrder: 2 },
      { id: 'a', homeOrder: 1 },
      ...Array.from({ length: 9 }, (_, i) => ({
        id: `n${i}`,
        homeOrder: i + 3,
      })),
    ]
    const out = homePortfolio(items)
    expect(out).toHaveLength(9)
    expect(out.slice(0, 3).map((i) => i.id)).toEqual(['a', 'b', 'n0'])
    expect(out.every((i) => i.id !== 'x')).toBe(true)
  })

  test('categoryCounts counts every category plus all', () => {
    expect(
      categoryCounts([
        { category: 'marketing' },
        { category: 'marketing' },
        { category: 'growth' },
      ]),
    ).toEqual({
      all: 3,
      marketing: 2,
      construction: 0,
      growth: 1,
      architecture: 0,
    })
  })

  test('CATEGORY_LABELS', () => {
    expect(CATEGORY_LABELS).toEqual({
      architecture: 'Architecture',
      construction: '2A Construction',
      marketing: 'Marketing',
      growth: 'Business records',
    })
  })
})
