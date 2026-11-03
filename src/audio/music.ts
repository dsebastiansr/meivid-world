import gsap from 'gsap'
import { HOME_SONG, type Track } from './songs'
import { useAudioStore } from './useAudioStore'

// ─────────────────────────────────────────────────────────────
// LA MÚSICA: una canción a la vez, con fundido al cambiar.
// Los navegadores no dejan sonar nada hasta que la persona toca la página,
// así que se pide la canción desde ya y empieza sola en el primer toque/tecla.
// ─────────────────────────────────────────────────────────────

const VOLUME = 0.45
const FADE = 1.2 // segundos

const players = new Map<string, HTMLAudioElement>()
let current: HTMLAudioElement | null = null
let wanted: Track = { src: HOME_SONG, start: 0 }
let unlocked = false

function playerFor(src: string) {
  let audio = players.get(src)
  if (!audio) {
    audio = new Audio(src)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0
    players.set(src, audio)
  }
  return audio
}

function fadeOut(audio: HTMLAudioElement, keepPosition: boolean) {
  gsap.killTweensOf(audio)
  gsap.to(audio, {
    volume: 0,
    duration: FADE,
    onComplete: () => {
      audio.pause()
      // Las canciones de recuerdo vuelven a empezar en su segundo; la de la isla sigue donde iba
      if (!keepPosition) audio.currentTime = 0
    },
  })
}

function fadeIn(audio: HTMLAudioElement, start: number, resume: boolean) {
  gsap.killTweensOf(audio)
  if (!resume) {
    const seek = () => {
      audio.currentTime = start
    }
    if (audio.readyState >= 1) seek()
    else audio.addEventListener('loadedmetadata', seek, { once: true })
  }
  audio.play().catch(() => {
    /* todavía bloqueado: se reintenta en el siguiente toque */
  })
  gsap.to(audio, { volume: useAudioStore.getState().muted ? 0 : VOLUME, duration: FADE })
}

function apply() {
  if (!unlocked) return
  const next = playerFor(wanted.src)
  if (next === current) return
  if (current) fadeOut(current, current === playerFor(HOME_SONG))
  current = next
  fadeIn(next, wanted.start, wanted.src === HOME_SONG)
}

// Pide qué debe sonar (se aplica cuando el navegador lo permita)
export function playTrack(track: Track) {
  // Mismo archivo con otro segundo de inicio (otro recuerdo con la misma canción): se reinicia
  if (current && track.src === wanted.src && track.start !== wanted.start) current = null
  wanted = track
  apply()
}

// Silencia / reactiva sin cortar la canción
export function applyMuted(muted: boolean) {
  if (!current) return
  gsap.killTweensOf(current)
  gsap.to(current, { volume: muted ? 0 : VOLUME, duration: 0.3 })
}

export function startMusic() {
  playerFor(HOME_SONG) // empieza a descargar la de la isla
  const unlock = () => {
    unlocked = true
    // Si la canción ya estaba elegida pero el navegador la había bloqueado, se reanuda
    if (current?.paused) fadeIn(current, wanted.start, wanted.src === HOME_SONG)
    else apply()
  }
  for (const type of ['pointerdown', 'keydown']) window.addEventListener(type, unlock, { passive: true })
}
