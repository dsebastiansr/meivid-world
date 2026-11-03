import { create } from 'zustand'

// Solo guarda si el sonido está silenciado (se recuerda entre visitas).
const KEY = 'mei-david-world:muted'

function readMuted() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

interface AudioState {
  muted: boolean
  toggleMuted: () => void
}

export const useAudioStore = create<AudioState>((set, get) => ({
  muted: readMuted(),
  toggleMuted: () => {
    const muted = !get().muted
    try {
      localStorage.setItem(KEY, muted ? '1' : '0')
    } catch {
      /* sin guardado: solo dura esta visita */
    }
    set({ muted })
  },
}))
