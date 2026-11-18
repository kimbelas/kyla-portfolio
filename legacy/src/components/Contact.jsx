import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Linkedin, FolderOpen, Briefcase, BadgeCheck, Copy, Check, Send, Loader2 } from 'lucide-react'
import { site, contact } from '../data/content'
import { SectionHead, Reveal, ease } from './ui'

const fieldCls =
  'peer w-full rounded-2xl border border-line bg-paper px-5 pt-6 pb-2.5 text-ink outline-none transition placeholder-transparent focus:border-rose-deep focus:ring-4 focus:ring-petal/40'
const labelCls =
  'pointer-events-none absolute top-2 left-5 text-[0.7rem] tracking-[0.14em] text-muted uppercase transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[0.95rem] peer-placeholder-shown:tracking-normal peer-placeholder-shown:normal-case peer-focus:top-2 peer-focus:text-[0.7rem] peer-focus:tracking-[0.14em] peer-focus:uppercase peer-focus:text-rose-deep'

function Field({ id, label, type = 'text', textarea, ...rest }) {
  const Tag = textarea ? 'textarea' : 'input'
  return (
    <div className="relative">
      <Tag id={id} name={id} type={textarea ? undefined : type} placeholder={label} className={`${fieldCls} ${textarea ? 'min-h-40 resize-y' : ''}`} {...rest} />
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
    </div>
  )
}

export default function Contact() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | mailto | error
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.getElementById('contact-email')
      if (el) window.getSelection()?.selectAllChildren(el)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    if (site.formspreeId) {
      setStatus('sending')
      try {
        const res = await fetch(`https://formspree.io/f/${site.formspreeId}`, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error()
        form.reset()
        setStatus('sent')
      } catch {
        setStatus('error')
      }
      return
    }
    // No form service configured yet: hand the message to the visitor's email app.
    const subject = encodeURIComponent(`Portfolio inquiry from ${data.name}${data.company ? ` (${data.company})` : ''}`)
    const body = encodeURIComponent(`${data.message}\n\n${data.name}\n${data.email}`)
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`
    setStatus('mailto')
  }

  const links = [
    { icon: Linkedin, label: 'LinkedIn', value: 'linkedin.com/in/kcbelas', href: site.links.linkedin },
    { icon: Briefcase, label: 'Upwork', value: 'Upwork profile', href: site.links.upwork },
    { icon: BadgeCheck, label: 'OnlineJobs.ph', value: 'OnlineJobs.ph profile', href: site.links.onlinejobs },
    { icon: FolderOpen, label: 'Portfolio', value: 'Google Drive portfolio', href: site.links.drive },
  ]

  return (
    <section id="contact" className="relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-blush blur-3xl" />
      <div className="gutter relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="flex flex-col gap-10">
          <SectionHead sheet="A-08" eyebrow="Contact" title={contact.heading} intro={contact.text} />

          <Reveal className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-5">
              <span className="flex min-w-0 items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blush text-rose-deep">
                  <Mail size={18} />
                </span>
                <span className="min-w-0">
                  <span className="label block text-[0.62rem] text-muted">Email</span>
                  <span id="contact-email" className="block truncate font-display text-xl text-ink select-all">
                    {site.email}
                  </span>
                </span>
              </span>
              <button onClick={copy} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-rose-deep transition hover:bg-blush" aria-label="Copy email address">
                {copied ? <Check size={17} /> : <Copy size={17} />}
              </button>
            </div>
            {links.map(({ icon: Icon, label, value, href }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" className="group flex items-center gap-4 rounded-2xl border border-line bg-paper/70 p-5 transition hover:border-rose hover:bg-paper">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blush text-rose-deep transition group-hover:bg-rose-deep group-hover:text-paper">
                  <Icon size={18} />
                </span>
                <span>
                  <span className="label block text-[0.62rem] text-muted">{label}</span>
                  <span className="block font-display text-xl text-ink">{value}</span>
                </span>
              </a>
            ))}
          </Reveal>
        </div>

        <Reveal delay={0.1} className="relative rounded-[2rem] border border-line bg-paper/80 p-6 shadow-[0_40px_80px_-50px_rgb(148_80_93/0.5)] backdrop-blur sm:p-10">
          <p className="font-script text-4xl text-rose-deep">Say hello</p>
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Your name" required autoComplete="name" />
              <Field id="email" label="Email address" type="email" required autoComplete="email" />
            </div>
            <Field id="company" label="Company (optional)" autoComplete="organization" />
            <Field id="message" label="How can I help?" textarea required />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="group mt-2 inline-flex items-center justify-center gap-2 self-start rounded-full bg-rose-deep px-8 py-4 text-[0.82rem] tracking-[0.14em] text-paper uppercase transition hover:-translate-y-0.5 hover:bg-ink disabled:opacity-60"
            >
              {status === 'sending' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="transition group-hover:translate-x-0.5" />}
              {status === 'sending' ? 'Sending' : 'Send message'}
            </button>
          </form>
          <AnimatePresence>
            {status !== 'idle' && status !== 'sending' && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease }}
                className={`mt-5 rounded-2xl px-5 py-4 text-[0.92rem] ${status === 'error' ? 'bg-rose/15 text-rose-deep' : 'bg-blush/70 text-ink'}`}
                role="status"
              >
                {status === 'sent' && 'Thank you! Your message is on its way. I’ll get back to you soon.'}
                {status === 'mailto' && `Your email app should open with the message ready to send. If it didn’t, copy ${site.email} and write to me directly.`}
                {status === 'error' && `The message couldn’t be sent. Please try again, or email ${site.email} directly.`}
              </motion.p>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  )
}
