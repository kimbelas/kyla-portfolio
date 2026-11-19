import { describe, expect, test } from 'vitest'
import {
  categoryCounts,
  formatDuration,
  homePortfolio,
  isoDuration,
  orderExperience,
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

describe('orderExperience', () => {
  test('sorts newest first by the latest date in each period', () => {
    const periods = [
      '2014 - 2018',
      'Jan 2024 - Aug 2024',
      'Aug 2024 - Mar 2025 · Jul 2025 - Sep 2026',
      'Jun 2023 - Jan 2024',
      '2018 & 2019 summer terms',
    ]
    expect(
      orderExperience(periods.map((period) => ({ period }))).map(
        (r) => r.period,
      ),
    ).toEqual([
      'Aug 2024 - Mar 2025 · Jul 2025 - Sep 2026',
      'Jan 2024 - Aug 2024',
      'Jun 2023 - Jan 2024',
      '2018 & 2019 summer terms',
      '2014 - 2018',
    ])
  })
})
