import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

const ease = [0.22, 1, 0.36, 1]

// Gentle scroll reveal. Starts partly visible so nothing is ever hidden.
export function Reveal({ children, delay = 0, y = 26, className = '', as = 'div' }) {
  const M = motion[as]
  return (
    <M
      className={className}
      initial={{ opacity: 0.4, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </M>
  )
}

export function SectionHead({ sheet, eyebrow, title, script, intro, align = 'left' }) {
  const center = align === 'center'
  return (
    <Reveal className={`flex flex-col gap-4 ${center ? 'items-center text-center' : ''}`}>
      <div className="flex items-center gap-3 text-rose-deep">
        <span className="label tabular-nums">{sheet}</span>
        <span className="h-px w-10 bg-rose" />
        <span className="label text-muted">{eyebrow}</span>
      </div>
      <h2 className="font-display text-[2.4rem] leading-[1.05] font-medium text-ink sm:text-5xl md:text-[3.6rem]">
        {title}{' '}
        {script && <span className="font-script text-[1.15em] font-normal text-rose-deep">{script}</span>}
      </h2>
      {intro && <p className={`max-w-[60ch] text-[1.02rem] leading-relaxed text-muted ${center ? 'mx-auto' : ''}`}>{intro}</p>}
    </Reveal>
  )
}

export function Stars({ value = 5, className = '' }) {
  return (
    <span className={`inline-flex gap-0.5 text-rose ${className}`} aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5" fill={i < Math.round(value) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2">
          <path d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.7 4.9 17.4l1-5.6-4.1-4 5.7-.8z" />
        </svg>
      ))}
    </span>
  )
}

// Full-screen image viewer with keyboard and swipe-free arrow navigation.
export function Lightbox({ items, index, onClose, onIndex }) {
  const open = index !== null && index >= 0
  const item = open ? items[index] : null

  const go = useCallback(
    (d) => onIndex((i) => (i + d + items.length) % items.length),
    [items.length, onIndex],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, go, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm sm:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
        >
          <button
            onClick={onClose}
            className="absolute top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] grid h-11 w-11 place-items-center rounded-full bg-paper/10 text-paper transition hover:bg-paper/20"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          {items.length > 1 && (
            <>
              <button
                onClick={(e) => (e.stopPropagation(), go(-1))}
                className="absolute left-[max(0.75rem,env(safe-area-inset-left))] grid h-11 w-11 place-items-center rounded-full bg-paper/10 text-paper transition hover:bg-paper/20"
                aria-label="Previous"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={(e) => (e.stopPropagation(), go(1))}
                className="absolute right-[max(0.75rem,env(safe-area-inset-right))] grid h-11 w-11 place-items-center rounded-full bg-paper/10 text-paper transition hover:bg-paper/20"
                aria-label="Next"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
          <motion.figure
            key={item.src}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease }}
            className="flex max-h-full max-w-5xl flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={item.src} alt={item.title} className="max-h-[78vh] w-auto max-w-full rounded-lg object-contain shadow-2xl" />
            <figcaption className="text-center text-paper">
              <span className="font-display text-xl">{item.title}</span>
              {item.tag && <span className="label ml-3 text-petal">{item.tag}</span>}
              <span className="label ml-3 text-paper/50 tabular-nums">
                {index + 1} / {items.length}
              </span>
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { ease }
