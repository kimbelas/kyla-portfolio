import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import { about } from '../data/content'
import { Reveal, SectionHead, ease } from './ui'

export default function About() {
  return (
    <section id="about" className="gutter relative mx-auto max-w-7xl py-24 md:py-32">
      <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <div className="flex flex-col gap-10">
          <SectionHead sheet="A-01" eyebrow="About me" title="From blueprints to" script="business operations" />

          <Reveal className="relative overflow-hidden rounded-3xl border border-line bg-paper p-7">
            <div className="blueprint absolute inset-0 opacity-60" aria-hidden />
            <div className="relative flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blush text-rose-deep">
                <GraduationCap size={22} />
              </span>
              <div>
                <p className="label text-rose-deep tabular-nums">{about.education.years}</p>
                <p className="mt-1 font-display text-2xl leading-tight text-ink">{about.education.degree}</p>
                <p className="mt-1 text-muted">{about.education.school}</p>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8">
            {about.facts.map((f, i) => (
              <Reveal key={f.label} delay={i * 0.08} className="border-t border-line pt-4">
                <p className="font-display text-5xl leading-none text-rose-deep tabular-nums">{f.value}</p>
                <p className="mt-2 text-[0.9rem] leading-snug text-muted">{f.label}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-12">
          <Reveal className="flex flex-col gap-5 text-[1.05rem] leading-[1.8] text-ink/85">
            {about.paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? 'first-letter:float-left first-letter:mr-3 first-letter:font-script first-letter:text-[4.2rem] first-letter:leading-[0.8] first-letter:text-rose-deep' : ''}>
                {p}
              </p>
            ))}
          </Reveal>

          <div>
            <Reveal>
              <p className="label mb-6 text-rose-deep">Career journey</p>
            </Reveal>
            <ol className="relative flex flex-col gap-6 border-l border-line pl-7">
              {about.journey.map((j, i) => (
                <motion.li
                  key={j.year}
                  initial={{ opacity: 0.4, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.7, ease, delay: i * 0.05 }}
                  className="relative"
                >
                  <span className="absolute top-1.5 -left-[2.06rem] h-3 w-3 rounded-full border-2 border-rose bg-ivory" />
                  <span className="font-display text-xl text-rose-deep tabular-nums">{j.year}</span>
                  <p className="text-muted">{j.text}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
