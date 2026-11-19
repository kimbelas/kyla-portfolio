export type TrackData = {
  id: string
  title: string
  src: string
  durationSec: number
}

export type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

export type PlayerSnapshot = {
  id: string
  state: PlayerState
  time: number
  duration: number
}

export type Player = {
  play(id: string): Promise<void>
  toggle(id?: string): Promise<void>
  seek(sec: number): void
  snapshot(): PlayerSnapshot
  subscribe(fn: (s: PlayerSnapshot) => void): () => void
}

/**
 * Drives one shared <audio> element. Every `play` takes a new request token and
 * listens through that token only, so late events and promise results from a
 * superseded track can never change the state of the current one.
 */
export function createPlayer(
  audio: HTMLAudioElement,
  tracks: TrackData[],
): Player {
  const byId = new Map(tracks.map((t) => [t.id, t]))
  const listeners = new Set<(s: PlayerSnapshot) => void>()
  let token = 0
  let current = tracks[0]!
  let state: PlayerState = 'idle'
  let time = 0
  let duration = current.durationSec

  const snapshot = (): PlayerSnapshot => ({
    id: current.id,
    state,
    time,
    duration,
  })

  const emit = () => {
    const s = snapshot()
    for (const fn of listeners) fn(s)
  }

  const set = (next: PlayerState) => {
    state = next
    emit()
  }

  // The element still carries the source of the track these events belong to.
  const isCurrentSource = () => audio.src.endsWith(current.src)

  const onEvent = (type: string) => {
    if (!isCurrentSource()) return
    switch (type) {
      case 'playing':
        set('playing')
        break
      case 'waiting':
        if (state === 'playing') set('loading')
        break
      case 'pause':
        if (state === 'playing') set('paused')
        break
      case 'ended':
        audio.currentTime = 0
        time = 0
        set('paused')
        break
      case 'error':
        audio.pause()
        set('error')
        break
      case 'durationchange':
      case 'loadedmetadata':
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          duration = audio.duration
          emit()
        }
        break
      case 'timeupdate':
        time = audio.currentTime
        emit()
        break
    }
  }

  const EVENTS = [
    'playing',
    'waiting',
    'pause',
    'ended',
    'error',
    'durationchange',
    'loadedmetadata',
    'timeupdate',
  ]
  for (const type of EVENTS) audio.addEventListener(type, () => onEvent(type))

  async function start(): Promise<void> {
    const mine = ++token
    set('loading')
    try {
      await audio.play()
    } catch {
      if (mine === token) {
        audio.pause()
        set('error')
      }
    }
  }

  async function play(id: string): Promise<void> {
    const track = byId.get(id)
    if (!track) return
    const sameTrack = track.id === current.id
    if (sameTrack && (state === 'playing' || state === 'loading')) return
    if (sameTrack && state === 'paused') return start()

    audio.pause()
    current = track
    time = 0
    duration = track.durationSec
    audio.src = track.src
    return start()
  }

  async function toggle(id?: string): Promise<void> {
    const target = id ?? current.id
    if (target === current.id && (state === 'playing' || state === 'loading')) {
      token += 1
      audio.pause()
      set('paused')
      return
    }
    return play(target)
  }

  function seek(sec: number): void {
    const clamped = Math.min(Math.max(sec, 0), duration)
    audio.currentTime = clamped
    time = clamped
    emit()
  }

  function subscribe(fn: (s: PlayerSnapshot) => void): () => void {
    listeners.add(fn)
    return () => listeners.delete(fn)
  }

  return { play, toggle, seek, snapshot, subscribe }
}
