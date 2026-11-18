import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { nav, site } from '../data/content'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    nav.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => {
      window.removeEventListener('scroll', onScroll)
      obs.disconnect()
    }
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-all duration-500 ${
        scrolled ? 'bg-ivory/85 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="gutter mx-auto flex h-16 max-w-7xl items-center justify-between md:h-20">
        <a href="#top" className="font-script text-[2rem] leading-none text-rose-deep transition hover:text-ink" aria-label="Kyla Belas, back to top">
          {site.name}
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {nav.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className={`relative text-[0.82rem] tracking-[0.12em] uppercase transition ${
                active === n.id ? 'text-rose-deep' : 'text-muted hover:text-ink'
              }`}
            >
              {n.label}
              {active === n.id && (
                <motion.span layoutId="nav-dot" className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-rose-deep" />
              )}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="hidden rounded-full border border-rose-deep px-5 py-2.5 text-[0.8rem] tracking-[0.14em] text-rose-deep uppercase transition hover:bg-rose-deep hover:text-paper lg:inline-block"
        >
          Let’s talk
        </a>

        <button
          className="grid h-11 w-11 place-items-center rounded-full text-ink lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <motion.div style={{ scaleX: progress }} className="h-px origin-left bg-rose" />

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="gutter overflow-hidden bg-ivory/95 backdrop-blur-md lg:hidden"
            aria-label="Mobile"
          >
            <ul className="flex flex-col gap-1 py-4">
              {nav.map((n, i) => (
                <motion.li key={n.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <a href={`#${n.id}`} onClick={() => setOpen(false)} className="block py-2.5 font-display text-2xl text-ink">
                    {n.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
