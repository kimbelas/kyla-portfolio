import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Headphones, ArrowUpRight } from 'lucide-react'
import { recordings } from '../data/content'
import { SectionHead, Reveal, ease } from './ui'

const fmt = (t) => {
  if (!isFinite(t)) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

// Animated bars that move only while a track is playing.
function Bars({ active, className = '' }) {
  return (
    <span className={`flex h-4 items-end gap-[3px] ${className}`} aria-hidden>
      {[0.5, 1, 0.7, 0.9].map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-current"
          animate={active ? { height: ['30%', `${h * 100}%`, '45%', '100%', '30%'] } : { height: '30%' }}
          transition={active ? { duration: 1 + i * 0.15, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
        />
      ))}
    </span>
  )
}

function Seek({ value, max, onSeek, dark }) {
  const pct = max ? (value / max) * 100 : 0
  return (
    <div className="group relative h-5 w-full">
      <div className={`absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full ${dark ? 'bg-paper/15' : 'bg-line'}`} />
      <div className={`absolute top-1/2 h-1 -translate-y-1/2 rounded-full ${dark ? 'bg-petal' : 'bg-rose-deep'}`} style={{ width: `${pct}%` }} />
      <div
        className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow transition group-hover:scale-110 ${dark ? 'bg-petal' : 'bg-rose-deep'}`}
        style={{ left: `${pct}%` }}
      />
      <input
        type="range"
        min={0}
        max={max || 0}
        step={0.1}
        value={value}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label="Seek"
      />
    </div>
  )
}

export default function Recordings() {
  const all = useMemo(() => [recordings.featured, ...recordings.tracks], [])
  const groups = useMemo(() => ['All', ...new Set(recordings.tracks.map((t) => t.group))], [])
  const audioRef = useRef(null)
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [dur, setDur] = useState(all[0].duration)
  const [filter, setFilter] = useState('All')

  const track = all[current]
  const list = recordings.tracks.map((t, i) => ({ ...t, idx: i + 1 })).filter((t) => filter === 'All' || t.group === filter)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onTime = () => setTime(a.currentTime)
    const onMeta = () => setDur(a.duration || track.duration)
    const onEnd = () => setPlaying(false)
    const onPause = () => setPlaying(false)
    const onPlay = () => setPlaying(true)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('ended', onEnd)
    a.addEventListener('pause', onPause)
    a.addEventListener('play', onPlay)
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('ended', onEnd)
      a.removeEventListener('pause', onPause)
      a.removeEventListener('play', onPlay)
    }
  }, [track])

  const toggle = (idx = current) => {
    const a = audioRef.current
    if (idx !== current) {
      setCurrent(idx)
      setTime(0)
      setDur(all[idx].duration)
      a.src = all[idx].src
      a.play().catch(() => {})
      return
    }
    if (a.paused) a.play().catch(() => {})
    else a.pause()
  }

  const seek = (v) => {
    audioRef.current.currentTime = v
    setTime(v)
  }

  const isFeatured = current === 0

  return (
    <section id="calls" className="relative overflow-hidden bg-ink py-24 text-paper md:py-32">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="pointer-events-none absolute -top-40 right-0 h-[30rem] w-[30rem] rounded-full bg-rose-deep/40 blur-3xl" />
      <audio ref={audioRef} src={all[0].src} preload="metadata" />

      <div className="gutter relative mx-auto max-w-7xl">
        <Reveal className="flex flex-col gap-4">
          <div className="flex items-center gap-3 text-petal">
            <span className="label tabular-nums">A-03</span>
            <span className="h-px w-10 bg-petal/60" />
            <span className="label text-paper/60">Voice & calls</span>
          </div>
          <h2 className="font-display text-[2.4rem] leading-[1.05] font-medium sm:text-5xl md:text-[3.6rem]">
            Hear me <span className="font-script text-[1.15em] font-normal text-petal">on the call</span>
          </h2>
          <p className="max-w-[60ch] text-[1.02rem] leading-relaxed text-paper/65">{recordings.intro}</p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          {/* Now playing / featured */}
          <Reveal className="relative flex flex-col justify-between gap-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-deep to-[#6f3a45] p-8 md:p-10 lg:sticky lg:top-28 lg:min-h-[22rem]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label flex items-center gap-2 text-petal">
                  <Headphones size={14} /> {isFeatured ? 'Start here' : 'Now playing'}
                </p>
                <p className="mt-3 font-display text-3xl leading-tight md:text-4xl">{track.title}</p>
                <p className="mt-1 text-[0.9rem] text-paper/70">
                  {track.group}
                  {track.note && <span className="ml-2 inline-block rounded-full bg-paper/15 px-2.5 py-0.5 text-[0.75rem] text-petal">{track.note}</span>}
                </p>
              </div>
              <Bars active={playing} className="mt-1 h-6 text-petal" />
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => toggle()}
                  className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full bg-paper text-rose-deep shadow-[0_20px_40px_-15px_rgb(0_0_0/0.5)] transition hover:scale-105"
                  aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
                >
                  {playing && <span className="absolute inset-0 animate-ping rounded-full bg-paper/30" />}
                  {playing ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Seek value={time} max={dur} onSeek={seek} dark />
                  <div className="flex justify-between text-[0.78rem] text-paper/60 tabular-nums">
                    <span>{fmt(time)}</span>
                    <span>{fmt(dur)}</span>
                  </div>
                </div>
              </div>
              {!isFeatured && (
                <button onClick={() => toggle(0)} className="self-start text-[0.78rem] tracking-[0.14em] text-petal uppercase underline underline-offset-4">
                  Play my self introduction
                </button>
              )}
            </div>
          </Reveal>

          {/* Playlist */}
          <Reveal delay={0.08} className="flex flex-col gap-5 rounded-[2rem] border border-paper/10 bg-paper/[0.04] p-5 md:p-7">
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
              {groups.map((g) => (
                <button
                  key={g}
                  onClick={() => setFilter(g)}
                  className={`relative shrink-0 rounded-full px-4 py-2 text-[0.8rem] transition ${filter === g ? 'text-ink' : 'text-paper/60 hover:text-paper'}`}
                >
                  {filter === g && <motion.span layoutId="call-filter" className="absolute inset-0 rounded-full bg-petal" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                  <span className="relative">{g}</span>
                </button>
              ))}
            </div>

            <ul className="flex flex-col">
              {list.map((t, i) => {
                const on = current === t.idx
                return (
                  <motion.li
                    key={t.src}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease, delay: i * 0.03 }}
                  >
                    <button
                      onClick={() => toggle(t.idx)}
                      className={`group flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition ${on ? 'bg-paper/10' : 'hover:bg-paper/5'}`}
                      aria-label={on && playing ? `Pause ${t.title}` : `Play ${t.title}`}
                    >
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition ${
                          on ? 'bg-petal text-ink' : 'bg-paper/10 text-paper group-hover:bg-petal group-hover:text-ink'
                        }`}
                      >
                        {on && playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-[0.98rem] ${on ? 'text-petal' : 'text-paper'}`}>{t.title}</span>
                        <span className="label text-[0.6rem] text-paper/45">{t.group}</span>
                      </span>
                      {on && playing ? <Bars active className="text-petal" /> : null}
                      <span className="w-12 shrink-0 text-right text-[0.8rem] text-paper/50 tabular-nums">{fmt(t.duration)}</span>
                    </button>
                  </motion.li>
                )
              })}
            </ul>

            <a
              href={recordings.more.href}
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex items-center gap-2 self-start px-3 text-[0.8rem] tracking-[0.14em] text-petal uppercase hover:text-paper"
            >
              {recordings.more.label} <ArrowUpRight size={15} />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
