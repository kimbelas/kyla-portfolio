const FOCUSABLE = 'a[href], button:not([disabled])'

/**
 * Upgrades the `<details data-menu>` fallback into a managed menu: aria-expanded,
 * focus trap, Escape, scroll lock (`html[data-menu-open]`) and auto-close when the
 * viewport reaches the desktop breakpoint. Returns a disposer.
 */
export function initMenu(
  root: HTMLElement,
  mq: MediaQueryList = window.matchMedia('(min-width: 1101px)'),
): () => void {
  const details = root as HTMLDetailsElement
  const toggle = root.querySelector<HTMLElement>('[data-menu-toggle]')
  const card = root.querySelector<HTMLElement>('[data-menu-card]')
  if (!toggle || !card) return () => {}

  const html = document.documentElement
  const isOpen = () => details.open

  const sync = () => {
    const open = isOpen()
    toggle.setAttribute('role', 'button')
    toggle.setAttribute('aria-expanded', String(open))
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
    html.toggleAttribute('data-menu-open', open)
  }

  const open = () => {
    details.open = true
    sync()
    card.querySelector<HTMLElement>(FOCUSABLE)?.focus()
  }

  const close = (returnFocus: boolean) => {
    if (!isOpen()) return
    details.open = false
    sync()
    if (returnFocus) toggle.focus()
  }

  const onToggle = (e: Event) => {
    e.preventDefault()
    if (isOpen()) close(true)
    else open()
  }

  const onKeydown = (e: KeyboardEvent) => {
    if (!isOpen()) return
    if (e.key === 'Escape') {
      close(true)
      return
    }
    if (e.key !== 'Tab') return
    const items = [toggle, ...card.querySelectorAll<HTMLElement>(FOCUSABLE)]
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (
      e.shiftKey &&
      (active === first || !items.includes(active as HTMLElement))
    ) {
      e.preventDefault()
      last.focus()
    } else if (
      !e.shiftKey &&
      (active === last || !items.includes(active as HTMLElement))
    ) {
      e.preventDefault()
      first.focus()
    }
  }

  const onCardClick = (e: Event) => {
    if ((e.target as Element).closest('a')) close(false)
  }

  const onMedia = (e: { matches: boolean }) => {
    if (e.matches) close(false)
  }

  toggle.addEventListener('click', onToggle)
  card.addEventListener('click', onCardClick)
  document.addEventListener('keydown', onKeydown)
  mq.addEventListener('change', onMedia)
  sync()

  return () => {
    toggle.removeEventListener('click', onToggle)
    card.removeEventListener('click', onCardClick)
    document.removeEventListener('keydown', onKeydown)
    mq.removeEventListener('change', onMedia)
    html.removeAttribute('data-menu-open')
  }
}
