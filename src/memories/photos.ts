import type { Memory } from '@/types'

// Todas las fotos de un recuerdo, en orden. Los recuerdos antiguos solo tienen `foto`
// (una sola); los nuevos guardan la lista completa en `fotos`.
export function memoryPhotos(memory: Memory): string[] {
  if (memory.fotos && memory.fotos.length > 0) return memory.fotos
  return memory.foto ? [memory.foto] : []
}
