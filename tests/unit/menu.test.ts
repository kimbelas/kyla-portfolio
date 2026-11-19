// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { initMenu } from '../../src/scripts/menu'
import { initActiveSection } from '../../src/scripts/active-section'

class FakeMql {
  matches = false
  private listeners: ((e: { matches: boolean }) => void)[] = []
  addEventListener(_t: string, fn: (e: { matches: boolean }) => void) {
    this.listeners.push(fn)
  }
  removeEventListener(_t: string, fn: (e: { matches: boolean }) => void) {
    this.listeners = this.listeners.filter((l) => l !== fn)
  }
  dispatch(matches: boolean) {
    this.matches = matches
    for (const l of this.listeners) l({ matches })
  }
}

let root: HTMLDetailsElement
let toggle: HTMLElement
let mq: FakeMql
let dispose: () => void

beforeEach(() => {
  document.body.innerHTML = `
    <details data-menu>
      <summary data-menu-toggle aria-label="Menu">toggle</summary>
      <div data-menu-card>
        <a href="#about" id="first">About</a>
        <a href="#calls">Calls</a>
        <a href="/#contact" id="last">Let's talk</a>
      </div>
    </details>`
  root = document.querySelector('details')!
  toggle = root.querySelector('summary')!
  mq = new FakeMql()
  dispose = initMenu(root, mq as unknown as MediaQueryList)
})

afterEach(() => {
  dispose()
  document.documentElement.removeAttribute('data-menu-open')
})

const open = () => toggle.click()

describe('initMenu', () => {
  test('toggle opens: aria-expanded true, card visible, first link focused, html[data-menu-open]', () => {
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    open()
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(toggle.getAttribute('aria-label')).toBe('Close menu')
    expect(root.open).toBe(true)
    expect(document.activeElement).toBe(document.getElementById('first'))
    expect(document.documentElement.hasAttribute('data-menu-open')).toBe(true)
  })

  test('toggle closes when open', () => {
    open()
    open()
    expect(root.open).toBe(false)
    expect(toggle.getAttribute('aria-label')).toBe('Open menu')
  })

  test('Escape closes and returns focus to the toggle', () => {
    open()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(root.open).toBe(false)
    expect(document.activeElement).toBe(toggle)
    expect(document.documentElement.hasAttribute('data-menu-open')).toBe(false)
  })

  test('clicking a menu link closes the menu', () => {
    open()
    document
      .getElementById('last')!
      .addEventListener('click', (e) => e.preventDefault())
    document.getElementById('last')!.click()
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(document.documentElement.hasAttribute('data-menu-open')).toBe(false)
  })

  test('clicking the play control closes the menu and returns focus to the toggle', () => {
    const play = document.createElement('a')
    play.href = '/#calls'
    play.setAttribute('data-play-featured', '')
    play.addEventListener('click', (e) => e.preventDefault())
    document.querySelector('[data-menu-card]')!.append(play)
    open()
    play.focus()
    play.click()
    expect(root.open).toBe(false)
    expect(document.activeElement).toBe(toggle)
  })

  test('Tab from the last item wraps to the close button', () => {
    open()
    const last = document.getElementById('last')!
    last.focus()
    const ev = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true })
    document.dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(toggle)
  })

  test('Shift+Tab from the close button wraps to the last item', () => {
    open()
    toggle.focus()
    const ev = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      cancelable: true,
    })
    document.dispatchEvent(ev)
    expect(document.activeElement).toBe(document.getElementById('last'))
  })

  test('closes when viewport becomes desktop', () => {
    open()
    mq.dispatch(true)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(document.documentElement.hasAttribute('data-menu-open')).toBe(false)
  })

  test('keydown does nothing while closed', () => {
    const ev = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true })
    document.dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(false)
  })
})

describe('initActiveSection', () => {
  let observe: ReturnType<typeof vi.fn>
  let trigger: (entries: Partial<IntersectionObserverEntry>[]) => void
  let options: IntersectionObserverInit | undefined

  beforeEach(() => {
    observe = vi.fn()
    class FakeIO {
      constructor(
        cb: (e: Partial<IntersectionObserverEntry>[]) => void,
        opts?: IntersectionObserverInit,
      ) {
        trigger = cb
        options = opts
      }
      observe = observe
      disconnect = vi.fn()
    }
    vi.stubGlobal('IntersectionObserver', FakeIO)
  })
  afterEach(() => vi.unstubAllGlobals())

  test('aria-current moves to the intersecting section link', () => {
    document.body.innerHTML = `
      <a id="l1" href="#about">About</a>
      <a id="l2" href="/#calls">Calls</a>
      <section id="about"></section><section id="calls"></section>`
    const links = [...document.querySelectorAll('a')] as HTMLAnchorElement[]
    initActiveSection(links)
    expect(options?.rootMargin).toBe('-45% 0px -50% 0px')
    expect(observe).toHaveBeenCalledTimes(2)
    trigger([
      { target: document.getElementById('about')!, isIntersecting: true },
    ])
    expect(links[0].getAttribute('aria-current')).toBe('true')
    expect(links[1].hasAttribute('aria-current')).toBe(false)
    trigger([
      { target: document.getElementById('calls')!, isIntersecting: true },
    ])
    expect(links[0].hasAttribute('aria-current')).toBe(false)
    expect(links[1].getAttribute('aria-current')).toBe('true')
  })
})

describe('initMenu with another Escape consumer', () => {
  test('Escape already handled (defaultPrevented) does not close the menu', () => {
    open()
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        cancelable: true,
        bubbles: true,
      }),
    )
    expect(root.open).toBe(false)
    open()
    const handled = new KeyboardEvent('keydown', {
      key: 'Escape',
      cancelable: true,
      bubbles: true,
    })
    handled.preventDefault()
    document.dispatchEvent(handled)
    expect(root.open).toBe(true)
  })
})
