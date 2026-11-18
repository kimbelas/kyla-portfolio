import { motion } from 'framer-motion'
import { tools, skills } from '../data/content'
import { SectionHead, Reveal, ease } from './ui'

export default function Tools() {
  return (
    <section id="tools" className="relative overflow-hidden bg-blush/45 py-24 md:py-32">
      <div className="blueprint pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="gutter relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="flex flex-col gap-10">
          <SectionHead sheet="A-07" eyebrow="Tools & skills" title="My" script="toolkit" intro="The platforms I use every day to run pipelines, projects, books and designs." />
          <Reveal>
            <p className="label mb-4 text-rose-deep">Core skills</p>
            <div className="flex flex-wrap gap-x-2 gap-y-2.5">
              {skills.map((s) => (
                <span key={s} className="font-display text-[1.2rem] text-ink after:ml-2 after:text-rose after:content-['·'] last:after:content-['']">
                  {s}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {tools.map((g, gi) => (
            <Reveal key={g.group} delay={gi * 0.08} className="rounded-[1.75rem] border border-line bg-paper p-7">
              <p className="label text-rose-deep">{g.group}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {g.items.map((t, i) => (
                  <motion.li
                    key={t.name}
                    initial={{ opacity: 0.4, scale: 0.92 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease, delay: i * 0.03 }}
                    whileHover={{ y: -3 }}
                    className={`rounded-full border px-4 py-2 text-[0.9rem] transition-colors ${
                      t.note ? 'border-rose-deep bg-rose-deep text-paper' : 'border-line bg-ivory text-ink hover:border-rose hover:text-rose-deep'
                    }`}
                  >
                    {t.name}
                    {t.note && <span className="ml-2 text-[0.7rem] tracking-widest text-petal uppercase">{t.note}</span>}
                  </motion.li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
