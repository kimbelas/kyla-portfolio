import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { resolveSite } from '../../scripts/site-url.mjs'

const emptyDir = () => mkdtempSync(join(tmpdir(), 'site-url-'))
const dirWithEnv = (text: string) => {
  const dir = emptyDir()
  writeFileSync(join(dir, '.env'), text)
  return dir
}

describe('resolveSite', () => {
  // Vite's loader also reads process.env, so keep an outer SITE_URL (CI) out.
  const outer = process.env.SITE_URL
  beforeEach(() => {
    delete process.env.SITE_URL
  })
  afterEach(() => {
    if (outer !== undefined) process.env.SITE_URL = outer
  })

  test('a build without SITE_URL throws', () => {
    expect(() =>
      resolveSite({ command: 'build', env: {}, root: emptyDir() }),
    ).toThrow('SITE_URL is required for builds')
  })

  test('a build uses SITE_URL from the environment', () => {
    expect(
      resolveSite({
        command: 'build',
        env: { SITE_URL: 'https://example.com/' },
        root: emptyDir(),
      }),
    ).toBe('https://example.com/')
  })

  test('a build reads SITE_URL from .env', () => {
    expect(
      resolveSite({
        command: 'build',
        env: {},
        root: dirWithEnv('SITE_URL=https://from-dotenv.example/\n'),
      }),
    ).toBe('https://from-dotenv.example/')
  })

  test('the dev server reads .env', () => {
    expect(
      resolveSite({
        command: 'dev',
        env: {},
        root: dirWithEnv('SITE_URL=https://from-dotenv.example/\n'),
      }),
    ).toBe('https://from-dotenv.example/')
  })

  test('the dev server falls back to localhost without SITE_URL', () => {
    expect(resolveSite({ command: 'dev', env: {}, root: emptyDir() })).toBe(
      'http://localhost:4321',
    )
    expect(
      resolveSite({
        command: 'dev',
        env: {},
        root: dirWithEnv('SITE_URL=\n'),
      }),
    ).toBe('http://localhost:4321')
  })

  test('the environment wins over .env', () => {
    expect(
      resolveSite({
        command: 'dev',
        env: { SITE_URL: 'https://env.example/' },
        root: dirWithEnv('SITE_URL=https://from-dotenv.example/\n'),
      }),
    ).toBe('https://env.example/')
  })
})
