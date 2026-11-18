import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { ArrowDownRight, MapPin, Headphones } from 'lucide-react'
import { hero, site, niches } from '../data/content'
import { ease } from './ui'

function RotatingWord() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % hero.rotating.length), 2600)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="relative inline-flex h-[1.3em] overflow-hidden align-bottom" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.span
          key={hero.rotating[i]}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.55, ease }}
          className="block whitespace-nowrap text-rose-deep"
        >
          {hero.rotating[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default function Hero() {
  const { scrollY } = useScroll()
  const photoY = useTransform(scrollY, [0, 600], [0, -40])
  const scriptX = useTransform(scrollY, [0, 600], [0, 60])

  return (
    <section id="top" className="relative overflow-hidden pt-28 md:pt-36">
      <div className="blueprint pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_30%,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-32 -right-32 h-[34rem] w-[34rem] rounded-full bg-blush blur-3xl" />

      <div className="gutter relative mx-auto grid max-w-7xl items-center gap-14 pb-16 md:pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        {/* Copy */}
        <div className="relative z-10 flex flex-col gap-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="flex flex-wrap items-center gap-3"
          >
            <span className="label text-rose-deep">{hero.eyebrow}</span>
            <span className="inline-flex items-center gap-1.5 text-[0.8rem] text-muted">
              <MapPin size={13} /> {site.location}
            </span>
          </motion.div>

          <div className="relative">
            <motion.span
              aria-hidden
              style={{ x: scriptX }}
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: 1.8, ease, delay: 0.3 }}
              className="pointer-events-none absolute -top-6 right-0 font-script text-[6rem] leading-none text-petal/55 select-none sm:-top-10 sm:right-6 sm:text-[9rem] lg:right-0"
            >
              {site.firstName}
            </motion.span>
            <h1 className="relative font-display text-[2.7rem] leading-[1.02] font-medium text-ink sm:text-6xl xl:text-[4.6rem]">
              {hero.headline.map((line, i) => (
                <span key={line} className="block overflow-hidden pb-1">
                  <motion.span
                    className="block"
                    initial={{ y: '105%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1, ease, delay: 0.15 + i * 0.12 }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="font-display text-2xl text-ink italic sm:text-[1.9rem]"
          >
            <span className="text-muted">Your partner in </span>
            <RotatingWord />
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.7 }}
            className="max-w-[54ch] text-[1.05rem] leading-relaxed text-muted"
          >
            {hero.intro}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.85 }}
            className="flex flex-wrap items-center gap-3"
          >
            <a
              href="#portfolio"
              className="group inline-flex items-center gap-2 rounded-full bg-rose-deep px-7 py-3.5 text-[0.82rem] tracking-[0.14em] text-paper uppercase shadow-[0_10px_30px_-10px_rgb(148_80_93/0.6)] transition hover:-translate-y-0.5 hover:bg-ink"
            >
              View my work
              <ArrowDownRight size={16} className="transition group-hover:rotate-[-45deg]" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper/70 px-7 py-3.5 text-[0.82rem] tracking-[0.14em] text-ink uppercase transition hover:border-rose hover:text-rose-deep"
            >
              Work with me
            </a>
            <a href="#calls" className="inline-flex items-center gap-2 px-3 py-3.5 text-[0.82rem] tracking-[0.14em] text-rose-deep uppercase underline decoration-petal underline-offset-4 transition hover:text-ink">
              <Headphones size={16} /> Hear my calls
            </a>
          </motion.div>
        </div>

        {/* Portrait in an arched frame */}
        <motion.div
          style={{ y: photoY }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease, delay: 0.2 }}
          className="relative mx-auto w-full max-w-[25rem]"
        >
          {/* drafting dimension line */}
          <div className="absolute top-8 -left-7 hidden h-[calc(100%-4rem)] flex-col items-center sm:flex" aria-hidden>
            <span className="h-2 w-px bg-rose" />
            <span className="w-px flex-1 bg-rose/60" />
            <span className="label my-2 [writing-mode:vertical-rl] rotate-180 text-[0.62rem] text-rose-deep">BS Architecture · 2025</span>
            <span className="w-px flex-1 bg-rose/60" />
            <span className="h-2 w-px bg-rose" />
          </div>

          <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-t-[999px] rounded-b-3xl border border-rose/50" aria-hidden />
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-3xl bg-blush shadow-[0_40px_80px_-30px_rgb(148_80_93/0.45)]">
            <img src={site.photo} alt="Portrait of Kyla Belas" className="h-full w-full object-cover object-top" fetchpriority="high" />
            <div className="absolute inset-0 bg-gradient-to-t from-rose-deep/20 via-transparent to-transparent" />
          </div>

          {hero.badges.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
              transition={{
                opacity: { delay: 1 + i * 0.2, duration: 0.6 },
                scale: { delay: 1 + i * 0.2, duration: 0.6 },
                y: { delay: 1.6 + i * 0.5, duration: 5, repeat: Infinity, ease: 'easeInOut' },
              }}
              className={`absolute rounded-2xl border border-line bg-paper/90 px-4 py-3 shadow-lg backdrop-blur ${
                i === 0 ? 'bottom-10 -left-4 sm:-left-12' : 'top-16 -right-3 sm:-right-10'
              }`}
            >
              <p className="font-display text-lg leading-tight text-ink">{b.label}</p>
              <p className="label mt-0.5 text-[0.62rem] text-rose-deep">{b.sub}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Niches marquee */}
      <div className="relative border-y border-line bg-paper/60 py-5">
        <div className="marquee flex overflow-hidden">
          <motion.div
            className="flex shrink-0 gap-12 pr-12"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
          >
            {[...niches, ...niches].map((c, i) => (
              <span key={i} className="flex shrink-0 items-center gap-12 font-display text-xl whitespace-nowrap text-muted italic">
                {c}
                <span className="h-1.5 w-1.5 rotate-45 bg-rose" aria-hidden />
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
