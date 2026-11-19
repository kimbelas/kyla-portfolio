import { beforeEach, describe, expect, test } from 'vitest'
import { createPlayer, type TrackData } from '../../src/scripts/player'

const tracks: TrackData[] = [
  { id: 'a', title: 'A', src: '/audio/a.mp3', durationSec: 100 },
  { id: 'b', title: 'B', src: '/audio/b.mp3', durationSec: 200 },
]

class FakeAudio {
  src = ''
  currentTime = 0
  duration = Number.NaN
  paused = true
  playResult: 'resolve' | 'reject' = 'resolve'
  private listeners = new Map<string, Set<() => void>>()
  addEventListener(type: string, fn: () => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set())
    this.listeners.get(type)!.add(fn)
  }
  removeEventListener(type: string, fn: () => void) {
    this.listeners.get(type)?.delete(fn)
  }
  dispatchEvent(event: Event) {
    for (const fn of this.listeners.get(event.type) ?? []) fn()
    return true
  }
  play() {
    this.paused = false
    return this.playResult === 'resolve'
      ? Promise.resolve()
      : Promise.reject(new Error('NotSupportedError'))
  }
  pause() {
    this.paused = true
  }
  emit(type: string) {
    this.dispatchEvent(new Event(type))
  }
  /** Delivers an event that was queued while another track's source was loaded. */
  emitFor(id: string, type: string) {
    const current = this.src
    this.src = tracks.find((t) => t.id === id)!.src
    this.emit(type)
    this.src = current
  }
}

let audio: FakeAudio
let p: ReturnType<typeof createPlayer>

beforeEach(() => {
  audio = new FakeAudio()
  p = createPlayer(audio as unknown as HTMLAudioElement, tracks)
})

describe('createPlayer', () => {
  test('starts idle on the first track', () => {
    expect(p.snapshot()).toEqual({
      id: 'a',
      state: 'idle',
      time: 0,
      duration: 100,
    })
  })

  test('play switches source and goes loading then playing', async () => {
    const seen: string[] = []
    p.subscribe((s) => seen.push(s.state))
    const pending = p.play('a')
    expect(audio.src).toBe('/audio/a.mp3')
    expect(p.snapshot()).toMatchObject({ id: 'a', state: 'loading' })
    audio.emit('playing')
    await pending
    expect(p.snapshot().state).toBe('playing')
    expect(seen).toEqual(['loading', 'playing'])
  })

  test('playing a second track pauses the first: one audio element, one source', async () => {
    const first = p.play('a')
    audio.emit('playing')
    await first
    const second = p.play('b')
    expect(audio.src).toBe('/audio/b.mp3')
    expect(p.snapshot()).toMatchObject({ id: 'b', state: 'loading' })
    audio.emit('playing')
    await second
    expect(p.snapshot()).toMatchObject({ id: 'b', state: 'playing' })
  })

  test('ignores events from a superseded track', async () => {
    void p.play('a')
    void p.play('b')
    audio.emitFor('a', 'playing')
    expect(p.snapshot()).toMatchObject({ id: 'b', state: 'loading' })
    audio.emitFor('a', 'error')
    expect(p.snapshot()).toMatchObject({ id: 'b', state: 'loading' })
  })

  test('a rejected play() of a superseded track does not set error', async () => {
    audio.playResult = 'reject'
    const first = p.play('a')
    audio.playResult = 'resolve'
    const second = p.play('b')
    await first
    await second
    expect(p.snapshot()).toMatchObject({ id: 'b', state: 'loading' })
  })

  test('error event sets state error and stops', async () => {
    const pending = p.play('a')
    audio.emit('error')
    await pending
    expect(p.snapshot().state).toBe('error')
    expect(audio.paused).toBe(true)
  })

  test('a rejected play() sets state error', async () => {
    audio.playResult = 'reject'
    await p.play('a')
    expect(p.snapshot().state).toBe('error')
  })

  test('toggle on the current playing track pauses', async () => {
    const pending = p.play('a')
    audio.emit('playing')
    await pending
    await p.toggle('a')
    expect(audio.paused).toBe(true)
    expect(p.snapshot().state).toBe('paused')
    await p.toggle()
    expect(audio.paused).toBe(false)
  })

  test('toggle after an error reloads the same track', async () => {
    const pending = p.play('a')
    audio.emit('error')
    await pending
    audio.src = ''
    void p.toggle('a')
    expect(audio.src).toBe('/audio/a.mp3')
    expect(p.snapshot().state).toBe('loading')
  })

  test('timeupdate and duration events update the snapshot', async () => {
    void p.play('a')
    audio.currentTime = 24
    audio.duration = 102
    audio.emit('durationchange')
    audio.emit('timeupdate')
    expect(p.snapshot()).toMatchObject({ time: 24, duration: 102 })
  })

  test('ended returns to paused at the start', async () => {
    const pending = p.play('a')
    audio.emit('playing')
    await pending
    audio.currentTime = 100
    audio.emit('ended')
    expect(p.snapshot()).toMatchObject({ state: 'paused', time: 0 })
  })

  test('seek clamps to 0..duration', async () => {
    void p.play('a')
    p.seek(-5)
    expect(audio.currentTime).toBe(0)
    p.seek(500)
    expect(audio.currentTime).toBe(100)
    p.seek(42)
    expect(audio.currentTime).toBe(42)
    expect(p.snapshot().time).toBe(42)
  })

  test('subscribe returns an unsubscribe function', () => {
    const seen: string[] = []
    const off = p.subscribe((s) => seen.push(s.state))
    off()
    void p.play('a')
    expect(seen).toEqual([])
  })
})
