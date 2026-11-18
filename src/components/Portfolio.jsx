import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, ArrowUpRight } from 'lucide-react'
import { portfolio, portfolioCategories, moreWork } from '../data/content'
import { SectionHead, Lightbox, Reveal, ease } from './ui'

const PAGE = 12

export default function Portfolio() {
  const [cat, setCat] = useState('all')
  const [limit, setLimit] = useState(PAGE)
  const [index, setIndex] = useState(null)

  const items = useMemo(() => (cat === 'all' ? portfolio : portfolio.filter((p) => p.category === cat)), [cat])
  const shown = items.slice(0, limit)
  const counts = useMemo(() => {
    const c = { all: portfolio.length }
    portfolio.forEach((p) => (c[p.category] = (c[p.category] || 0) + 1))
    return c
  }, [])

  return (
    <section id="portfolio" className="gutter mx-auto max-w-7xl py-24 md:py-32">
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <SectionHead
          sheet="A-04"
          eyebrow="Portfolio"
          title="Selected"
          script="work"
          intro="Campaigns I designed for clients, remodeling plans from 2A Construction, and interior renders. Tap any piece to view it full size."
        />
      </div>

      {/* Filters */}
      <div className="no-scrollbar -mx-1 mt-10 flex gap-2 overflow-x-auto px-1 pb-2" role="tablist" aria-label="Portfolio categories">
        {portfolioCategories.map((c) => (
          <button
            key={c.key}
            role="tab"
            aria-selected={cat === c.key}
            onClick={() => {
              setCat(c.key)
              setLimit(PAGE)
            }}
            className={`relative shrink-0 rounded-full px-5 py-2.5 text-[0.82rem] tracking-wide transition ${
              cat === c.key ? 'text-paper' : 'text-muted hover:text-ink'
            }`}
          >
            {cat === c.key && (
              <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-rose-deep" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
            )}
            <span className="relative">
              {c.label} <span className="tabular-nums opacity-60">{counts[c.key] || 0}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((p, i) => (
            <motion.button
              layout
              key={p.src}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5, ease }}
              onClick={() => setIndex(i)}
              className="group relative aspect-[4/3.3] overflow-hidden rounded-[1.5rem] border border-line bg-paper text-left"
              aria-label={`Open ${p.title}`}
            >
              <img
                src={p.src}
                alt={p.title}
                loading="lazy"
                className={`h-full w-full transition duration-[1.2s] ease-out group-hover:scale-[1.06] ${
                  p.category === 'architecture' ? 'object-cover' : 'object-cover object-top'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent opacity-80 transition duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                <div className="min-w-0 translate-y-1 transition duration-500 group-hover:translate-y-0">
                  <p className="label text-[0.62rem] text-petal">{p.tag}</p>
                  <p className="mt-1 font-display text-[1.35rem] leading-tight text-paper">{p.title}</p>
                </div>
                <span className="grid h-10 w-10 shrink-0 scale-75 place-items-center rounded-full bg-paper/90 text-rose-deep opacity-0 transition duration-500 group-hover:scale-100 group-hover:opacity-100">
                  <Maximize2 size={16} />
                </span>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      {items.length > limit && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setLimit((l) => l + PAGE)}
            className="rounded-full border border-rose-deep px-7 py-3 text-[0.8rem] tracking-[0.14em] text-rose-deep uppercase transition hover:bg-rose-deep hover:text-paper"
          >
            Show more · <span className="tabular-nums">{items.length - limit}</span> left
          </button>
        </div>
      )}

      {/* More on Drive */}
      <Reveal className="mt-16 grid gap-4 rounded-[1.75rem] border border-line bg-blush/40 p-6 sm:grid-cols-2 lg:grid-cols-3 md:p-8">
        {moreWork.map((m) => (
          <a
            key={m.label}
            href={m.href}
            target="_blank"
            rel="noreferrer"
            className="group flex items-start justify-between gap-3 rounded-2xl bg-paper p-5 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <span>
              <span className="block font-display text-xl text-ink">{m.label}</span>
              <span className="mt-1 block text-[0.88rem] text-muted">{m.sub}</span>
            </span>
            <ArrowUpRight size={18} className="mt-1 shrink-0 text-rose-deep transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        ))}
      </Reveal>

      <Lightbox items={shown} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </section>
  )
}
