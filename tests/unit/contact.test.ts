// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest'
import { buildMailto } from '../../src/lib/mailto'
import { submitContact } from '../../src/scripts/contact'

const TO = 'kylabelasss@gmail.com'

function makeForm(over: Record<string, string> = {}) {
  const v = {
    name: 'Ann Lee',
    email: 'ann@x.com',
    company: 'Acme',
    message: 'Hi there, quick question',
    _gotcha: '',
    ...over,
  }
  const form = document.createElement('form')
  form.innerHTML = `
    <input name="name" required value="${v.name}">
    <input name="email" type="email" required value="${v.email}">
    <input name="company" value="${v.company}">
    <textarea name="message" required minlength="10">${v.message}</textarea>
    <input name="_gotcha" value="${v._gotcha}">`
  document.body.append(form)
  return form
}

const deps = (over = {}) => ({
  fetch: vi.fn(async () => new Response('{"ok":true}', { status: 200 })),
  formspreeId: 'abc',
  to: TO,
  navigate: vi.fn(),
  ...over,
})

test('buildMailto', () =>
  expect(
    buildMailto(
      {
        name: 'Ann Lee',
        email: 'ann@x.com',
        company: 'Acme',
        message: 'Hi there, quick question',
      },
      TO,
    ),
  ).toBe(
    'mailto:kylabelasss@gmail.com?subject=Portfolio%20inquiry%20from%20Ann%20Lee%20(Acme)&body=Hi%20there%2C%20quick%20question%0A%0AAnn%20Lee%0Aann%40x.com',
  ))

describe('submitContact', () => {
  test('honeypot filled returns spam and sends nothing', async () => {
    const d = deps()
    expect(await submitContact(makeForm({ _gotcha: 'bot' }), d)).toBe('spam')
    expect(d.fetch).not.toHaveBeenCalled()
    expect(d.navigate).not.toHaveBeenCalled()
  })

  test('an invalid form returns invalid and sends nothing', async () => {
    const d = deps()
    expect(await submitContact(makeForm({ name: '' }), d)).toBe('invalid')
    expect(d.fetch).not.toHaveBeenCalled()
  })

  test('posts JSON with Accept application/json and returns sent on 200', async () => {
    const d = deps()
    expect(await submitContact(makeForm(), d)).toBe('sent')
    expect(d.fetch).toHaveBeenCalledTimes(1)
    const [url, init] = d.fetch.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toBe('https://formspree.io/f/abc')
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>).Accept).toBe(
      'application/json',
    )
    expect(JSON.parse(init.body as string)).toEqual({
      name: 'Ann Lee',
      email: 'ann@x.com',
      company: 'Acme',
      message: 'Hi there, quick question',
    })
  })

  test('returns error on 429 and on network failure', async () => {
    const r429 = deps({
      fetch: vi.fn(async () => new Response('{}', { status: 429 })),
    })
    expect(await submitContact(makeForm(), r429)).toBe('error')
    const down = deps({
      fetch: vi.fn(async () => {
        throw new TypeError('offline')
      }),
    })
    expect(await submitContact(makeForm(), down)).toBe('error')
  })

  test('a second submit while sending is ignored', async () => {
    let release!: () => void
    const d = deps({
      fetch: vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            release = () => resolve(new Response('{}', { status: 200 }))
          }),
      ),
    })
    const form = makeForm()
    const first = submitContact(form, d)
    const second = submitContact(form, d)
    release()
    expect(await first).toBe('sent')
    expect(await second).toBe('sent')
    expect(d.fetch).toHaveBeenCalledTimes(1)
  })

  test('empty formspreeId navigates to the mailto URL', async () => {
    const d = deps({ formspreeId: '' })
    expect(await submitContact(makeForm(), d)).toBe('mailto')
    expect(d.fetch).not.toHaveBeenCalled()
    expect(d.navigate).toHaveBeenCalledWith(
      buildMailto(
        {
          name: 'Ann Lee',
          email: 'ann@x.com',
          company: 'Acme',
          message: 'Hi there, quick question',
        },
        TO,
      ),
    )
  })
})
