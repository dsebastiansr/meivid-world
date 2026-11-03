// Tipos de objeto que pueden guardar un recuerdo.
// Si agregas uno nuevo, regístralo también en src/memories/objects/index.ts
export type MemoryType = 'banca' | 'buzon' | 'foto' | 'flor' | 'calabaza' | 'calabaza2' | 'sillas' | 'tocadiscos' | 'radio'

export interface Memory {
  id: string
  titulo: string
  fecha: string // formato AAAA-MM-DD
  texto: string
  foto: string // la primera foto (ruta dentro de /public, ej: "/memories/mi-foto.jpg", o una imagen guardada)
  fotos?: string[] // todas las fotos del recuerdo, en orden. Si falta, se usa solo `foto`
  posicion: [number, number, number] // [x, y, z] en la isla (y = 0 es el pasto)
  rotacion?: number // giro en grados (opcional)
  tipo: MemoryType
  cancion?: string // canción del recuerdo (ruta en /public/songs, ver src/audio/songs.ts). Si falta, suena la de la isla
  cancionInicio?: number // segundo en el que empieza la canción al abrir el recuerdo
}

// Una pieza de decoración colocada en la isla (fogata, árbol, cerca…).
// `kind` es la familia (clave de src/data/catalog.ts) y `variant` cuál de sus variantes
// (normal, grande, retorcido…); la altura sale del terreno.
export interface PlacedProp {
  id: string
  kind: string
  variant?: string
  x: number
  z: number
  rotation: number // grados
}
