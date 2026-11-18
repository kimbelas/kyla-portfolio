/**
 * Marks the nav link whose section crosses the middle of the viewport with
 * aria-current="true". Links point at `#id` or `/#id`. Returns a disposer.
 */
export function initActiveSection(links: HTMLAnchorElement[]): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {}

  const byId = new Map<string, HTMLAnchorElement[]>()
  for (const link of links) {
    const id = (link.getAttribute('href') ?? '').split('#')[1]
    if (!id) continue
    byId.set(id, [...(byId.get(id) ?? []), link])
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const id = (entry.target as HTMLElement).id
        for (const link of links) link.removeAttribute('aria-current')
        for (const link of byId.get(id) ?? [])
          link.setAttribute('aria-current', 'true')
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )

  for (const id of byId.keys()) {
    const section = document.getElementById(id)
    if (section) observer.observe(section)
  }
  return () => observer.disconnect()
}
