import { seedMemories } from '@/data/memories'
import type { Memory } from '@/types'

// ─────────────────────────────────────────────────────────────
// LAS CANCIONES (archivos en public/songs/)
//
// HOME es la música de la isla: suena siempre que no haya un recuerdo abierto
// y también en los recuerdos que no tengan canción asignada.
// Para asignar una canción a un recuerdo: en memories.json agrega
//   "cancion": "/songs/mi-cancion.m4a", "cancionInicio": 2   (segundo donde empieza)
// o elígela en el formulario del recuerdo (modo editar).
// ─────────────────────────────────────────────────────────────

export const HOME_SONG = '/songs/home.m4a'

export const SONGS = [
  { src: '/songs/halloween.m4a', label: 'Halloween' },
  { src: '/songs/playa.m4a', label: 'Playa' },
  { src: '/songs/concierto.m4a', label: 'Concierto' },
  { src: HOME_SONG, label: 'Home (la de la isla)' },
]

export interface Track {
  src: string
  start: number // segundo en el que empieza
}

// Qué canción suena para un recuerdo. Si el tuyo (guardado en el navegador) no tiene canción
// pero es uno de los de fábrica, usa la de fábrica; si no, la de la isla.
export function trackFor(memory: Memory | null | undefined): Track {
  if (!memory) return { src: HOME_SONG, start: 0 }
  const own = memory.cancion ? memory : seedMemories.find((m) => m.id === memory.id)
  if (own?.cancion) return { src: own.cancion, start: own.cancionInicio ?? 0 }
  return { src: HOME_SONG, start: 0 }
}
