import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { testimonials, reviewArchive, upwork, site } from '../data/content'
import { SectionHead, Lightbox, Reveal, Stars, ease } from './ui'

export default function Testimonials() {
  const [i, setI] = useState(0)
  const [dir, setDir] = useState(1)
  const [paused, setPaused] = useState(false)
  const [shot, setShot] = useState(null)
  const t = testimonials[i]

  const go = (d) => {
    setDir(d)
    setI((v) => (v + d + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    if (paused || shot !== null) return
    const id = setInterval(() => go(1), 7000)
    return () => clearInterval(id)
  }, [paused, shot])

  const openShot = (src) => setShot(reviewArchive.findIndex((r) => r.src === src))

  return (
    <section id="testimonials" className="gutter mx-auto max-w-7xl py-24 md:py-32">
      <SectionHead
        align="center"
        sheet="A-06"
        eyebrow="Testimonials"
        title="Kind words from"
        script="clients"
        intro="Quoted word for word from reviews and messages in my portfolio. Every quote links to its original screenshot."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div
          className="relative overflow-hidden rounded-[2rem] border border-line bg-paper px-6 pt-14 pb-8 sm:px-12 md:px-16"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <span className="pointer-events-none absolute top-0 left-6 font-display text-[9rem] leading-none text-blush select-none" aria-hidden>
            “
          </span>
          <div className="relative min-h-[17rem] sm:min-h-[15rem]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.figure
                key={i}
                custom={dir}
                initial={{ opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.55, ease }}
                className="flex flex-col gap-6"
              >
                {t.stars && <Stars value={t.stars} />}
                <blockquote className={`font-display leading-snug text-ink ${t.quote.length > 220 ? 'text-xl sm:text-[1.6rem]' : 'text-2xl sm:text-[2.1rem]'}`}>
                  {t.quote}
                </blockquote>
                <figcaption className="flex flex-wrap items-center justify-between gap-4">
                  <span>
                    <span className="block font-script text-3xl text-rose-deep">{t.name}</span>
                    <span className="label text-[0.64rem] text-muted">{t.context}</span>
                  </span>
                  <button
                    onClick={() => openShot(t.screenshot)}
                    className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[0.8rem] text-muted transition hover:border-rose hover:text-rose-deep"
                  >
                    <ImageIcon size={14} /> See original
                  </button>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-6">
            <div className="flex flex-wrap gap-1.5">
              {testimonials.map((_, k) => (
                <button
                  key={k}
                  onClick={() => {
                    setDir(k > i ? 1 : -1)
                    setI(k)
                  }}
                  className="grid h-6 place-items-center"
                  aria-label={`Show testimonial ${k + 1}`}
                >
                  <span className={`block h-1.5 rounded-full transition-all duration-500 ${k === i ? 'w-7 bg-rose-deep' : 'w-1.5 bg-petal'}`} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => go(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink transition hover:bg-rose-deep hover:text-paper" aria-label="Previous testimonial">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => go(1)} className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink transition hover:bg-rose-deep hover:text-paper" aria-label="Next testimonial">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          <Reveal className="flex flex-col justify-between gap-6 rounded-[2rem] bg-rose-deep p-8 text-paper">
            <p className="label text-petal">Upwork</p>
            <div>
              <p className="font-display text-6xl leading-none tabular-nums">{upwork.rating}</p>
              <Stars value={upwork.rating} className="mt-3 !text-petal" />
            </div>
            <div>
              <p className="font-display text-2xl">{upwork.job}</p>
              <p className="text-[0.85rem] text-paper/70">{upwork.period}</p>
            </div>
            <a href={site.links.upwork} target="_blank" rel="noreferrer" className="text-[0.8rem] tracking-[0.14em] uppercase underline decoration-petal underline-offset-4 hover:text-petal">
              View Upwork profile
            </a>
          </Reveal>
          <Reveal className="flex flex-col justify-between gap-4 rounded-[2rem] border border-line bg-blush/50 p-8">
            <p className="label text-rose-deep">Review archive</p>
            <p className="font-display text-2xl leading-snug text-ink">
              <span className="tabular-nums">{reviewArchive.length}</span> original screenshots, unedited.
            </p>
            <button onClick={() => setShot(0)} className="self-start text-[0.8rem] tracking-[0.14em] text-rose-deep uppercase underline underline-offset-4">
              Browse all
            </button>
          </Reveal>
        </div>
      </div>

      {/* Screenshot strip */}
      <div className="no-scrollbar -mx-5 mt-8 flex snap-x gap-4 overflow-x-auto px-5 pb-2">
        {reviewArchive.map((r, k) => (
          <button
            key={r.src}
            onClick={() => setShot(k)}
            className="group relative h-44 w-56 shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-paper"
            aria-label={`Open ${r.title}`}
          >
            <img src={r.src} alt={r.title} loading="lazy" className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-3 text-left text-[0.78rem] text-paper">{r.title}</span>
          </button>
        ))}
      </div>

      <Lightbox items={reviewArchive} index={shot} onClose={() => setShot(null)} onIndex={setShot} />
    </section>
  )
}
