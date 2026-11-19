const SELECTOR = 'a[data-lightbox]'

type Shared = {
  dialog: HTMLDialogElement
  img: HTMLImageElement
  count: HTMLElement
  title: HTMLElement
  prev: HTMLButtonElement
  next: HTMLButtonElement
  close: HTMLButtonElement
  state: { links: HTMLAnchorElement[]; index: number; trigger: Element | null }
}

let shared: Shared | null = null
let users = 0

const NAV_BUTTON =
  'inline-flex size-11 items-center justify-center rounded-full bg-paper text-ink'

function button(label: string, text: string, extra = ''): HTMLButtonElement {
  const el = document.createElement('button')
  el.type = 'button'
  el.setAttribute('aria-label', label)
  el.className = `${NAV_BUTTON} ${extra}`.trim()
  el.textContent = text
  return el
}

function build(): Shared {
  const dialog = document.createElement('dialog')
  dialog.setAttribute('data-lightbox-dialog', '')
  dialog.setAttribute('aria-label', 'Image viewer')
  dialog.className =
    'm-auto max-h-[100dvh] max-w-[100vw] bg-transparent p-3 text-ivory backdrop:bg-ink/90 open:flex open:flex-col open:items-center open:gap-3'
  const img = document.createElement('img')
  img.className = 'max-h-[78dvh] max-w-full rounded-2xl bg-paper object-contain'
  img.alt = ''
  const meta = document.createElement('div')
  meta.className = 'flex flex-col items-center gap-1 text-center'
  const title = document.createElement('p')
  title.setAttribute('data-lightbox-heading', '')
  title.className = 'font-display text-lg italic'
  const count = document.createElement('p')
  count.setAttribute('data-lightbox-count', '')
  count.className = 'text-xs tracking-[0.16em] text-on-dark-muted'
  meta.append(title, count)
  const controls = document.createElement('div')
  controls.className = 'flex items-center gap-3'
  const prev = button('Previous image', '\u2039')
  const close = button('Close image viewer', '\u00d7')
  const next = button('Next image', '\u203a')
  controls.append(prev, close, next)
  dialog.append(img, meta, controls)
  document.body.append(dialog)
  return {
    dialog,
    img,
    count,
    title,
    prev,
    next,
    close,
    state: { links: [], index: 0, trigger: null },
  }
}

function show(s: Shared, index: number) {
  const { links } = s.state
  const i = (index + links.length) % links.length
  const link = links[i]!
  const thumb = link.querySelector('img')
  s.state.index = i
  s.img.src = link.href
  // A text link has no thumbnail; its title then describes the image.
  s.img.alt = thumb ? thumb.alt : (link.dataset.lightboxTitle ?? '')
  s.title.textContent =
    link.dataset.lightboxTitle ||
    thumb?.alt ||
    link.getAttribute('aria-label') ||
    ''
  s.count.textContent = `${i + 1} / ${links.length}`
}

/**
 * Opens `a[data-lightbox]` links inside `container` in one shared modal dialog.
 * Without JavaScript the links navigate to the full image. Returns a disposer.
 */
export function initLightbox(container: HTMLElement): () => void {
  if (!shared) {
    shared = build()
    wire(shared)
  }
  users += 1
  const s = shared
  const { dialog } = s
  const links = () => [
    ...container.querySelectorAll<HTMLAnchorElement>(SELECTOR),
  ]

  const onClick = (e: Event) => {
    const link = (e.target as Element).closest<HTMLAnchorElement>(SELECTOR)
    if (!link || !container.contains(link)) return
    // Keep open-in-new-tab and similar modified clicks native.
    const m = e as MouseEvent
    if (m.metaKey || m.ctrlKey || m.shiftKey || m.altKey || m.button !== 0)
      return
    e.preventDefault()
    s.state.links = links()
    s.state.trigger = link
    show(s, s.state.links.indexOf(link))
    if (!dialog.open) dialog.showModal()
  }

  container.addEventListener('click', onClick)
  return () => {
    container.removeEventListener('click', onClick)
    users -= 1
    if (users === 0 && shared) {
      if (shared.dialog.open) shared.dialog.close()
      shared.dialog.remove()
      shared = null
    }
  }
}

/** Dialog-level behavior is wired once, when the shared dialog is built. */
function wire(s: Shared) {
  const { dialog } = s
  const step = (d: number) => show(s, s.state.index + d)
  s.prev.addEventListener('click', () => step(-1))
  s.next.addEventListener('click', () => step(1))
  s.close.addEventListener('click', () => dialog.close())
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close()
  })
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') step(1)
    else if (e.key === 'ArrowLeft') step(-1)
    else if (e.key === 'Escape') {
      // Handled here so the keydown is marked as consumed for document listeners.
      e.preventDefault()
      dialog.close()
    }
  })
  dialog.addEventListener('close', () => {
    s.img.removeAttribute('src')
    const trigger = s.state.trigger
    s.state.trigger = null
    if (trigger instanceof HTMLElement) trigger.focus()
  })
}
