// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { initLightbox } from '../../src/scripts/lightbox'

let container: HTMLElement
let dispose: () => void

const links = () => [...container.querySelectorAll<HTMLAnchorElement>('a')]
const dialog = () => document.querySelector<HTMLDialogElement>('dialog')!
const count = () => document.querySelector('[data-lightbox-count]')!.textContent
const key = (k: string) =>
  dialog().dispatchEvent(
    new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }),
  )

beforeEach(() => {
  // jsdom does not implement showModal/close.
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
  document.body.innerHTML = `<div id="c">${Array.from(
    { length: 9 },
    (_, i) =>
      `<figure><a href="/img/${i}.webp" data-lightbox><img alt="Piece ${i}" src="/t/${i}.webp"></a><figcaption><em>Title ${i}</em></figcaption></figure>`,
  ).join('')}</div>`
  container = document.getElementById('c')!
  dispose = initLightbox(container)
})

afterEach(() => dispose())

describe('initLightbox', () => {
  test('click opens dialog on the clicked item with caption "3 / 9"', () => {
    const click = new MouseEvent('click', { bubbles: true, cancelable: true })
    links()[2]!.querySelector('img')!.dispatchEvent(click)
    expect(click.defaultPrevented).toBe(true)
    expect(dialog().open).toBe(true)
    expect(count()).toBe('3 / 9')
    const img = dialog().querySelector('img')!
    expect(new URL(img.src).pathname).toBe('/img/2.webp')
    expect(img.alt).toBe('Piece 2')
    expect(document.querySelector('[data-lightbox-title]')!.textContent).toBe(
      'Title 2',
    )
  })

  test('ArrowRight and ArrowLeft wrap around', () => {
    links()[8]!.click()
    expect(count()).toBe('9 / 9')
    key('ArrowRight')
    expect(count()).toBe('1 / 9')
    key('ArrowLeft')
    expect(count()).toBe('9 / 9')
  })

  test('closing returns focus to the trigger', () => {
    const trigger = links()[4]!
    trigger.click()
    key('Escape')
    expect(dialog().open).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })

  test('Escape is marked as handled so document listeners ignore it', () => {
    links()[0]!.click()
    const e = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    dialog().dispatchEvent(e)
    expect(e.defaultPrevented).toBe(true)
  })

  test('uses one dialog across containers and removes it on last dispose', () => {
    const other = document.createElement('div')
    document.body.append(other)
    const d2 = initLightbox(other)
    expect(document.querySelectorAll('dialog')).toHaveLength(1)
    d2()
    expect(document.querySelectorAll('dialog')).toHaveLength(1)
    dispose()
    expect(document.querySelectorAll('dialog')).toHaveLength(0)
    dispose = initLightbox(container)
  })
})
