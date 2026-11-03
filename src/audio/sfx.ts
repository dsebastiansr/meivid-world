import { useAudioStore } from './useAudioStore'

// ─────────────────────────────────────────────────────────────
// LOS EFECTOS DE SONIDO: no son archivos, se fabrican al momento con WebAudio
// (un tono suave o un soplido de ruido, con una curva de volumen).
// Para cambiar cómo suena algo, edita su receta abajo; para usar uno: sfx.nombre()
// ─────────────────────────────────────────────────────────────

let ctx: AudioContext | null = null
let noise: AudioBuffer | null = null

function context() {
  if (!ctx) {
    ctx = new AudioContext()
    // 1 segundo de ruido blanco, reutilizable para pasos y papel
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

// Las primeras veces el navegador no deja sonar hasta que haya un toque
export function unlockSfx() {
  try {
    context()
  } catch {
    /* sin WebAudio: el juego sigue en silencio */
  }
}

interface ToneOptions {
  freq: number
  to?: number // la frecuencia se desliza hasta aquí
  type?: OscillatorType
  gain?: number
  attack?: number
  duration: number
  delay?: number
}

function tone({ freq, to, type = 'sine', gain = 0.2, attack = 0.005, duration, delay = 0 }: ToneOptions) {
  if (useAudioStore.getState().muted) return
  const c = context()
  const t = c.currentTime + delay
  const osc = c.createOscillator()
  const amp = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + duration)
  amp.gain.setValueAtTime(0.0001, t)
  amp.gain.linearRampToValueAtTime(gain, t + attack)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(amp).connect(c.destination)
  osc.start(t)
  osc.stop(t + duration + 0.02)
}

interface NoiseOptions {
  gain?: number
  duration: number
  freq: number // centro del filtro
  q?: number
  sweepTo?: number // el filtro se desliza hasta aquí
  delay?: number
}

function puff({ gain = 0.2, duration, freq, q = 1, sweepTo, delay = 0 }: NoiseOptions) {
  if (useAudioStore.getState().muted) return
  const c = context()
  const t = c.currentTime + delay
  const src = c.createBufferSource()
  src.buffer = noise
  const f = c.createBiquadFilter()
  f.type = 'bandpass'
  f.Q.value = q
  f.frequency.setValueAtTime(freq, t)
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + duration)
  const amp = c.createGain()
  amp.gain.setValueAtTime(0.0001, t)
  amp.gain.linearRampToValueAtTime(gain, t + 0.008)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  src.connect(f).connect(amp).connect(c.destination)
  // Cada vez empieza en un punto distinto del ruido: dos pasos seguidos no suenan idénticos
  src.start(t, Math.random() * 0.5, duration + 0.05)
}

const jitter = (base: number, spread = 0.12) => base * (1 + (Math.random() * 2 - 1) * spread)

export const sfx = {
  // Pasos sobre pasto: un roce + un golpecito grave
  step(run = false) {
    puff({ freq: jitter(run ? 900 : 700), q: 0.8, duration: run ? 0.07 : 0.09, gain: run ? 0.16 : 0.12 })
    tone({ freq: jitter(110), to: 70, gain: run ? 0.1 : 0.07, duration: 0.07 })
  },
  // Al caer de un salto
  land() {
    puff({ freq: 500, q: 0.7, duration: 0.14, gain: 0.2 })
    tone({ freq: 120, to: 55, gain: 0.16, duration: 0.14 })
  },
  // Cuando te acercas a un recuerdo: dos notitas
  near() {
    tone({ freq: 880, gain: 0.12, duration: 0.22, type: 'triangle' })
    tone({ freq: 1320, gain: 0.1, duration: 0.3, type: 'triangle', delay: 0.09 })
  },
  // Abrir el libro: roce de cuero + acorde suave
  bookOpen() {
    puff({ freq: 500, sweepTo: 1800, q: 0.6, duration: 0.5, gain: 0.16 })
    tone({ freq: 523, gain: 0.07, duration: 0.7, delay: 0.1, type: 'triangle' })
    tone({ freq: 659, gain: 0.07, duration: 0.7, delay: 0.16, type: 'triangle' })
    tone({ freq: 784, gain: 0.07, duration: 0.8, delay: 0.22, type: 'triangle' })
  },
  bookClose() {
    puff({ freq: 1500, sweepTo: 350, q: 0.6, duration: 0.35, gain: 0.16 })
    tone({ freq: 160, to: 90, gain: 0.14, duration: 0.2, delay: 0.25 })
  },
  // Pasar de hoja: soplido de papel
  page() {
    puff({ freq: 2200, sweepTo: 5000, q: 0.5, duration: 0.42, gain: 0.14 })
  },
  // Cualquier botón de la interfaz
  click() {
    tone({ freq: 720, to: 520, gain: 0.1, duration: 0.07, type: 'triangle' })
  },
  // Editor
  place() {
    tone({ freq: 330, to: 220, gain: 0.2, duration: 0.14 })
    puff({ freq: 800, q: 0.8, duration: 0.08, gain: 0.1 })
  },
  remove() {
    tone({ freq: 400, to: 130, gain: 0.16, duration: 0.2, type: 'triangle' })
  },
  select() {
    tone({ freq: 660, gain: 0.09, duration: 0.09, type: 'triangle' })
  },
  rotate() {
    tone({ freq: jitter(500, 0.02), gain: 0.06, duration: 0.05, type: 'triangle' })
  },
  toggle(on: boolean) {
    tone({ freq: on ? 520 : 780, gain: 0.1, duration: 0.1, type: 'triangle' })
    tone({ freq: on ? 780 : 520, gain: 0.1, duration: 0.14, type: 'triangle', delay: 0.08 })
  },
}
