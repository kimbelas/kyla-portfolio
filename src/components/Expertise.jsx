import { motion } from 'framer-motion'
import { HardHat, Ruler, CalendarCheck, Workflow, PhoneCall, Sparkles } from 'lucide-react'
import { expertise } from '../data/content'
import { SectionHead, ease } from './ui'

const icons = {
  construction: HardHat,
  architecture: Ruler,
  executive: CalendarCheck,
  operations: Workflow,
  sales: PhoneCall,
  marketing: Sparkles,
}

export default function Expertise() {
  return (
    <section id="expertise" className="relative bg-blush/45 py-24 md:py-32">
      <div className="gutter mx-auto max-w-7xl">
        <SectionHead
          sheet="A-02"
          eyebrow="Expertise"
          title="One person, the whole"
          script="workflow"
          intro="Construction sites, CRMs, calendars and content calendars. I connect the parts of a business that usually live in different hands."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {expertise.map((e, i) => {
            const Icon = icons[e.key]
            return (
              <motion.article
                key={e.key}
                initial={{ opacity: 0.4, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease, delay: (i % 3) * 0.08 }}
                whileHover={{ y: -6 }}
                className="group relative flex flex-col gap-5 overflow-hidden rounded-[1.75rem] border border-line bg-paper p-7 transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgb(148_80_93/0.45)]"
              >
                <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-blush transition-transform duration-700 group-hover:scale-[1.8]" aria-hidden />
                <div className="relative flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ivory text-rose-deep ring-1 ring-line transition group-hover:bg-rose-deep group-hover:text-paper">
                    <Icon size={22} strokeWidth={1.6} />
                  </span>
                </div>
                <div className="relative">
                  <h3 className="font-display text-[1.75rem] leading-tight text-ink">{e.title}</h3>
                  <p className="mt-2 text-muted">{e.summary}</p>
                </div>
                <ul className="relative mt-auto flex flex-col gap-2 border-t border-line pt-5">
                  {e.points.map((p) => (
                    <li key={p} className="flex gap-3 text-[0.93rem] text-ink/80">
                      <span className="mt-2 h-1 w-1 shrink-0 rotate-45 bg-rose" />
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
