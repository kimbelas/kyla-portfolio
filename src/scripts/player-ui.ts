import { formatDuration } from '../lib/collections'
import { createPlayer, type PlayerSnapshot, type TrackData } from './player'

const STATUS: Record<PlayerSnapshot['state'], string> = {
  idle: 'Start here',
  loading: 'Loading',
  playing: 'Now playing',
  paused: 'Paused',
  error: 'Now playing',
}

const isActive = (s: PlayerSnapshot) =>
  s.state === 'playing' || s.state === 'loading'

/** "Play x" becomes "Pause x" and "play x" becomes "pause x", keeping the rest. */
function pauseLabel(idle: string): string {
  return idle.replace(/\bplay\b/i, (m) => (m === 'Play' ? 'Pause' : 'pause'))
}

/** Writes only on change so the polite live region does not re-announce. */
function setText(el: Element | null, text: string) {
  if (el && el.textContent !== text) el.textContent = text
}

function setIcons(el: Element, active: boolean) {
  el.querySelector('[data-icon="play"]')?.classList.toggle('hidden', active)
  el.querySelector('[data-icon="pause"]')?.classList.toggle('hidden', !active)
}

/**
 * Binds the page to the single shared player: track buttons, the nav "Hear me"
 * controls, seek inputs, filter chips and the now-playing region.
 */
export function initPlayerUI(doc: Document): void {
  const audio = doc.getElementById('player-audio') as HTMLAudioElement | null
  const data = doc.getElementById('track-data')
  if (!audio || !data?.textContent) return

  const tracks = JSON.parse(data.textContent) as TrackData[]
  const byId = new Map(tracks.map((t) => [t.id, t]))
  const featured = tracks[0]
  if (!featured) return
  const player = createPlayer(audio, tracks)

  const trackButtons = [...doc.querySelectorAll<HTMLElement>('[data-track-id]')]
  for (const button of trackButtons) {
    button.addEventListener(
      'click',
      () => void player.toggle(button.dataset.trackId),
    )
  }

  const featuredControls = [
    ...doc.querySelectorAll<HTMLElement>('[data-play-featured]'),
  ]
  for (const control of featuredControls) {
    control.dataset.labelIdle = control.getAttribute('aria-label') ?? ''
    control.addEventListener('click', (e) => {
      e.preventDefault()
      void player.toggle(featured.id)
    })
  }

  const npToggle = doc.querySelector<HTMLElement>('[data-np-toggle]')
  npToggle?.addEventListener('click', () => void player.toggle())
  const status = doc.querySelector('[data-np-status]')
  const title = doc.querySelector('[data-np-title]')
  const error = doc.querySelector<HTMLElement>('[data-np-error]')
  const time = doc.querySelector('[data-np-time]')
  const note = doc.querySelector<HTMLElement>('[data-np-note]')
  const clip = doc.querySelector('[data-wave-clip]')
  const clipFull = Number(clip?.getAttribute('data-full') ?? 0)

  const seeks = [...doc.querySelectorAll<HTMLInputElement>('[data-seek]')]
  for (const input of seeks) {
    input.addEventListener('input', () => player.seek(Number(input.value)))
  }

  for (const chip of doc.querySelectorAll<HTMLElement>('[data-filter]')) {
    chip.addEventListener('click', () => {
      const value = chip.dataset.filter
      for (const other of doc.querySelectorAll<HTMLElement>('[data-filter]')) {
        other.setAttribute('aria-pressed', String(other === chip))
      }
      for (const item of doc.querySelectorAll<HTMLElement>('[data-group]')) {
        item.hidden = value !== 'all' && item.dataset.group !== value
      }
    })
  }

  const render = (s: PlayerSnapshot) => {
    const track = byId.get(s.id)!
    const active = isActive(s)
    const elapsed = Math.floor(s.time)
    const total = Math.round(s.duration)

    for (const button of trackButtons) {
      const mine = button.dataset.trackId === s.id
      const playing = mine && active
      const name = byId.get(button.dataset.trackId ?? '')?.title ?? ''
      button.dataset.state = mine ? s.state : 'idle'
      button.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${name}`)
      setIcons(button, playing)
    }

    const featuredActive = active && s.id === featured.id
    for (const control of featuredControls) {
      const idle = control.dataset.labelIdle ?? ''
      control.setAttribute(
        'aria-label',
        featuredActive ? pauseLabel(idle) : idle,
      )
      setIcons(control, featuredActive)
    }

    if (npToggle) {
      npToggle.setAttribute(
        'aria-label',
        `${active ? 'Pause' : 'Play'} ${track.title}`,
      )
      setIcons(npToggle, active)
    }
    setText(status, STATUS[s.state])
    setText(title, track.title)
    if (error) error.hidden = s.state !== 'error'
    if (note) note.hidden = note.dataset.noteFor !== s.id
    setText(time, `${formatDuration(elapsed)} / ${formatDuration(total)}`)
    if (clip && clipFull > 0) {
      const ratio = s.duration > 0 ? Math.min(s.time / s.duration, 1) : 0
      clip.setAttribute('width', String(Math.round(ratio * clipFull)))
    }
    for (const input of seeks) {
      input.disabled = s.state === 'idle'
      input.max = String(total)
      input.value = String(elapsed)
      input.setAttribute(
        'aria-valuetext',
        `${formatDuration(elapsed)} of ${formatDuration(total)}`,
      )
    }
  }

  player.subscribe(render)
  render(player.snapshot())
}
