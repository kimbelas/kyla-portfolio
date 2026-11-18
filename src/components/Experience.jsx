import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, animate, useInView } from 'framer-motion'
import { Plus, Minus, TrendingUp } from 'lucide-react'
import { experience, growth, projectClients } from '../data/content'
import { SectionHead, Reveal, ease } from './ui'

function Count({ to, decimals = 0, prefix = '', suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [v, setV] = useState(to)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, to, { duration: 1.6, ease, onUpdate: setV })
    return () => c.stop()
  }, [inView, to])
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </span>
  )
}

function Growth() {
  return (
    <Reveal className="relative overflow-hidden rounded-[2rem] bg-ink p-7 text-paper md:p-12">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label flex items-center gap-2 text-petal">
            <TrendingUp size={14} /> Achievement
          </p>
          <h3 className="mt-3 font-display text-3xl leading-tight md:text-[2.6rem]">{growth.heading}</h3>
        </div>
        <p className="max-w-sm text-[0.85rem] text-paper/60">{growth.note}</p>
      </div>
      <div className="relative mt-10 grid gap-8 md:grid-cols-3">
        {growth.metrics.map((m) => {
          const pct = Math.min(100, (m.before / m.after) * 100)
          return (
            <div key={m.label} className="flex flex-col gap-4 border-t border-paper/15 pt-5">
              <p className="label text-paper/60">{m.label}</p>
              <p className="font-display text-5xl leading-none text-petal">
                <Count to={m.after} decimals={m.decimals} prefix={m.prefix} suffix={m.suffix} />
              </p>
              <div className="flex flex-col gap-2 text-[0.8rem]">
                <div className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-paper/50">July 2025</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper/10">
                    <motion.div
                      className="h-full rounded-full bg-paper/40"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-paper/70 tabular-nums">
                    {m.prefix}
                    {m.before}
                    {m.suffix}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-paper/50">July 2026</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper/10">
                    <motion.div
                      className="h-full rounded-full bg-petal"
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, ease, delay: 0.2 }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-petal tabular-nums">
                    {m.prefix}
                    {m.after}
                    {m.suffix}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Reveal>
  )
}

function Role({ r, open, onToggle, i }) {
  return (
    <motion.li
      initial={{ opacity: 0.4, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease, delay: i * 0.04 }}
      className={`rounded-[1.5rem] border transition-colors duration-500 ${open ? 'border-rose/50 bg-paper shadow-[0_24px_50px_-30px_rgb(148_80_93/0.5)]' : 'border-line bg-paper/60 hover:bg-paper'}`}
    >
      <button onClick={onToggle} className="flex w-full items-start gap-5 p-6 text-left md:items-center md:p-7" aria-expanded={open}>
        <div className="grid min-w-0 flex-1 gap-2 md:grid-cols-[1fr_auto] md:items-center md:gap-8">
          <div className="min-w-0">
            <p className="font-display text-[1.55rem] leading-tight text-ink">{r.role}</p>
            <p className="mt-1 text-muted">
              <span className="text-rose-deep">{r.company}</span> · {r.place}
            </p>
          </div>
          <p className="label text-[0.66rem] text-muted md:text-right">{r.period}</p>
        </div>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition ${open ? 'bg-rose-deep text-paper' : 'bg-blush text-rose-deep'}`}>
          {open ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease }} className="overflow-hidden">
            <ul className="grid gap-2.5 px-6 pb-7 md:px-7 lg:grid-cols-2 lg:gap-x-10">
              {r.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-[0.95rem] leading-relaxed text-ink/80">
                  <span className="mt-2.5 h-1 w-1 shrink-0 rotate-45 bg-rose" />
                  {h}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  )
}

export default function Experience() {
  const [open, setOpen] = useState(0)
  return (
    <section id="experience" className="relative bg-gradient-to-b from-ivory via-blush/35 to-ivory py-24 md:py-32">
      <div className="gutter mx-auto flex max-w-7xl flex-col gap-14">
        <SectionHead
          sheet="A-05"
          eyebrow="Experience & achievements"
          title="Work that"
          script="moves the needle"
          intro="From closing sales on the phone to running a construction company’s back office, every role added a layer to how I support a business."
        />

        <Growth />

        <ol className="flex flex-col gap-3">
          {experience.map((r, i) => (
            <Role key={r.company + r.role} r={r} i={i} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </ol>

        <div>
          <Reveal>
            <p className="label mb-6 text-rose-deep">Project-based clients</p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {projectClients.map((c, i) => (
              <Reveal key={c.name} delay={(i % 4) * 0.06} className="flex flex-col gap-2 rounded-2xl border border-line bg-paper/80 p-6">
                <p className="label text-[0.62rem] text-rose-deep">{c.role}</p>
                <p className="font-display text-[1.4rem] leading-tight text-ink">{c.name}</p>
                <p className="text-[0.8rem] text-muted">{c.place}</p>
                <p className="mt-1 text-[0.92rem] leading-relaxed text-ink/75">{c.work}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
